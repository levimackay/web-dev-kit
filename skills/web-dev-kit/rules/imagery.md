# Imagery

Real material is the strongest signal that a person made the page. An empty page filled with gradients and glows is the strongest signal that one did not.

## What may go on a real business's site

- **Their own photos and real product screenshots first.** Ask for them. A visible placeholder with a list of what is missing beats a convincing fake.
- **Never generated people, staff, shopfronts, products or customers.** Generated images are for textures, grounds and abstraction only. There is no clear legal rule on generated product photos, so this kit sets its own. Generated reviews and testimonials are banned outright in the US by the FTC rule on fake reviews (16 CFR Part 465, in force since 2024-10-21).
- **Grain and texture in code** where possible: an SVG `feTurbulence` filter has no licence to track.
- **Log every image** in `IMAGE-SOURCES.md`: file, source URL, licence, creator, where it is used, date. That log makes a takedown request cheap to honour.

## Sources with a clear licence

| Source | Access | Licence notes |
| --- | --- | --- |
| Openverse | `https://api.openverse.org/v1/images/?q=<query>&license=cc0,pdm`, no key | Returns creator and licence per item, so the credit line comes with the result |
| Wikimedia Commons | `https://commons.wikimedia.org/w/api.php`, no key | Licence per file in `extmetadata.LicenseShortName` |
| The Met, Cleveland Museum of Art | `metmuseum/openaccess`, `ClevelandMuseumArt/openaccess` on GitHub | CC0 items |
| Smithsonian Open Access | `api.si.edu/openaccess`, free api.data.gov key | CC0 items |
| Rijksmuseum | data.rijksmuseum.nl, no key | Public domain and CC0 per its policy |
| NASA | `https://images-api.nasa.gov/search?q=<query>`, no key | Generally not copyrighted in the US. No implied endorsement, no NASA logos, permission needed for identifiable people |
| Poly Haven, ambientCG | Public APIs | CC0 textures and HDRIs |
| Unsplash | API or site | Free, but no selling unmodified copies and no competing service. Through the API you must hotlink `photo.urls`, call `download_location`, and credit the photographer and Unsplash |
| Pexels | API or site | No implied endorsement by people or brands shown, no trademarks, no redistribution |

## Using them well

- Choose images for where the words go. Text sits directly on an image that leaves room for it, with no scrim.
- Derive the palette from the imagery, not the other way round.
- One strong image carrying a section beats a grid of small ones.
- Serve them as described in `build.md`: `srcset`, explicit sizes, lazy below the first screen, never upscaled past their pixel width.
