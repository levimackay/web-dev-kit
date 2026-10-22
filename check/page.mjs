import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const widths = [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
];

const noWebgl = ["--disable-webgl", "--disable-webgl2", "--disable-3d-apis"];

export async function launch(args = []) {
  try {
    return await chromium.launch({ args });
  } catch {
    try {
      return await chromium.launch({ channel: "chrome", args });
    } catch {
      throw new Error("No browser found. Run `npx playwright install chromium` in the kit's check folder.");
    }
  }
}

async function walk(page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 600) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page
    .waitForFunction(() => [...document.images].every((img) => img.complete), null, { timeout: 5000 })
    .catch(() => {});
  await page.waitForTimeout(200);
}

function inspect() {
  const vw = document.documentElement.clientWidth;
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  };
  const describe = (el) => {
    const parts = [];
    for (let node = el; node && node !== document.body && parts.length < 3; node = node.parentElement) {
      const cls = typeof node.className === "string" && node.className.trim().split(/\s+/)[0];
      parts.unshift(node.tagName.toLowerCase() + (node.id ? `#${node.id}` : cls ? `.${cls}` : ""));
    }
    return parts.join(" > ");
  };
  const clipped = (el) => {
    for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.position === "fixed") return true;
      if (style.overflowX !== "visible") return true;
    }
    return getComputedStyle(el).position === "fixed";
  };

  const wide = [...document.body.querySelectorAll("*")].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && (r.right > vw + 1 || r.left < -1) && !clipped(el) && visible(el);
  });
  const outermost = wide.filter((el) => !wide.includes(el.parentElement)).slice(0, 3).map(describe);

  const textNodes = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!parent || parent.closest("script, style, noscript, pre, code, kbd, samp, textarea, svg")) continue;
    if (!node.textContent.trim() || !visible(parent)) continue;
    textNodes.push(node.textContent.replace(/\s+/g, " "));
  }

  const small = [...document.querySelectorAll("p, li, dd, blockquote")]
    .filter((el) => visible(el) && el.textContent.trim().length >= 30 && parseFloat(getComputedStyle(el).fontSize) < 16)
    .map((el) => `${parseFloat(getComputedStyle(el).fontSize)}px "${el.textContent.trim().slice(0, 40)}"`);

  const images = [...document.images].filter(visible).map((img) => ({
    src: img.currentSrc || img.src,
    complete: img.complete,
    natural: img.naturalWidth,
    shown: img.getBoundingClientRect().width,
    svg: /\.svg(\?|$)/.test(img.currentSrc || img.src),
  }));

  const firstFamily = (el) => getComputedStyle(el).fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "");
  const fonts = [...new Set([...document.querySelectorAll("h1, h2, h3, p, a, button")].filter(visible).map(firstFamily))];

  const ids = new Set([...document.querySelectorAll("[id]")].map((el) => el.id));
  const missingAnchors = [...document.querySelectorAll('a[href^="#"]')]
    .map((a) => decodeURIComponent(a.getAttribute("href").slice(1)))
    .filter((id) => id && !ids.has(id));

  const links = [...document.querySelectorAll("a[href]")]
    .map((a) => a.href)
    .filter((href) => /^https?:/.test(href))
    .map((href) => href.split("#")[0]);

  const canvases = [...document.querySelectorAll("canvas")]
    .filter((c) => visible(c) && c.getBoundingClientRect().top < innerHeight && c.getBoundingClientRect().width > 50)
    .map((c) => {
      const r = c.getBoundingClientRect();
      return { x: r.x, y: r.y, width: Math.min(r.width, vw - r.x), height: Math.min(r.height, innerHeight - r.y) };
    });

  const footerText = (document.querySelector("footer") ?? document.body).textContent.toLowerCase();

  return {
    overflow: document.documentElement.scrollWidth - vw,
    outermost,
    text: textNodes,
    small,
    images,
    fonts,
    missingAnchors,
    links,
    canvases,
    h1: document.querySelectorAll("h1").length,
    title: document.title.trim(),
    description: document.querySelector('meta[name="description"]')?.content.trim() ?? "",
    lang: document.documentElement.lang,
    generator: Boolean(document.querySelector('meta[name="generator"]')),
    legal: { privacy: footerText.includes("privacy"), terms: footerText.includes("terms") },
  };
}

function hiddenOnScreen() {
  for (const animation of document.getAnimations()) {
    try {
      animation.finish();
    } catch {
      // infinite animations cannot finish and do not decide visibility here
    }
  }
  const opacity = (el) => {
    let value = 1;
    for (let node = el; node; node = node.parentElement) value *= parseFloat(getComputedStyle(node).opacity);
    return value;
  };
  return [...document.querySelectorAll("h1, h2, h3, p, a, button, img")]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
    })
    .filter((el) => opacity(el) < 0.05 || getComputedStyle(el).visibility === "hidden")
    .map((el) => (el.textContent.trim() || el.getAttribute("alt") || el.tagName.toLowerCase()).slice(0, 40));
}

