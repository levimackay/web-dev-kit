---
name: web-dev-kit
description: Builds websites and web UI that do not read as AI made. Installs a curated set of web plugins and skills, carries the rules for design, copy, code, motion and responsive layout that otherwise get fixed by hand, and ships a check script that renders a page at three widths and reports the defects. Use when setting up the kit, when starting any website, landing page or web UI, before showing a page to anyone, or when unsure which installed web skill fits.
---

# Web dev kit

## Setup

When the user asks to install or set up the kit:

1. Run `bash install.sh --dry-run` from this skill's folder and show the user the list.
2. Once they say yes, run `bash install.sh --yes`. Add `--extras` for video tools (Remotion, HyperFrames, brag), GetLayers and 67 visual style skills.
3. Tell them to restart Claude Code, then do two things by hand: add the Anthropic `design` plugin from claude.ai (Customize, then Plugins), and connect GetLayers through `/mcp` if they took the extras.

It needs `claude`, `npx` (Node 20 or newer) and `git`. Skills are pinned to reviewed commits. `scripts/pin.sh` moves the pins forward when the kit is updated.

## Building a site or web UI

Read `rules/workflow.md` before anything else and follow its loop: facts file, references, a one sentence conceit, material inventory, three rendered directions, a spec, a build, then measured fix rounds.

Then read the rule file for the work in front of you:

| Working on | Read |
| --- | --- |
| Visual direction, type, colour, layout | `rules/look.md` |
| Any words on the page | `rules/copy.md` |
| HTML, CSS, JS, accessibility, performance, git hygiene | `rules/build.md` |
| Scroll effects, smooth scrolling, pins, WebGL | `rules/motion.md` |
| Phones, tablets, breakpoints, tables | `rules/responsive.md` |
| Something that builds fine and still breaks | `rules/gotchas.md` |

## Before anyone sees it

Run the check on the running page or the built folder:

```bash
bash check.sh http://localhost:5173/ --src .
bash check.sh dist --src .
```

It renders at 1440, 768 and 390, scrolls the whole page, and reports console errors, failed requests, sideways overflow with the element causing it, broken or upscaled images, text under 16px, `[object`/`undefined`/`NaN` on the page, dead anchors and links, AI tell punctuation and fonts, accessibility failures, content hidden until JavaScript runs or under reduced motion, blank canvases with WebGL off, AI style comments, attribution strings and build folders missing from `.gitignore`. It exits 1 when anything needs fixing. Fix every FAIL. Read every WARN and fix it unless it is deliberate.

Then send the screenshots to a fresh critic as `rules/workflow.md` step 10 describes.

## Which installed tool for which job

| Job | Use |
| --- | --- |
| Picking a visual direction | `frontend-design`, `design-taste-frontend`, `ui-ux-pro-max` |
| Critique, polish or redesign existing UI | `impeccable` plugin (impeccable:impeccable), `web-design-guidelines` |
| Animation and scroll effects | `gsap-skills` (gsap-core, gsap-scrolltrigger, gsap-react and more) |
| Reviewing or speeding up motion | `review-animations`, `animation-performance` |
| Breaking UI with worst case data | `break-ui` |
| Making a web app feel native on a phone | `mobile-native` |
| React component structure | `vercel-composition-patterns` |
| Lighthouse style audit | `web-quality-skills` (start with web-quality-audit) |
| Slow pages in Chrome (LCP, CLS, INP) | `webperf` skills with the `chrome-devtools-mcp` plugin |
| Technical SEO, structured data, local SEO | `seo-technical`, `seo-schema`, `seo-local` |
| Landing page copy and conversion | `copywriting`, `cro` |
| Clicking through a site, browser tests | `playwright-cli`, `chrome-devtools-mcp` |
| Next.js, Vercel deploys, env vars, AI SDK, shadcn | `vercel` plugin |
| Database, auth and Postgres | `supabase` plugin |
| A feature that needs a plan first | `feature-dev` |
| Review before committing | `code-review`, `pr-review-toolkit`, `code-simplifier` |
| Security pass on auth, secrets or user input | `claude-security` |
| Launch video or motion graphics (extras) | `brag`, Remotion skills, HyperFrames skills |
| A named visual style such as bento or brutalism (extras) | the style skill of that name |

For real brand design tokens (Stripe, Linear, Apple and about 70 more), clone https://github.com/VoltAgent/awesome-design-md and point Claude at the DESIGN.md for the brand to match.
