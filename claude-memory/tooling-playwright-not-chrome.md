---
name: tooling-playwright-not-chrome
description: Never use the Claude-in-Chrome browser tool — use Playwright for all browser-based testing of anything built
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4b986de7-4f3c-4fd7-8c8b-878d70a2621d
  modified: 2026-09-18T14:24:43.417Z
---

Never use the `mcp__claude-in-chrome__*` tools (Claude-in-Chrome / "claude chrome") for any task, in any project.

**Why:** Explicit, emphatic user instruction: "claude chrome asla bir daha kullanma" (never use claude chrome again) — said while Claude-in-Chrome was being used to manually click through a live site to reproduce a bug. The user wants real, scripted, repeatable browser testing instead of manual point-and-click automation.

**How to apply:** Whenever a task calls for exercising something in a real browser — reproducing a bug, verifying a UI flow, testing a deployed site end-to-end — use **Playwright** (via a Node/Python script run through Bash/PowerShell), not Claude-in-Chrome's computer/screenshot/click tools. Write an actual test script (or a one-off script for a single investigation) that drives a real Chromium/WebKit/Firefox instance via Playwright's API, rather than manually clicking through screenshots turn by turn. This applies to all future projects, not just [[merlfy-project]]. If Playwright isn't installed in the working environment, install it (`npm install -D playwright` / `npx playwright install`) rather than falling back to Claude-in-Chrome.
