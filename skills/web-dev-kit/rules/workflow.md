# Workflow

The loop behind the pages people ask about. Each step exists because skipping it is how the output drifts generic.

1. **Facts file first.** Write `BRIEF.md`: what the product is, who it is for, the one action the page wants, and the only facts allowed on the page, each with where it came from. Anything missing becomes `[PLACEHOLDER: what is missing]`. Never invent a number, quote, customer, school, price, award or outcome.
2. **References before ideas.** Pick three to five real sites the person names or respects. Screenshot them and write down measured values: type sizes, ground colour, where the spectacle sits, how much of the page is quiet. The person's adjectives only point at references. The references are the spec.
   - Pull each reference's real tokens with `npx dembrandt@0.39.2 <url>` and its real fonts with `bash fonts.sh <url>`, so two builds never share a source.
   - For more references with tokens already extracted: `educlopez/design-bites` (studio and indie sites), `VoltAgent/awesome-design-md` and `VoltAgent/official-design-md` (big brands). Study their structure, never copy their surface.
3. **One sentence conceit.** Name the single idea the page commits to and put it at the top of `DESIGN.md`. Nothing on the page may contradict it.
4. **Inventory the material.** Real screenshots, real photos, real product UI. Design only what can be filled. An empty pantry is exactly what produces big type, gradients, bordered cards and soft glows.
5. **Three directions, rendered.** Use Claude Design (claude.ai, the Design artifact type) or three static HTML pages rendered at 1440. Never describe directions in prose and ask for a pick, because prose gets approved and then disappoints. The person picks by number.
6. **`SPEC.md`.** Tokens, type, exact copy, section order, motion budget per section, and the rules in `build.md`. Copy in the spec is final and the builder copies it exactly. Keep the tokens in `DESIGN.md` and lint it with `npx @google/design.md@0.4.0 lint DESIGN.md`, which also reports contrast failures.
7. **Build from the spec only.** A separate builder (a subagent or Codex) works from `SPEC.md` inside one folder and runs the build at the end.
8. **Render and measure.** A real browser at 390, 768 and 1440, scrolling in 400 to 700px steps through every pinned section, plus `bash check.sh <url>`. Look at every image.
9. **`FIXES-N.md`.** Numbered, measured defects with the exact fix for each: "the callouts overlap the h1 by 40px at 1280, move them into the phone's positioned box". Never "make it pop". Hand it back to the builder and repeat. Three rounds minimum, and most of the work is subtraction.
10. **Cold critic before the person sees it.** A fresh subagent gets only the screenshots and answers three things: what is this page for, what would you tap, and what would a designer or developer clock as AI made. Fix those first.

## Page story

For a landing page the order that sells is: the problem, why they are stuck (today's options and what each one leaves out), the fix, and what life looks like after. Visitors do not care how it works inside. Cut the mechanics, the feature tours and every section that answers a question nobody asked.

## Density

One job per screen and one primary action per page. Readable in three seconds on a phone. Plain words instead of domain jargon. Explanations go behind a tap, never inline.

## Do not repeat yourself

Before locking a direction, compare it with the sites already built for the same person on four axes: macrostructure, type pairing, palette anchor and signature moment. Change any axis that collides.
