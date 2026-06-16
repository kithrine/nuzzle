// Captures real test-runner output (Vitest + Playwright) as a screenshot,
// styled to look like a browser tab showing a terminal — per RULES.md
// Rule 1 / Rule 20 ("Take a Playwright screenshot of the failing/passing
// test output"). Runs the real commands; never fabricates output text.
//
// Usage:
//   node docs/tdd-screenshots/_src/capture.mjs <id> [cmd1] [cmd2] ...
//
// Example:
//   node docs/tdd-screenshots/_src/capture.mjs 1.1-green "npm run test" "npm run test:e2e"
//
// Writes:
//   docs/tdd-screenshots/_src/<id>.html  (source mockup)
//   docs/tdd-screenshots/<id>.png        (final screenshot)

import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { buildTerminalWindowHtml } from "./render-terminal.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..", "..", "..");
const srcDir = __dirname;
const outDir = resolve(srcDir, "..");

const [id, ...cmdArgs] = process.argv.slice(2);
if (!id) {
  console.error(
    "Usage: node capture.mjs <id> [cmd1] [cmd2] ...\n" +
      'Example: node capture.mjs 1.1-green "npm run test" "npm run test:e2e"',
  );
  process.exit(1);
}
const commands = cmdArgs.length > 0 ? cmdArgs : ["npm run test", "npm run test:e2e"];

function runCommand(command) {
  const result = spawnSync(command, {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, FORCE_COLOR: "1" },
    shell: true,
  });
  return (result.stdout || "") + (result.stderr || "");
}

// Real failure output (RTL's full accessibility-tree dump, Playwright's
// per-retry expect logs) can run hundreds of lines — unreadable as a
// reference screenshot. Keep head + tail and mark what was cut, rather
// than silently editing or shipping an unusably long image.
const MAX_LINES = 40;
const HEAD_LINES = 18;
const TAIL_LINES = 18;

function truncate(output) {
  const lines = output.split("\n");
  if (lines.length <= MAX_LINES) return output;
  const omitted = lines.length - HEAD_LINES - TAIL_LINES;
  const marker = `\x1b[2m… ${omitted} lines omitted …\x1b[22m`;
  return [...lines.slice(0, HEAD_LINES), marker, ...lines.slice(-TAIL_LINES)].join("\n");
}

const blocks = commands.map((command) => ({
  command,
  output: truncate(runCommand(command).trim()),
}));

const title = `${id}.html`;
const html = buildTerminalWindowHtml({ title, blocks });

const htmlPath = join(srcDir, `${id}.html`);
writeFileSync(htmlPath, html, "utf8");

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
await page.goto(pathToFileURL(htmlPath).href);
const el = page.locator("#window");
const pngPath = join(outDir, `${id}.png`);
await el.screenshot({ path: pngPath });
await browser.close();

console.log(`Wrote ${htmlPath}`);
console.log(`Wrote ${pngPath}`);
