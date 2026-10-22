# Motion

One well orchestrated page load and a few scroll moments that reveal something beat motion everywhere. Under `prefers-reduced-motion: reduce` none of it runs and everything is simply there.

## Smooth scroll with GSAP

Use one clock. Lenis on the GSAP ticker, scrubs at 1:

```js
import Lenis from "lenis";
import "lenis/dist/lenis.css";

const lenis = new Lenis({ autoRaf: false, anchors: { offset: -72 } });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

- Do not stack a Lenis `duration` ease on top of small scrub values. Two easing clocks fighting is what makes fast scrolling feel jolty.
- Every scrubbed timeline uses `scrub: 1` and every pin gets `anticipatePin: 1`.
- Remove `scroll-behavior: smooth` from the CSS when Lenis runs.
- Stop rendering WebGL once its canvas is off screen.

## Never hide content waiting for JavaScript

- The hero intro is CSS keyframes that run on first paint. Do not wait for `document.fonts.ready` and then split and hide the headline, because it appears, vanishes and comes back.
- No CSS rule hides content before JavaScript runs. Scroll animation start states are set from JavaScript inside the ScrollTrigger setup.
- Run the intro and interactive setup once, outside `gsap.matchMedia()`. Only pinned and scrubbed pieces live inside it, so crossing a breakpoint never replays the intro or wipes state.

## Transforms only

- Scroll timelines change transform and opacity only, never width, height, top or left.
- Centre an element GSAP animates with `xPercent: -50, yPercent: -50`, not CSS `translate(-50%, -50%)`. GSAP overwrites the CSS transform and the element jumps.
- Compute positions from layout (`offsetLeft`, `offsetTop`, `offsetWidth`, `offsetHeight` of the untransformed element) once per refresh.

## Keep raster text sharp

- Never scale a screenshot or any image with text in it past its pixel size. Scaling a 780px screenshot 3x is what makes a zoom go blurry.
- To move from a small UI element to a big one, lay a real HTML element over the small one at the same size and position, then transform the HTML element.
- Frame sequences re-render text soft and step visibly when frames are spread over a long scroll. Use a real DOM crossfade during any phase where text has to be read.
- Canvas: set `imageSmoothingQuality = "high"` again after every resize. Resizing resets it.

## Pinned horizontal tracks

- Panels are `flex: none` rows sized by their content. No negative margins, no absolute positioning of the images.
- The travel is `track.scrollWidth - window.innerWidth`, recomputed on refresh. The scroll length may be shorter than the travel (`distance * 0.65`).
- Pin one wrapper that holds the rail and the track together so the rail does not scroll away.
- At the end of the pin the whole last panel, text included, is inside the viewport.
- Size panel images so image plus text fit below the rail with room to spare (`height: min(54vh, 500px)`).

## WebGL

Every WebGL scene has a fallback that paints without WebGL: a 2D canvas or a still image, chosen before three.js downloads. `check.sh` loads the page with WebGL off and fails when a canvas is blank.
