# Code that reads as hand made

A developer opening the source must not be able to tell it apart from a careful senior engineer's work.

## Source

- Short plain class names tied to the content (`.hero`, `.phone`, `.queue`, `.rail`). No utility soup, no BEM double underscores everywhere.
- One stylesheet ordered like the page: custom properties, base, then sections. Media queries next to the rules they change. No `!important`. No unused selectors. Repeated raw colours become tokens.
- Comments almost never. One short comment only where a number is not obvious. No section banners, no "Step 1" or "Task 2.3", no "Initialize", "Handle" or "Setup" narration, no JSDoc on small functions.
- No `console.log`, TODO, commented out code, dead code, unused imports or IDs nothing uses.
- Small functions with plain names and early returns. No defensive null checks for elements that are always in the HTML. No wrapper classes or managers.
- Each module imports what it uses. Plugins are registered once.
- Interactive demos keep one state object and one `render()`. User text is read from the element and never interpolated into `innerHTML`.
- Prettier style formatting, consistent quotes and semicolons.

## HTML

- `body` holds the skip link, `header`, `main#main` and `footer` in that order. Header and footer never sit inside `main`.
- One `h1`. Sections use `aria-labelledby` pointing at their heading. Lists for lists, buttons for actions, links for navigation.
- Head: charset, viewport, a real title, a meta description under 155 characters, theme colour, icons, Open Graph and Twitter tags. No generator or author meta. No canonical link or absolute Open Graph URLs until there is a real domain.
- Legal pages (privacy, terms) exist, are linked from the footer, and load only the stylesheet, not the animation bundle.

## Accessibility that gets missed

- Focus never drops to `body` after an action. Move it to the next logical control.
- Results of an action are announced through an `aria-live="polite"` element that exists, empty, in the static HTML.
- Groups of radios are a `fieldset` with a `legend`. Tables are real tables with a `caption` and scoped headers.
- A scroll box gets `tabindex="0"`, `role="region"` and a label only at the widths where it actually scrolls.
- Interactive pieces that need JavaScript show a `<noscript>` line instead of dead buttons.

## Performance

- Images: `srcset` and `sizes`, explicit `width` and `height`, `loading="lazy"` and `decoding="async"` below the first screen, `fetchpriority="high"` on the hero image.
- Fonts: preload the one or two woff2 files the first screen uses, and add fallback `@font-face` rules from a local font with `size-adjust`, `ascent-override` and `descent-override` tuned so the swap barely moves the headline.
- The largest element on the first screen must be visible without JavaScript. Animate it with transform only, never from `opacity: 0`.

## Shipping hygiene

- Delete every image no file references, and every selector nothing matches.
- Build output, renders, screenshots, `.env` files and tool folders are in `.gitignore` before the first commit. `check.sh` refuses when they are not.
- No credits, "made with" lines or mention of any AI tool anywhere: comments, file names, meta tags, footers, commit messages.
