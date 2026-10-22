# Type

Type is where a page first reads as AI made. Models converge on the same tasteful handful, so a list of good fonts is the problem, not the fix. Take the face from the chosen reference, or from a source outside the most used set, and prove the licence before it ships.

## Picking a face

1. **Read what the reference really renders.** `bash fonts.sh <reference url>` prints the face each element renders (not just the CSS alias) and what the font file says about its foundry, designer and licence. Computed `font-family` alone misleads: a site can call its face `vtf-centerline` and render Velvelyne.
2. **If the reference's face is paid,** look for a libre face with the same structure in the sources below. Never ship a trial file. Pangram Pangram's free files cover personal use, portfolios and pitches only and need a paid web licence per domain. Luzi Type test fonts are for review only.
3. **Check it against the reference screenshot** at the same size and weight before committing.
4. **Avoid the top of Google Fonts.** `check.sh` warns on any family in the 150 most used there, because those are what a model reaches for by default. The live ranking is at `https://fonts.google.com/metadata/fonts` (lower `popularity` is more used).

## Libre sources outside the default set

| Source | Licence | Character |
| --- | --- | --- |
| Velvetyne, velvetyne.fr (mirror velvetyne.alwaysdata.net), gitlab.com/velvetyne | Mostly OFL, credit the designer and foundry | Atypical, punk, display faces |
| Velvetyne Libre Friends (on the Velvetyne site) | Per foundry | About thirty libre foundries in one list, the best source of sources |
| Collletttivo, collletttivo.it | OFL, credit asked | Young European designers, experimental |
| Tunera, tunera.xyz | OFL, credit Tunera and the designer | Ariel Martín Pérez's foundry |
| Uncut, uncut.wtf | Varies per font, check each one | 160 or so contemporary faces, mostly linking to their designers |
| The League of Moveable Type | OFL | Classic libre catalogue, though its best known faces are already common |
| Fontsource, fontsource.org | Per package, in its metadata | Self hosting through npm, including about 120 non Google families |
| Google Fonts beyond the top 150 | OFL, Apache or UFL | 1,950 families. The long tail is fine, the head is the tell |

Fonts In Use (fontsinuse.com) and Typewolf (typewolf.com) show faces in real work. Use them to study pairings people actually shipped, not generated pairing lists.

## Setting it

- Self host. `npm i @fontsource-variable/<face>` or a downloaded woff2 in the repo. Do not hotlink.
- Subset to the characters the site uses: `npx subfont@7.3.0 dist/index.html -i` on the built site, or `glyphhanger` to find the unicode range, or `pyftsubset` from fonttools.
- Pin or trim variable axes you do not use (`fonttools varLib.instancer`).
- Metric matched fallbacks so the swap does not shift the layout: `fontaine` (1.0.3) generates them, or set `size-adjust`, `ascent-override` and `descent-override` by hand.
- Size by cap height when type has to line up with other elements: Capsize (`@capsizecss/core` 4.1.3).
- Preload only the one or two files the first screen needs.

## Before shipping

- Read the licence in the font file (`fonts.sh` prints it) and on the foundry page. OFL needs no fee but the licence travels with the files, and some foundries ask for credit.
- Keep a `FONTS.md` next to the site: face, source URL, licence, where it is used.
