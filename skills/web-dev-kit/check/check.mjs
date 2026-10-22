import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import fs from "node:fs/promises";
import { checkSource } from "./source.mjs";
import { checkPage } from "./page.mjs";
import { serve } from "./serve.mjs";
import { clean, untrusted } from "./clean.mjs";

const usage = `Usage: check.sh <url or folder> [--src <folder>] [--external] [--json]

  <url or folder>  a running page (http://localhost:5173/) or a built folder (dist)
  --src <folder>   also scan this source folder for comments, attribution and gitignore gaps
  --external       also check links to other sites
  --json           print findings as JSON`;

function merge(findings) {
  const byKey = new Map();
  for (const f of findings) {
    const key = `${f.level}|${f.rule}|${f.message}`;
    const seen = byKey.get(key);
    if (!seen) byKey.set(key, { ...f, widths: f.width ? [f.width] : [] });
    else if (f.width) seen.widths.push(f.width);
  }
  return [...byKey.values()].map(({ widths, ...f }) => ({
    ...f,
    width: widths.length === 3 ? "all" : widths.join(" ") || undefined,
  }));
}

export async function run({ target, src, external = false }) {
  const isUrl = /^https?:\/\//.test(target);
  const server = isUrl ? null : await serve(target);
  try {
    const findings = await checkPage(isUrl ? target : server.url, { external });
    if (src) findings.push(...(await checkSource(src)));
    return merge(findings);
  } finally {
    await server?.close();
  }
}

function print(target, findings) {
  const order = { fail: 0, warn: 1 };
  findings.sort((a, b) => order[a.level] - order[b.level] || a.rule.localeCompare(b.rule));
  console.log(`check ${clean(target, 300)}\n${untrusted}\n`);
  for (const f of findings) {
    const where = (f.width ?? "").padEnd(9);
    console.log(`${f.level.toUpperCase().padEnd(5)} ${f.rule.padEnd(15)} ${where} ${clean(f.message, 240)}`);
  }
  const fails = findings.filter((f) => f.level === "fail").length;
  console.log(`\n${fails} to fix, ${findings.length - fails} to look at`);
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      src: { type: "string" },
      external: { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  const [target] = positionals;
  if (values.help || !target) {
    console.log(usage);
    process.exit(target ? 0 : 2);
  }
  if (!/^https?:\/\//.test(target)) {
    const stat = await fs.stat(target).catch(() => null);
    if (!stat?.isDirectory()) {
      console.error(`${target} is not a URL or a folder`);
      process.exit(2);
    }
  }
  const findings = await run({ target, src: values.src, external: values.external });
  if (values.json) console.log(JSON.stringify(findings, null, 2));
  else print(target, findings);
  process.exit(findings.some((f) => f.level === "fail") ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(2);
  });
}
