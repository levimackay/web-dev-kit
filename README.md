# web-dev-kit

My setup for building websites with Claude Code, as one skill. It installs the web plugins and skills I use, carries the rules for everything I used to fix by hand, and comes with a check script that renders a page at three widths and lists what is wrong before anyone sees it.

## Install

In Claude Code:

```
/plugin install web-dev-kit --marketplace levimackay/web-dev-kit
```

Then ask Claude to "set up the web dev kit". It shows the plugins and skills it is about to add and installs them once you say yes. Restart Claude Code afterwards.

Without the plugin system, download `web-dev-kit-<version>.zip` from [Releases](https://github.com/levimackay/web-dev-kit/releases), unzip it into `~/.claude/skills/`, and run:

```bash
bash ~/.claude/skills/web-dev-kit/install.sh
```

It needs `claude`, Node 20 or newer and `git`. Rerunning it is safe.

| Option | Effect |
| --- | --- |
| `--extras` | Also installs video tools (Remotion, HyperFrames, brag), GetLayers and 67 visual style skills |
| `--dry-run` | Prints the list and stops |
| `--yes` | Installs without asking |

Two steps stay manual. The Anthropic `design` plugin comes from claude.ai under Customize, then Plugins. GetLayers (extras only) needs its account connected through `/mcp`.

## What is in it

`skills/web-dev-kit/rules/` holds what the installed skills do not cover, learned from real builds:

| File | Covers |
| --- | --- |
| `workflow.md` | The loop: facts file, references, three rendered directions, a spec, measured fix rounds, a cold critic |
| `look.md` | The visual signature that reads as AI made, and the details that need fixing every time |
| `copy.md` | Punctuation, invented facts, product strings that must match the product |
| `build.md` | Code a senior engineer would believe a person wrote, accessibility, fonts, images, git hygiene |
| `motion.md` | Lenis with GSAP on one clock, transforms only, sharp raster text, pinned tracks, WebGL fallbacks |
| `responsive.md` | Sideways overflow, the fold, breakpoint pieces, tables on phones |
| `gotchas.md` | Things that build fine and still break |

`check.sh` renders a running page or a built folder at 1440, 768 and 390:

```bash
bash ~/.claude/skills/web-dev-kit/check.sh http://localhost:5173/ --src .
```

It reports console errors, failed requests, sideways overflow and the element causing it, broken or upscaled images, small text, `[object` or `undefined` on the page, dead links, AI tell fonts and punctuation, accessibility failures, content hidden until JavaScript runs, blank canvases with WebGL off, AI style comments, attribution strings and build folders missing from `.gitignore`. The first run installs its dependencies. If no browser is found it falls back to Google Chrome.

## What it installs

Plugins from the official Anthropic marketplace: frontend-design, vercel, supabase, chrome-devtools-mcp, code-review, pr-review-toolkit, feature-dev, code-simplifier, claude-security.

Other plugins:
- [pbakaus/impeccable](https://github.com/pbakaus/impeccable)
- [greensock/gsap-skills](https://github.com/greensock/gsap-skills)
- [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills)

Skills, each pinned to a commit:
- [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills): web-design-guidelines, vercel-composition-patterns
- [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill): design-taste-frontend
- [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill): ui-ux-pro-max
- [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills): copywriting, cro
- [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo): seo-local, seo-schema, seo-technical
- [nucliweb/webperf-snippets](https://github.com/nucliweb/webperf-snippets): all six webperf skills
- [emilkowalski/skills](https://github.com/emilkowalski/skills): review-animations, animation-performance, break-ui, mobile-native
- [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli): playwright-cli

Extras: [latent-spaces/brag](https://github.com/latent-spaces/brag), [textura-agency/getlayers-plugin](https://github.com/textura-agency/getlayers-plugin), [remotion-dev/skills](https://github.com/remotion-dev/skills), [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes), [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills).

Each tool installs from its own repo and keeps its own license. The plugin marketplaces for impeccable and brag are pinned to release tags. The others follow their latest version because they publish no tags.

## Updating the pins

```bash
bash skills/web-dev-kit/scripts/pin.sh
```

Moves every commit pin to the current head of its repo so the changes can be reviewed in one diff.
