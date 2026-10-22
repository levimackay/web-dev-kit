# Gotchas

Things that pass every static check and still break.

- **Next.js 15 needs React 19.** With React 18 it typechecks, lints and builds, then renders a blank page with `Cannot read properties of undefined (reading 'ReactCurrentOwner')`. The matching 3D pair is `@react-three/fiber` 9 and `@react-three/drei` 10. Edit `package.json`, delete `node_modules` and the lockfile, reinstall.
- **`eslint-config-next` 15 cannot load under ESLint 9 flat config.** Wire `@next/eslint-plugin-next` directly.
- **Headless Chromium renders 3D in software.** Playwright's default `chrome-headless-shell` falls back to SwiftShader, so heavy scenes crawl and look broken. Use `channel: "chrome"` or `--enable-gpu --use-angle=metal --use-gl=angle`, then confirm by reading `WEBGL_debug_renderer_info`. If it says SwiftShader, the numbers are fiction.
- **Full page screenshots skip lazy images.** `fullPage: true` does not load `loading="lazy"` images, so they shoot as empty boxes. Scroll in steps, wait for `document.images`, then shoot. `check.sh` does this.
- **Next.js dev mode** draws its own round indicator in the bottom left of every screenshot. It is not part of the design.
- **Pixel reads off a WebGL canvas return black** unless the context has `preserveDrawingBuffer: true`. Screenshot the page instead.
- **An R3F canvas on `frameloop="demand"`** renders once and stops until something calls `invalidate()`.
- **Jumping straight to a scroll offset** skips every state a ScrollTrigger page sets on the way. Walk scroll in 400 to 700px steps.
- **Nested arrays in `replaceChildren`** print `[object HTMLDivElement],[object HTMLDivElement]` on the live page. `flatMap` flattens one level only. Recheck every section after a rewrite. `check.sh` looks for `[object`, `undefined` and `NaN` in the rendered text.
- **Links sent to people outlive hosts.** Renaming a GitHub account kills every `*.github.io` link already sent, with no redirect. Put anything you send on a custom domain, and when a host changes, check the exact URLs inside sent messages, not just the site root.
