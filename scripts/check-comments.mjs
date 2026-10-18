import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EXT = new Set([".ts", ".tsx", ".js", ".mjs", ".css"]);
const SKIP = new Set([
  "node_modules",
  ".next",
  "dist",
  "coverage",
  "artifacts",
  ".worktrees",
  "test-results",
  "playwright-report",
]);

const ALLOW = [
  /SPDX-License-Identifier:/i,
  /\(c\)/i,
  /License:/i,
  /eslint-disable/,
  /biome-ignore/,
  /@ts-ignore/,
  /@ts-expect-error/,
  /@ts-nocheck/,
  /TODO\s*#\d+/i,
  /FIXME\s*#\d+/i,
  /<reference\s/i,
];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (path.basename(p) === "check-comments.mjs") return out;
    else if (EXT.has(path.extname(e.name))) out.push(p);
  }
  return out;
}

let bad = 0;
for (const file of walk(ROOT)) {
  const src = fs.readFileSync(file, "utf8");
  const withoutJsdoc = src.replace(/\/\*\*[\s\S]*?\*\//g, "");
  const blockRe = /\/\*[\s\S]*?\*\//g;
  for (const m of withoutJsdoc.matchAll(blockRe)) {
    const text = m[0];
    if (!ALLOW.some((r) => r.test(text))) {
      console.error(
        `${path.relative(ROOT, file)}: disallowed block comment: ${text.slice(0, 60).replace(/\n/g, " ")}`,
      );
      bad++;
    }
  }
  const lines = withoutJsdoc.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const codeOnly = lines[i]
      .replace(/"[^"]*"|'[^']*'|`[^`]*`/g, '""')
      .replace(/\/[^/\n]*\/[gimsuy]*/g, '""');
    const m = codeOnly.match(/\/\/(.*)$/);
    if (!m) continue;
    const text = m[1].trim();
    if (!text) continue;
    if (ALLOW.some((r) => r.test("//" + text))) continue;
    console.error(
      `${path.relative(ROOT, file)}:${i + 1}: disallowed line comment: ${text.slice(0, 60)}`,
    );
    bad++;
  }
}

if (bad > 0) {
  console.error(`\n${bad} disallowed comment(s) found.`);
  process.exit(1);
}
console.log("check-comments: ok");
