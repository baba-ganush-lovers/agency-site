# Type system

Why the type tokens in `src/app/globals.css` hold the values they do.

Almost every number here was wrong the first time it was estimated. They are
recorded with the measurement that produced them so they can be checked rather
than trusted, and so the same mistakes don't get made again.

Run `node scripts/measure-type.mjs` after changing hero copy or type tokens.

## The two faces

`font-display` is **Syne** at 600 and 700, for headlines and large statements
only, never below 24px. `font-text` is **Schibsted Grotesk** at 400 and 500,
for everything that is read rather than seen.

Both load through `next/font/google` with an explicit `weight` array. Passing
an array to a variable Google family requests **discrete static instances** —
one `@font-face` per weight — rather than the variable file. That is what we
want here, since every other weight is off-limits by convention anyway. This
behaviour is not in the prose docs; it is in `get-font-axes.js`, which only
requests an axis range when `weight` is `'variable'`. Note that passing a weight
array also disables the `axes` option.

`subsets: ['latin']` is effectively mandatory: the loader *throws* when
`preload` is on and subsets are absent, though the docs describe it as a warning
and mark the field optional.

## Measured constants

Taken from the real TTFs. `scripts/measure-type.mjs` fetches them from Google
Fonts and parses `hmtx` (advance widths), `glyf` (ink bounding boxes) and `OS/2`
(cap and x-height), caching the result to a gitignored
`scripts/.font-metrics.json`.

Google serves woff2 to a modern user-agent, which needs a Brotli decoder, and
EOT to an ancient IE one. A Safari 5 user-agent is what still gets raw TTF. That
is the only reason the script sends a fake UA.

| | Syne 600 | Syne 700 | Schibsted 400 | Schibsted 500 |
|---|---|---|---|---|
| unitsPerEm | 1000 | 1000 | 2048 | 2048 |
| cap height | 0.650 | 0.650 | 0.703 | 0.703 |
| x-height | 0.500 | 0.500 | 0.527 | 0.527 |
| avg lowercase advance, frequency-weighted | 0.5655 | 0.6113 | 0.5093 | 0.5191 |
| `1ch` — the advance of "0" | 0.6830 | 0.7380 | 0.6113 | — |
| ink top / bottom | +0.709 / −0.203 | +0.715 / −0.205 | +0.752 / −0.202 | — |
| **minimum collision-free line-height** | **0.912** | **0.920** | **0.955** | — |

Two consequences worth stating outright:

**Syne is wider than it looks.** Per character it is 1.200× Schibsted. But its
cap height is 0.650 against Schibsted's 0.703, so at equal point size it also
*renders smaller*. Normalised for cap height it is **1.30× wider**. Set Syne
larger to match Schibsted optically and it costs width twice over. That compound
is the entire headline-wrapping problem.

**Ink extents, not font metrics, set the line-height floor.** `hhea` ascender
and descender describe a box that is much taller than the glyphs. What actually
collides is ink: the dotted `i` at +0.715 and the `g` at −0.205.

## The three corrections

### 1. `--measure` was 62ch, meaning 84 characters

`ch` is not a character count. It is the advance width of the digit `0`, which
in Schibsted Grotesk is `0.6113em`, while real prose averages `0.4501em` per
character.

**`1ch` = 1.358 actual characters.** Divide by 1.358 before checking anything
against the under-80-characters rule.

62ch is 84 characters and 644px at 17px — over the limit, and 84px wider than
the 560px it was assumed to be.

**`--measure: 52ch`** — 71 characters, 540px at 17px.

### 2. `display-hero` line-height was 0.90, and collided

Syne 700's ink spans 0.920em. At 0.90 a descender on one line overlaps an
ascender on the next; it needs only a `g` to fall under a dotted `i` to show.

0.92 is the hard floor. **0.94** ships, leaving 0.02em of clearance.

### 3. `display-hero` was 44 → 132px, wrong in both directions

The maximum was derived from an estimated 0.60em advance. The real figure is
0.6113em, but the fitting was still too conservative: at 152px the widest
authored line of the leading candidate headline fills 96.6% of the hero column
at 1440. The minimum was timid too — at 320px the longest word is 244px against
280px available.

**56 → 152px.** The maximum is a *fitting result, not a judgement*: it is the
largest size that fits, which is not the same as the right size. See
`PLACEHOLDERS.md` — it is still unresolved.

### And one found during the build

The page margin and gutter were originally tiered — 20/32/52px stepping at 640
and 1024. Sweeping the full range showed the content width, and so the hero,
**narrowing by 20px at 640 and 36px at 1024 as the viewport widened**. That is
the same defect that disqualified hero width rule A (below), an order of
magnitude smaller and without a reflow, but the same defect. Margin and gutter
are now fluid:

```css
--page-margin: clamp(20px, 5.45px + 4.545vw, 52px);   /* 20 at 320, 52 at 1024+ */
--page-gutter: clamp(20px, 14.55px + 1.705vw, 32px);  /* 20 at 320, 32 at 1024+ */
```

