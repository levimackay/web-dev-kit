# The look

Three or more of these on one page and it reads as machine made, however defensible each choice was alone. `check.sh` catches the fonts. The rest needs eyes.

## The signature to avoid

**Surface:** harsh gradients, a radial glow or orbs behind the hero, pure white or cream grounds by default, dot grids, drop shadows, liquid glass, the same soft radius on every element, neon, basic pastels, purple and black, rainbow colouring, one accent hue at the same intensity everywhere.

**Type:** Inter, Geist, Space Grotesk, Roboto, Arial, system stacks. Also the 2026 tasteful default set that models converge on: JetBrains Mono, IBM Plex Mono, Newsreader, Gloock, Anton, Bodoni Moda, Outfit, Hanken Grotesk, Bricolage Grotesque. One sans at 400/600/700 doing all the work. A gradient on one word of the headline. An uppercase mono micro label above every heading. Grey monospace fine print under every button.

**Layout:** three feature cards in a row, bento grids, three pricing tiers, a coloured left stripe, checkmark bullets, a row of big numbers with small captions, identical padding on every section, every section in the same max width with nothing full bleed, the centred hero of eyebrow, huge headline, one line subhead and two buttons.

**Ornament:** Lucide icons, sparkles, emoji, animated arrows, a decorative terminal window, hover animations on everything, everything fading up on scroll the same way.

**Apps:** a near black ground with one orange or purple accent, the system font, a pill primary button and a bordered rounded card around every block. That is the default AI app look. App UIs get references and rendered directions too.

## Choosing type and colour

`type.md` has the full process for fonts, with sources and licence checks. `color-expert` and `better-colors` cover colour science.

- Never work from a short list of allowed fonts. A list of tasteful fonts is exactly what a model converges on. Take the face from the chosen reference, or find a match outside the most popular Google Fonts, and check it against the reference screenshot.
- Give display, body and small print distinct voices with a reason behind each.
- Derive the palette from the imagery. Commit to a dominant ground with sharp accents. Some sections may be monochrome.

## Details that get fixed by hand every time

- Tracking on big display type: check that no letters touch in the actual headline words at every width.
- No single word alone on the last line of a headline (`text-wrap: balance`).
- Headline punctuation is a decision: either every headline ends in a period or only the hero and the close do.
- Buttons share one shape. If pills are reserved for status badges, buttons are not pills.
- Do not alternate two light greys section by section. Use one ground and a 1px rule between neighbouring light sections.
- Measure dead bands: 250px or more of empty space under a section is a defect unless it is a deliberate pause.
- Section padding varies with the content. Tight sections (tables, FAQs) get less.

## The counter moves

Alternate density hard: a full bleed image carrying one word, then a dense two column table. Set section names at display scale and let the frame crop them. Put text straight on an image made with room for it, with no scrim. Real screenshots and real photos are the evidence. A placeholder stays visibly a placeholder and is never styled to look designed.
