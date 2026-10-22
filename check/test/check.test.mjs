import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { run } from "../check.mjs";
import { checkSource } from "../source.mjs";

const fixtures = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures");

test("a page with every known defect fails on each of them", { timeout: 180_000 }, async () => {
  const findings = await run({ target: path.join(fixtures, "bad"), src: path.join(fixtures, "bad") });
  const rules = new Set(findings.map((f) => f.rule));
  for (const rule of [
    "a11y",
    "anchors",
    "attribution",
    "comment",
    "console",
    "dashes",
    "fonts",
    "gsap-centering",
    "images",
    "junk-text",
    "legal",
    "links",
    "meta",
    "no-js",
    "overflow",
    "overflow-hidden",
    "punctuation",
    "requests",
    "scroll-clocks",
    "small-text",
    "webgl",
  ]) {
    assert.ok(rules.has(rule), `expected a ${rule} finding`);
  }
  const errors = findings.find((f) => f.rule === "console");
  assert.equal(errors.width, "all");
});

test("a clean page passes with nothing to look at", { timeout: 180_000 }, async () => {
  const findings = await run({ target: path.join(fixtures, "good"), src: path.join(fixtures, "good") });
  assert.deepEqual(findings, []);
});

test("build output that is not ignored fails until it is", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "kit-"));
  execFileSync("git", ["init", "-q", dir]);
  await fs.mkdir(path.join(dir, "dist"));
  await fs.writeFile(path.join(dir, "dist", "index.html"), "<p>built</p>");

  const before = await checkSource(dir);
  assert.ok(before.some((f) => f.rule === "gitignore" && f.message.startsWith("dist")));

  await fs.writeFile(path.join(dir, ".gitignore"), "dist/\n");
  const after = await checkSource(dir);
  assert.equal(after.filter((f) => f.rule === "gitignore").length, 0);
  await fs.rm(dir, { recursive: true, force: true });
});
