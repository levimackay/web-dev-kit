# web-dev-kit

One Claude Code skill that installs a set of public web dev plugins and skills, then tells Claude which one to use for each job: design direction, UI critique, animation, performance, accessibility, SEO, copy, browser testing and deploys.

## Install

```bash
git clone https://github.com/levimackay/web-dev-kit ~/.claude/skills/web-dev-kit
bash ~/.claude/skills/web-dev-kit/install.sh
```

Restart Claude Code afterwards. You can also clone it and ask Claude to "set up the web dev kit".

It needs `claude`, Node (`npx`) and `git`. Rerunning it is safe.

| Option | Effect |
| --- | --- |
| `--extras` | Also installs video tools (Remotion, HyperFrames, brag), GetLayers and 67 visual style skills |
| `--dry-run` | Prints every command without running anything |

Two steps stay manual:
- The Anthropic `design` plugin comes from claude.ai under Customize, then Plugins.
- GetLayers (extras only) needs its account connected through `/mcp`.

## What it installs

Plugins from the official Anthropic marketplace: frontend-design, vercel, supabase, chrome-devtools-mcp, code-review, pr-review-toolkit, feature-dev, code-simplifier, claude-security.

Other plugins:
- [pbakaus/impeccable](https://github.com/pbakaus/impeccable)
- [greensock/gsap-skills](https://github.com/greensock/gsap-skills)
- [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills)

Skills:
- [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills): web-design-guidelines
- [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill): design-taste-frontend
- [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill): ui-ux-pro-max
- [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills): copywriting, cro
- [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo): seo-local, seo-schema, seo-technical
- [nucliweb/webperf-snippets](https://github.com/nucliweb/webperf-snippets): all six webperf skills
- [emilkowalski/skills](https://github.com/emilkowalski/skills): review-animations
- [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli): playwright-cli

Extras: [latent-spaces/brag](https://github.com/latent-spaces/brag), [textura-agency/getlayers-plugin](https://github.com/textura-agency/getlayers-plugin), [remotion-dev/skills](https://github.com/remotion-dev/skills), [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes), [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills).

Each tool is installed from its own repo and keeps its own license. This kit only installs them and routes between them.
