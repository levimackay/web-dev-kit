import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const skipDirs = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "out",
  ".next",
  ".vercel",
  ".svelte-kit",
  ".astro",
  ".turbo",
  ".cache",
  "coverage",
]);
const sourceFile = /\.(html?|css|scss|js|mjs|cjs|jsx|ts|tsx|vue|svelte|astro)$/;
const maxBytes = 150_000;

const mustIgnore = [
  "node_modules",
  "dist",
  "build",
  "out",
  ".next",
  ".vercel",
  ".env",
  ".env.local",
  "test-results",
  "playwright-report",
  ".tenbillion",
  ".DS_Store",
];

const attribution = [
  /\b(generated|made|built|created|designed|written)\s+(with|by|using)\s+(claude|chatgpt|gpt-?\d|openai|anthropic|copilot|cursor|v0|lovable|bolt|gemini|ai)\b/i,
  /co-authored-by:/i,
  /<meta[^>]+name=["']generator["']/i,
];

const aiComment = [
  /\b(step|task|phase)\s+\d+(\.\d+)*\b/i,
  /[=*#~-]{6,}/,
  /^\s*(initiali[sz]e|handle|set ?up|helper|this (function|component|section))\b/i,
  /^\s*[\w ]+ section\s*$/i,
];

async function walk(dir, files = []) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name) && !entry.name.startsWith(".")) {
        await walk(path.join(dir, entry.name), files);
      }
    } else if (sourceFile.test(entry.name) && !entry.name.includes(".min.")) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function comments(text, file) {
  const found = [...text.matchAll(/<!--([\s\S]*?)-->/g)].map((m) => m[1]);
  if (/\.html?$/.test(file) && !/<script|<style/.test(text)) return found;
  for (const m of text.matchAll(/\/\*(?!!)([\s\S]*?)\*\//g)) found.push(m[1]);
  for (const m of text.matchAll(/(?<![:"'`\\\w])\/\/(?!\/)(.*)$/gm)) found.push(m[1]);
  return found;
}

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

function centredClasses(text) {
  const classes = new Set();
  for (const rule of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/translate(\(|:)\s*-50%/.test(rule[2])) continue;
    for (const m of rule[1].matchAll(/\.([\w-]+)/g)) classes.add(m[1]);
  }
  return classes;
}

function gsapTargets(text) {
  const targets = new Set();
  for (const m of text.matchAll(/\.(?:to|from|fromTo|set)\(\s*["'`]([^"'`]+)["'`]/g)) {
    for (const c of m[1].matchAll(/\.([\w-]+)/g)) targets.add(c[1]);
  }
  return targets;
}

function gitignoreFindings(dir) {
  try {
    execFileSync("git", ["-C", dir, "rev-parse", "--is-inside-work-tree"], { stdio: "ignore" });
  } catch {
    return [];
  }
  const findings = [];
  for (const name of mustIgnore) {
    const tracked = execFileSync("git", ["-C", dir, "ls-files", "--", name], { encoding: "utf8" });
    if (tracked.trim()) {
      findings.push({ level: "fail", rule: "gitignore", message: `${name} is committed. Remove it from git and ignore it.` });
      continue;
    }
    if (!existsSync(path.join(dir, name))) continue;
    try {
      execFileSync("git", ["-C", dir, "check-ignore", "-q", name], { stdio: "ignore" });
    } catch {
      findings.push({ level: "fail", rule: "gitignore", message: `${name} exists and is not in .gitignore.` });
    }
  }
  return findings;
}

export async function checkSource(dir) {
  const findings = [];
  const files = await walk(dir);
  const texts = [];
  for (const file of files) {
    const stat = await fs.stat(file);
    if (stat.size > maxBytes) continue;
    texts.push({ file, rel: path.relative(dir, file), text: await fs.readFile(file, "utf8") });
  }

  for (const { file, rel, text } of texts) {
    for (const pattern of attribution) {
      const m = text.match(pattern);
      if (m) {
        findings.push({ level: "fail", rule: "attribution", message: `${rel}:${lineOf(text, m.index)} "${m[0].trim()}"` });
      }
    }
    for (const comment of comments(text, file)) {
      if (aiComment.some((p) => p.test(comment)) || /\b(TODO|FIXME|XXX)\b/.test(comment)) {
        findings.push({ level: "warn", rule: "comment", message: `${rel}: "${comment.trim().slice(0, 60)}"` });
      }
    }
    if (/\.(m?js|cjs|jsx|tsx?|vue|svelte|astro|html?)$/.test(file)) {
      const log = text.match(/\bconsole\.log\(|\bdebugger;/);
      if (log) findings.push({ level: "warn", rule: "leftover", message: `${rel}:${lineOf(text, log.index)} ${log[0]}` });
    }
    const hidden = text.match(/(^|[\s,}])(html|body)\s*\{[^}]*overflow(-x)?\s*:\s*hidden/);
    if (hidden) {
      findings.push({
        level: "warn",
        rule: "overflow-hidden",
        message: `${rel}:${lineOf(text, hidden.index)} hides sideways overflow on ${hidden[2]} instead of fixing the wide element`,
      });
    }
  }

  const all = texts.map((t) => t.text).join("\n");
  const centred = centredClasses(all);
  const animated = gsapTargets(all);
  const clash = [...animated].filter((c) => centred.has(c));
  if (clash.length && !/[xy]Percent\s*:/.test(all)) {
    findings.push({
      level: "warn",
      rule: "gsap-centering",
      message: `.${clash.join(", .")} is centred with CSS translate and animated by GSAP. Centre it with xPercent and yPercent instead.`,
    });
  }
  if (/new Lenis\(/.test(all)) {
    if (/new Lenis\([^)]*duration\s*:/.test(all) && /scrub\s*:\s*(true|0?\.\d+)/.test(all)) {
      findings.push({
        level: "warn",
        rule: "scroll-clocks",
        message: "Lenis has its own duration ease and the scrubs are short. Two clocks fight on fast scrolls. Use the Lenis defaults with scrub: 1.",
      });
    }
    if (/scroll-behavior\s*:\s*smooth/.test(all)) {
      findings.push({ level: "warn", rule: "scroll-clocks", message: "scroll-behavior: smooth is set while Lenis runs. Remove it." });
    }
  }

  return [...findings, ...gitignoreFindings(dir)];
}
