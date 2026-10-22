# Responsive

Mobile is designed, not stacked. Decide what disappears, what grows, what reorders and what stays dominant at 390px. Check 390, 768, 1024, 1280 and 1440, not only the two ends.

- **Sideways scroll.** Find the element that is wider than the screen and fix it. `overflow-x: hidden` on `body` is not a fix. `overflow-x: clip` on the one section that bleeds on purpose is.
- **The fold.** At 1440x900 the hero's buttons and the line under them end above about 860px. Tighten padding and gaps before shrinking the headline.
- **Breakpoint pieces.** Anything built for one range (numbered markers for phones, callouts for desktop) is hidden at every other width. Switch at the width where things start to collide, not at a round number.
- **Navigation.** Decide each range: which links stay, which collapse. A header that wraps onto two rows at 768 is a defect.
- **Tables on phones.** Below about 700px lay a table out as stacked rows with the same markup (`display: block` on the table parts) and labels from `data-label` shown with `td::before`. Between 700 and 900 a scroll box with the row headers sticky on the left.
- **Screenshots on phones.** If an app screenshot becomes unreadable when it shrinks, keep a minimum width inside its own scroll box, or use a crop made for phones.
- **Decorations sized to text.** Strike lines, underlines and highlights drawn with pseudo elements need `display: inline-block` or `width: fit-content` on the text, or they measure the whole row.
- **Sticky elements.** `position: sticky` only works on the grid or flex child itself, not inside an auto height wrapper.
- **Side by side buttons on phones** use `flex: 1` and the same height, or stack full width. Never two different widths.
- **Overlap.** Callouts, badges and floating labels must never touch the headline at any width in between the breakpoints you designed.