## The scale

Bimodal on purpose. Text sits in a narrow band with 1.14 and 1.24 steps; display
sits an octave above with 2.06 and 2.29 steps; the mid-range is empty. Hierarchy
comes from that gap. There is deliberately **no display step below 28px**, so a
sub-heading has to be Schibsted 500 — which is what stops Syne creeping under
its 24px floor.

| Token | Face | Weight | Range | LH | Tracking |
|---|---|---|---|---|---|
| `display-hero` | Syne | 700 | 56 → 152 | 0.94 | −0.03em |
| `display-lead` | Syne | 600 | 32 → 64 | 1.00 | −0.02em |
| `display-sub` | Syne | 600 | 24 → 28 | 1.15 | −0.01em |
| `text-lead` | Schibsted | 400 | 18 → 21 | 1.50 | 0 |
| `text-body` | Schibsted | 400 | 16 → 17 | 1.60 | 0 |
| `text-small` | Schibsted | 400 | 14 | 1.55 | 0 |

Fluid range is anchored 375 → 1440. Every middle term is `rem + vw`, never bare
`vw` — a pure-viewport scale ignores browser text zoom and fails WCAG 1.4.4.

At ≤480px line-heights loosen (`display-hero` 1.00, `display-lead` 1.05,
`text-body` 1.65). Smaller type at a shorter measure needs more leading, not the
same amount.

Negative tracking on Syne is optical correction at display size, not styling.
Schibsted carries none: it is chosen to be quiet.

## Copy constraints that follow from the metrics

These are typography rules that can only be honoured in the writing.

- **The hero headline contains no word longer than 10 characters.** At the 56px
  floor, 320px leaves room for 10.9 characters. A 14-letter word cannot be made
  to fit at any size that still counts as a hero, so it must not exist.
- **A `display-hero` line holds about 13 characters** at its 152px maximum. A
  three-line headline is therefore roughly 39 characters total. This is why the
  answer to a headline that doesn't fit is fewer words, not smaller type.
- **Display type never wraps on its own.** Headlines are marked up as phrase
  atoms — `white-space: nowrap` units — so breaks can only fall on authored
  seams. One DOM, one accessible string, no duplicated copies for a screen
  reader to read twice, and no JS.
  This also makes font swap safe: a metric-adjusted fallback can change a line's
  *width*, but never *which words are on which line*, so the composition cannot
  rearrange itself in front of the reader.
- `text-wrap: balance` is not used. It is non-deterministic across engines and
  would fight authored breaks.

## Hero width

The hero is a single sentence, so its width sets its line count.

**Rule B ships:**

```css
--hero-w: min(744.24px + 22.8873vw, 100%, 1061px);
```

Three terms, no breakpoint. The viewport term opens air on the right as the
window grows; `100%` holds the hero to the content width until there is air to
open; `1061px` caps it at exactly 5/6 of the six-column grid.

**The precision is load-bearing.** The slope is set so the hero reaches its
1061px cap at exactly vw=1384 — the same viewport where the content width caps
at 1280. Round it to `744px + 22.89vw` and it arrives at 1060.8 instead, so the
hero keeps growing for a few pixels after the content stops, and the air on the
right shrinks by 0.2px. Sub-pixel and invisible, but it is a real
non-monotonicity and the sweep reports it.

**Rule A was rejected.** It switched from full content width to a 5/6 column
span at 1200px. A 5/6 span is always narrower than the full width at the same
viewport, so the hero jumped from 1088px to 908px and gained a line — narrowing
and reflowing as the window got *wider*. `--rule A` keeps it reproducible.

## Running the check

```
node scripts/measure-type.mjs                     # current copy, rule B, 320–2560 @ 8px
node scripts/measure-type.mjs --sentence "..."    # check new copy before committing it
node scripts/measure-type.mjs --rule A            # reproduce the rejected rule's defect
node scripts/measure-type.mjs --font "clamp(2rem, 1.30rem + 3.00vw, 4rem)"
node scripts/measure-type.mjs --refresh           # re-fetch and re-measure the font files
```

**Exit 1**, with every offending viewport named, on either:

- **a line exceeding 100% fill** — the hero overflows its column, and
- **non-monotonic hero width** — the hero narrows as the viewport widens.

Non-monotonic air and line count are reported but do not fail. They are
composition problems rather than correctness ones; rule A's line count going
5 → 6 at 1200 is how that rule was caught.

Exit 2 means bad input or an unmeasurable character.

**Why this script exists.** Longest-line fill currently runs 95–99% across the
whole range. There are single-digit pixels of slack at the tightest point, so a
one-word change to the hero sentence can push a line past 100% at one specific
viewport band — and a screenshot at three or four widths will not find it. Both
defects recorded above were invisible at sampled widths and only appeared under
a dense sweep.

It does not run in CI yet. It should, once there is a hero to check.
