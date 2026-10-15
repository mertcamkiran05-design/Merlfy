---
name: netlify-deploy-blocked
description: "Claude Code's auto-mode classifier hard-blocks Netlify production deploys via any tool, even with explicit user approval — use Netlify Drop (web UI) instead"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4b986de7-4f3c-4fd7-8c8b-878d70a2621d
  modified: 2026-09-18T13:58:13.763Z
---

Claude Code's auto-mode permission classifier blocks any action it tags "Production Deploy" — this includes both the Netlify MCP tool's `deploy-site` operation and running `npx netlify-cli deploy --prod` via Bash. The block is enforced at the harness level, not by normal per-tool permission prompts, so it does **not** go away even when the user explicitly says "yes, do it" in chat — that approval has no effect on this specific classifier. Retrying with a different tool (MCP vs CLI) also does not help; both hit the same wall.

**Why:** Observed directly in [[merlfy-project]]'s 2026-09-18 session — both `mcp__claude_ai_Netlify__netlify-deploy-services-updater` (deploy-site) and `npx netlify-cli deploy` were denied with the same "Reason: [Production Deploy]" message, despite the user answering "evet herşeyi yap" beforehand. Separately, `npx netlify-cli login` also did not work cleanly for this user's setup (non-interactive environment), and a plain `npx netlify-cli deploy` without prior login failed with `Unauthorized: could not retrieve project`.

**How to apply:** When a task requires deploying to Netlify (or likely any similarly-classified "production deploy" action on other platforms), don't keep retrying tool variants — immediately tell the user this is blocked at the Claude Code settings level and offer the working alternative: **Netlify Drop**, the web UI's manual upload at `https://app.netlify.com/projects/<site-name>/deploys` → the "browse files to upload" / "choose a folder" / drag-and-drop area. It supports a single HTML file or a whole folder, needs no CLI login, and reaches production immediately. Guide the user to click through it themselves (native OS file pickers can't be automated by browser tools either) — Claude-in-Chrome can be used afterward to screenshot-verify the deploy succeeded and that the live site reflects the change. If the user wants Claude to be able to deploy directly in the future, they'd need to add a Bash permission rule in their own Claude Code settings.
