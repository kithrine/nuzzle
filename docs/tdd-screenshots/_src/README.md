# TDD Screenshot Capture — How-To

Tooling that satisfies `RULES.md` Rule 1 / Rule 20: a screenshot of the
**failing** and **passing test-runner output** for every story, saved to
`docs/tdd-screenshots/`. This is a screenshot of the terminal output of the
test run — not a screenshot of the rendered app page.

The tool renders real, captured test output into an HTML mockup styled like
a browser tab showing a terminal, then screenshots that with Playwright. It
never fabricates output — it always runs the real commands first.

Files:

- `ansi-to-html.mjs` — converts real ANSI color codes from the captured
  output into inline-styled HTML spans.
- `render-terminal.mjs` — builds the full browser-chrome-styled HTML
  document around that output.
- `capture.mjs` — orchestrator: runs the real commands, truncates
  excessively long output, writes the `.html` source mockup, and screenshots
  it to a `.png`.

## Windows / fnm prerequisite

Node is not on `PATH` for non-interactive shells in this environment, but is
installed via `fnm`. **Every** shell command that needs `node`/`npm`/`npx`
must be prefixed with:

```powershell
fnm env | Out-String | Invoke-Expression; <command>
```

(Run via the PowerShell tool, not Bash — Bash does not have fnm wired up.)

## Capturing the GREEN screenshot (after the feature is implemented and passing)

```powershell
fnm env | Out-String | Invoke-Expression; node docs/tdd-screenshots/_src/capture.mjs <story-id>-green
```

This defaults to running `npm run test` and `npm run test:e2e`. Pass custom
commands as extra args if a story needs different ones, e.g.:

```powershell
node docs/tdd-screenshots/_src/capture.mjs 3.2-green "npm run test -- compatibility-engine"
```

Writes:

- `docs/tdd-screenshots/_src/<story-id>-green.html` (source mockup)
- `docs/tdd-screenshots/<story-id>-green.png` (the deliverable, embed this in the story's markdown)

## Capturing the RED screenshot (before/while the test is failing)

The cleanest path is to capture red **before** writing the implementation,
as the normal TDD red step — just run `capture.mjs` with the `-red` suffix
right after confirming the test fails for the right reason, before writing
any production code.

If the implementation already exists and you need to backfill a red
screenshot (as happened for story 1.1):

1. Temporarily revert/break the implementation file(s) so the test fails
   for a real, accurate reason (not a typo/crash).
2. Run capture with the `-red` suffix while in that broken state.
3. **Immediately** restore the real implementation.
4. Re-run `npm run test` and `npm run test:e2e` for real to confirm green
   again before moving on — don't assume the restore worked, verify it.

## Output truncation

Real failure output can be very long (React Testing Library dumps the full
accessibility tree on a "could not find element" error; Playwright logs
every retry attempt). `capture.mjs` truncates any command's output past 40
lines down to the first 18 + last 18 lines, with a visible
`… N lines omitted …` marker. This is automatic — no flags needed — and
keeps screenshots readable without rewriting or hiding real failures.

## After capturing both

Create/update `docs/tdd-screenshots/<story-id>.md` per Rule 1's convention:
a heading per test ID, a one-line description of what the test verifies,
then the Red and Green sections each with their embedded screenshot and a
one-line description of what's shown in that specific screenshot.
