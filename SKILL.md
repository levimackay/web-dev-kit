---
name: web-dev-kit
description: Installs and routes a curated web dev toolkit for Claude Code covering design direction, UI critique, animation, performance, accessibility, SEO, copy, browser testing and deploys. Use when the user asks to set up or install the web dev kit, or at the start of web work when it is unclear which installed skill or plugin fits the task.
---

# Web dev kit

A starter set of public plugins and skills for building websites, plus a map of which one to reach for.

## Setup

When the user asks to install or set up the kit, run the installer from this skill's folder:

```bash
bash install.sh
```

- `--extras` also installs video tools (Remotion, HyperFrames, brag), GetLayers and 67 visual style skills
- `--dry-run` prints every command without running anything

It needs `claude`, `npx` (Node) and `git` on PATH. It is safe to rerun. When it finishes, tell the user to restart Claude Code so the new plugins and skills load, and to do the two manual steps below.

Manual steps:
- The Anthropic `design` plugin (accessibility review, design critique, handoff, UX copy) comes from claude.ai under Customize, then Plugins.
- GetLayers (extras only) needs its account connected through `/mcp`.

## Which tool for which job

| Job | Use |
| --- | --- |
| New site or page, picking a visual direction | `frontend-design`, `design-taste-frontend`, `ui-ux-pro-max` |
| Critique, polish or redesign existing UI | `impeccable` plugin (impeccable:impeccable), `web-design-guidelines` |
| Animation and scroll effects | `gsap-skills` (gsap-core, gsap-scrolltrigger, gsap-react and more) |
| Reviewing motion that already exists | `review-animations` |
| Lighthouse style audit: performance, accessibility, SEO, best practices | `web-quality-skills` (start with web-quality-audit) |
| Diagnosing slow pages live in Chrome (LCP, CLS, INP) | `webperf` skills with the `chrome-devtools-mcp` plugin |
| Technical SEO, structured data, local business SEO | `seo-technical`, `seo-schema`, `seo-local` |
| Landing page copy and conversion | `copywriting`, `cro` |
| Clicking through a site, browser tests, screenshots | `playwright-cli`, `chrome-devtools-mcp` |
| Next.js, Vercel deploys, env vars, AI SDK, shadcn | `vercel` plugin |
| Database, auth and Postgres | `supabase` plugin |
| Building a feature with a plan first | `feature-dev` |
| Review before committing | `code-review`, `pr-review-toolkit`, `code-simplifier` |
| Security pass on auth, secrets or user input | `claude-security` |
| Launch video or motion graphics (extras) | `brag`, Remotion skills, HyperFrames skills |
| A named visual style such as bento, brutalism or glassmorphism (extras) | the style skill of that name |

## Reference

For real brand design tokens (Stripe, Linear, Apple and about 70 more), clone https://github.com/VoltAgent/awesome-design-md and point Claude at the DESIGN.md for the brand you want to match.
