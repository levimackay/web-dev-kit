import { pathToFileURL } from "node:url";
import * as fontkit from "fontkit";
import { launch } from "./page.mjs";
import { clean, untrusted } from "./clean.mjs";

const elements = ["h1", "h2", "h3", "p", "a", "button"];

function nameRecord(font, key) {
  const record = font.name?.records?.[key];
  if (!record) return "";
  return record.en ?? Object.values(record)[0] ?? "";
}

function describeFile(buffer) {
  try {
    const parsed = fontkit.create(buffer);
    const font = parsed.fonts ? parsed.fonts[0] : parsed;
    return {
      family: nameRecord(font, "preferredFamily") || font.familyName,
      foundry: nameRecord(font, "manufacturer"),
      designer: nameRecord(font, "designer"),
      vendorUrl: nameRecord(font, "vendorURL"),
      license: nameRecord(font, "license"),
      licenseUrl: nameRecord(font, "licenseURL"),
    };
  } catch {
    return null;
  }
}

export async function inspectFonts(url) {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const pending = [];
    page.on("response", (response) => {
      const type = response.headers()["content-type"] ?? "";
      if (response.request().resourceType() !== "font" && !/font|woff/.test(type)) return;
      pending.push(response.body().then((body) => [response.url(), body], () => null));
    });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const files = new Map((await Promise.all(pending)).filter(Boolean));

    const stacks = await page.evaluate(
      (selectors) =>
        selectors
          .map((s) => document.querySelector(s))
          .filter(Boolean)
          .map((el) => ({ element: el.tagName.toLowerCase(), stack: getComputedStyle(el).fontFamily })),
      elements,
    );

    const cdp = await page.context().newCDPSession(page);
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    const { root } = await cdp.send("DOM.getDocument");
    for (const entry of stacks) {
      const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: entry.element });
      if (!nodeId) continue;
      const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
      entry.rendered = fonts.map((f) => f.familyName).join(", ");
    }

    const described = [...files].map(([fileUrl, body]) => ({ file: fileUrl, ...describeFile(body) }));
    return { stacks, files: described };
  } finally {
    await browser.close();
  }
}

function print(url, { stacks, files }) {
  console.log(`fonts on ${clean(url, 300)}\n${untrusted}\n`);
  for (const { element, stack, rendered } of stacks) {
    console.log(`${element.padEnd(7)} renders ${clean(rendered, 80) || "unknown"}  (css: ${clean(stack, 120)})`);
  }
  console.log(files.length ? "\nfont files" : "\nno web font files were downloaded");
  for (const f of files) {
    console.log(`\n${clean(f.family, 80) || "unreadable"}  ${clean(new URL(f.file).pathname.split("/").pop(), 80)}`);
    if (f.foundry) console.log(`  foundry   ${clean(f.foundry, 80)}`);
    if (f.designer) console.log(`  designer  ${clean(f.designer, 120)}`);
    if (f.vendorUrl) console.log(`  vendor    ${clean(f.vendorUrl, 120)}`);
    console.log(`  license   ${clean(f.license) || "not stated in the file, check the foundry before using it"}`);
    if (f.licenseUrl) console.log(`            ${clean(f.licenseUrl, 160)}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [url] = process.argv.slice(2);
  if (!/^https?:\/\//.test(url ?? "")) {
    console.log("Usage: fonts.sh <url>\n\nShows which fonts a page really renders and what each font file says about its licence.");
    process.exit(url ? 2 : 0);
  }
  inspectFonts(url)
    .then((result) => print(url, result))
    .catch((error) => {
      console.error(error.message);
      process.exit(2);
    });
}
