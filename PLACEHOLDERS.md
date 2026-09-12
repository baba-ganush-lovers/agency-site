# Placeholders

Everything temporary, and what has to happen before it stops being temporary.
Each entry is marked with a `PLACEHOLDER` comment at its site.

## Unresolved decisions

### The occlusion seam only fires at some widths

The seam clips descenders and nothing else — that is its contract, and it is now
correct. But it can only clip a descender if the hero's **final line contains
one**, and with the chosen copy it usually does not:

| viewport | final line | descender |
|---|---|---|
| 320 / 375 / 414 | "We build both." | none |
| 568 | "build both." | none |
| 768 | "different places. We build both." | `p` |
| 900 / 1024 / 1100 / 1200 | "build both." | none |
| 1440 and up | "places. We build both." | `p` |

So at eight of twelve sampled widths the hero keeps its translucent layering but
loses its occlusion — and occlusion is one of the only two depth mechanisms the
rulebook permits.

Three ways out, in the order I'd rank them:

1. **One word in the ending.** "We build both." has no descender in any letter.
   Something like "We build both parts." or "We build the pair." restores it at
   every width. Cheapest fix, but it is your copy.
2. **Accept opportunistic occlusion.** The panel still crosses the block
   boundary; where a descender exists it is clipped. Honest, but the hero reads
   flat at most widths.
3. **Give the panel a different bite** — have it cross the *ragged right edge*
   of a line rather than the bottom. Needs the hero composition to be settled
   first.

*Resolve at:* the milestone 1 step 3 gate, with the hero. Not a token decision.

## Resolved since the last gate

- **`display-hero` — cut.** 152px was a fitting result; 96px was chosen by eye,
  which put it 1.5× from `display-lead` — inside the empty band the bimodal
  scale exists to keep empty. The token and Syne 700 are both gone. Three font
  faces load. Reasoning in `docs/type-system.md`.
- **Hero copy — the 23-word version wins**, ending "We build both." It is
  `HERO` in `scripts/measure-type.mjs`; 8 lines at 320, 4 at 1440, peak fill
  99.8%, passes.
- **Hero width — rule B.** `min(744.24px + 22.8873vw, 100%, 1061px)`.
- **Seam offset — 0.069em below the baseline**, no mobile override.

## Temporary content

### Studio name — does not exist

There is no studio name and no wordmark. Consequently:

- `src/config/brand.ts` and `src/components/brand/Wordmark.tsx` do **not exist
  yet**. They arrive with the layout shell at step 2, which is the first thing
  that needs to display a name.
- `src/app/layout.tsx` sets the metadata title to `"Software and data studio"`
  — deliberately a description rather than a name, so nothing has to be
  un-invented later. It moves to `brand.name` once that file exists.

### `src/app/page.tsx` — holding page

One line and a link to the specimen. Replaced by the hero at step 3.

### `/specimen` — temporary route

`src/app/specimen/page.tsx` and `src/app/specimen/specimen.css`. Exists to make
the type decisions visible rather than argued. **Delete both at the step 3
gate**; nothing else imports them, and no specimen CSS was put into
`globals.css`.

What survives its deletion: `docs/type-system.md` and
`scripts/measure-type.mjs`.

## Not placeholders

Listed because they look provisional and are not:

- The palette and the two typefaces are decided. See `CLAUDE.md`.
- Hero width rule B's constants (`744.24px + 22.8873vw`) carry full precision
  on purpose. Rounding them reintroduces a measurable defect —
  `docs/type-system.md` explains why.
- The seam offset of `0.069em` is bounded on both sides by measured ink and is
  not a taste value. Above −0.011em it cuts letter bodies; below −0.203em it
  clips nothing.