async function spread(page, clip) {
  const png = (await page.screenshot({ clip })).toString("base64");
  return page.evaluate(async (data) => {
    const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
    const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0);
    const d = ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
    let sum = 0;
    let squares = 0;
    let n = 0;
    for (let i = 0; i < d.length; i += 16) {
      const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      sum += l;
      squares += l * l;
      n += 1;
    }
    const mean = sum / n;
    return Math.sqrt(Math.max(0, squares / n - mean * mean));
  }, png);
}

const bannedFonts = new Set(
  [
    "inter",
    "inter variable",
    "geist",
    "geist sans",
    "geist mono",
    "space grotesk",
    "roboto",
    "arial",
    "helvetica",
    "helvetica neue",
    "system-ui",
    "-apple-system",
    "blinkmacsystemfont",
    "segoe ui",
    "sans-serif",
    "serif",
    "jetbrains mono",
    "ibm plex mono",
    "ibm plex sans",
    "newsreader",
    "gloock",
    "anton",
    "bodoni moda",
    "outfit",
    "hanken grotesk",
    "bricolage grotesque",
    "poppins",
    "montserrat",
    "dm sans",
    "manrope",
    "plus jakarta sans",
  ].map((f) => f.toLowerCase()),
);

const copyRules = [
  { rule: "dashes", level: "fail", pattern: /.{0,30}[–—].{0,30}/, why: "em or en dash" },
  { rule: "punctuation", level: "warn", pattern: /.{0,30}[a-z];\s+[a-z].{0,30}/i, why: "semicolon in prose" },
  { rule: "punctuation", level: "warn", pattern: /.{0,30}[a-z]: [a-z].{0,30}/, why: "colon in the middle of a sentence" },
  { rule: "punctuation", level: "warn", pattern: /.{0,30}\w!(\s|$).{0,10}/, why: "exclamation mark" },
  {
    rule: "emoji",
    level: "warn",
    pattern: /.{0,20}(?![©®™])(\p{Extended_Pictographic}|[✓✔]).{0,20}/u,
    why: "emoji or check mark character",
  },
];

const junk = /.{0,20}(\[object [A-Z]\w*\]|\{\{\s*[\w.]+\s*\}\}).{0,20}/;
const maybeJunk = /.{0,20}(\bundefined\b|\bNaN\b).{0,20}/;

function sameOrigin(base, href) {
  return new URL(href).origin === new URL(base).origin;
}

export async function checkPage(url, { external = false } = {}) {
  const findings = [];
  const add = (level, rule, message, width) => findings.push({ level, rule, message, width });
  const browser = await launch();
  let first;

  try {
    for (const viewport of widths) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const errors = [];
      const failed = [];
      page.on("console", (m) => {
        if (m.type() === "error" && !m.text().startsWith("Failed to load resource")) errors.push(m.text());
      });
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("response", (r) => {
        if (r.status() >= 400 && sameOrigin(url, r.url())) failed.push(`${r.status()} ${new URL(r.url()).pathname}`);
      });
      page.on("requestfailed", (r) => {
        if (sameOrigin(url, r.url())) failed.push(`failed ${new URL(r.url()).pathname}`);
      });

      const response = await page.goto(url, { waitUntil: "load" });
      if (!response?.ok()) throw new Error(`${url} returned ${response?.status() ?? "nothing"}`);
      await walk(page);
      const found = await page.evaluate(inspect);
      const w = viewport.width;

      for (const e of new Set(errors)) add("fail", "console", e.slice(0, 160), w);
      for (const f of new Set(failed)) add("fail", "requests", f, w);

      if (found.overflow > 1) {
        add("fail", "overflow", `page is ${found.overflow}px wider than the screen. Widest: ${found.outermost.join(", ") || "unknown"}`, w);
      } else if (found.outermost.length) {
        add("warn", "overflow", `wider than the screen but hidden by overflow on html or body: ${found.outermost.join(", ")}`, w);
      }
      if (found.small.length) {
        add("warn", "small-text", `${found.small.length} paragraphs under 16px, e.g. ${found.small[0]}`, w);
      }
      for (const img of found.images) {
        const name = new URL(img.src, url).pathname;
        if (img.complete && img.natural === 0) add("fail", "images", `broken image ${name}`, w);
        else if (!img.complete) add("warn", "images", `never finished loading ${name}`, w);
        else if (!img.svg && img.shown > img.natural * 1.15) {
          add("warn", "images", `${name} is shown at ${Math.round(img.shown)}px but is ${img.natural}px wide, so it looks soft`, w);
        }
      }

      if (!first) {
        first = found;
        const joined = found.text.join(" ");
        const m = joined.match(junk);
        if (m) add("fail", "junk-text", `"${m[0].trim()}" shows on the page`);
        const maybe = joined.match(maybeJunk);
        if (maybe) add("warn", "junk-text", `"${maybe[0].trim()}" shows on the page. Fine in prose, a bug when it comes from a missing value.`);
        for (const { rule, level, pattern, why } of copyRules) {
          const hit = joined.match(pattern);
          if (hit) add(level, rule, `${why}: "${hit[0].trim()}"`);
        }
        const banned = found.fonts.filter((f) => bannedFonts.has(f.toLowerCase()));
        if (banned.length) add("warn", "fonts", `${banned.join(", ")} reads as a default pick. Take type from the reference instead.`);
        for (const id of new Set(found.missingAnchors)) add("fail", "anchors", `#${id} links to nothing`);
        if (found.h1 !== 1) add("warn", "meta", `${found.h1} h1 elements, expected one`);
        if (!found.title) add("warn", "meta", "no title");
        if (!found.description) add("warn", "meta", "no meta description");
        if (!found.lang) add("warn", "meta", "no lang on html");
        if (found.generator) add("fail", "attribution", "generator meta tag");
        if (!found.legal.privacy || !found.legal.terms) add("warn", "legal", "footer has no privacy or terms link");
      }

      if (w === 1440 || w === 390) {
        const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
        for (const v of axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical")) {
          add("fail", "a11y", `${v.id}: ${v.help} (${v.nodes.length})`, w);
        }
      }
      await context.close();
    }

    const noJs = await browser.newContext({ viewport: widths[0], javaScriptEnabled: false });
    const plain = await noJs.newPage();
    await plain.goto(url, { waitUntil: "load" });
    const textWithoutJs = await plain.evaluate(() => document.body.innerText.trim().length);
    if (!textWithoutJs) {
      add("warn", "no-js", "the page shows nothing without JavaScript");
    } else {
      const hidden = await plain.evaluate(hiddenOnScreen);
      if (hidden.length) add("fail", "no-js", `first screen stays hidden until JavaScript runs: "${hidden.slice(0, 3).join('", "')}"`);
    }
    await noJs.close();

    const calm = await browser.newContext({ viewport: widths[0], reducedMotion: "reduce" });
    const still = await calm.newPage();
    await still.goto(url, { waitUntil: "load" });
    const height = await still.evaluate(() => document.documentElement.scrollHeight);
    const stuck = new Set();
    for (let y = 0; y < height; y += 800) {
      await still.evaluate((top) => window.scrollTo(0, top), y);
      await still.waitForTimeout(150);
      for (const t of await still.evaluate(hiddenOnScreen)) stuck.add(t);
    }
    if (stuck.size) add("warn", "reduced-motion", `stays hidden with reduced motion on: "${[...stuck].slice(0, 3).join('", "')}"`);
    await calm.close();

    const internal = [...new Set(first.links.filter((href) => sameOrigin(url, href)))];
    const outside = [...new Set(first.links.filter((href) => !sameOrigin(url, href)))].slice(0, 50);
    const requests = (await browser.newContext()).request;
    for (const href of internal) {
      const status = await requests.get(href).then((r) => r.status(), () => 0);
      if (status === 0 || status >= 400) add("fail", "links", `${new URL(href).pathname} returns ${status || "no response"}`);
    }
    if (external) {
      for (const href of outside) {
        const status = await requests.get(href, { timeout: 10000 }).then((r) => r.status(), () => 0);
        if (status === 0 || status >= 400) add("warn", "links", `${href} returns ${status || "no response"}`);
      }
    }
  } finally {
    await browser.close();
  }

  if (first.canvases.length) {
    const bare = await launch(noWebgl);
    try {
      const page = await bare.newPage({ viewport: widths[0] });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(url, { waitUntil: "load" });
      await page.waitForTimeout(1500);
      for (const e of new Set(errors)) add("fail", "webgl", `throws with WebGL off: ${e.slice(0, 120)}`);
      const canvases = (await page.evaluate(inspect)).canvases;
      for (const clip of canvases) {
        if ((await spread(page, clip)) < 2) add("fail", "webgl", "a canvas on the first screen is blank with WebGL off. Add a fallback.");
      }
    } finally {
      await bare.close();
    }
  }

  return findings;
}
