# Type system

Why the type tokens in `src/app/globals.css` hold the values they do.

Almost every number here was wrong the first time it was estimated. They are
recorded with the measurement that produced them so they can be checked rather
than trusted, and so the same mistakes don't get made again.

Run `node scripts/measure-type.mjs` after changing hero copy or type tokens.

## The two faces

`font-display` is **Syne** at 600 — one weight, one display register — for
headlines and large statements only, never below 24px. `font-text` is
**Schibsted Grotesk** at 400 and 500, for everything that is read rather than
seen.

Both load through `next/font/google` with an explicit `weight` array.

**A weight array does not reliably give you static instances.** `next/font`
builds one CSS2 request listing every weight (`get-font-axes.js` only asks for
an axis range when `weight` is `'variable'`), but what Google returns for that
combined request depends on the family. Measured:

| request | latin slice returned |
|---|---|
| `Syne:wght@600` | static instance, 14 KB |
| `Schibsted Grotesk:wght@400` alone | static instance, 24 KB |
| `Schibsted Grotesk:wght@500` alone | static instance, 24 KB |
| `Schibsted Grotesk:wght@400;500` **together** | **one 46 KB file, referenced by both `@font-face` rules** |

So Syne ships as a static instance and Schibsted ships as a single variable file
covering both weights. That is a fine outcome — 45 KB once beats 24 KB twice,
and it is one fewer request — but the mechanism is not what the docs imply, and
it will differ per family. Check the build output, don't assume. (Passing a
weight array also disables the `axes` option.)

**`subsets` gates preloading, not emission.** With `subsets: ['latin']` the
build still emits the greek and latin-ext slices; they simply are not preloaded,
and their `unicode-range` means they are never fetched for this site's content.
What the actual build produces:

| file | weight | slice | size | fetched on load |
|---|---|---|---|---|
| Syne | 600 | latin | 14 KB | yes, preloaded |
| Syne | 600 | latin-ext | 6 KB | no |
| Syne | 600 | greek | 4 KB | no |
| Schibsted | 400 + 500 | latin | 45 KB | yes, preloaded |
| Schibsted | 400 + 500 | latin-ext | 20 KB | no |

**59 KB of font on first load.** Note that Schibsted 500 currently has no
consumer — the scale reserves it for sub-headings, which is what keeps Syne out
of text sizes. Dropping it would make Schibsted a single 24 KB static instance
and halve the font payload; that is a live option if 500 never gets used.

`subsets` is nonetheless effectively mandatory: the loader *throws* when
`preload` is on and subsets are absent, though the docs describe it as a warning
and mark the field optional.

The fallback faces carry metric overrides, which is what keeps layout shift at
zero: `Syne Fallback` is `local(Arial)` with `size-adjust: 98.47%`,
`ascent-override: 93.93%`, `descent-override: 27.93%`; `Schibsted Grotesk
Fallback` is `size-adjust: 104.49%`, `ascent-override: 93.46%`.

## Measured constants

Taken from the real TTFs. `scripts/measure-type.mjs` fetches them from Google
Fonts and parses `hmtx` (advance widths), `glyf` (ink bounding boxes) and `OS/2`
(cap and x-height), caching the result to a gitignored
`scripts/.font-metrics.json`.

Google serves woff2 to a modern user-agent, which needs a Brotli decoder, and
EOT to an ancient IE one. A Safari 5 user-agent is what still gets raw TTF. That
is the only reason the script sends a fake UA.

| | Syne 600 | Syne 700¹ | Schibsted 400 | Schibsted 500 |
|---|---|---|---|---|
| unitsPerEm | 1000 | 1000 | 2048 | 2048 |
| cap height | 0.650 | 0.650 | 0.703 | 0.703 |
| x-height | 0.500 | 0.500 | 0.527 | 0.527 |
| avg lowercase advance, frequency-weighted | 0.5655 | 0.6113 | 0.5093 | 0.5191 |
| `1ch` — the advance of "0" | 0.6830 | 0.7380 | 0.6113 | — |
| ink top | +0.709 | +0.715 | +0.752 | — |
| ink bottom, descender (`g`) | −0.203 | −0.205 | −0.202 | — |
| ink bottom, overshoot (`o`) | −0.011 | −0.011 | −0.010 | — |
| **minimum collision-free line-height** | **0.912** | **0.920** | **0.955** | — |
| OS/2 typo asc / desc | 0.925 / −0.275 | 0.925 / −0.275 | — | — |
| USE_TYPO_METRICS | yes | yes | — | — |

¹ Measured but **not loaded** — see "Why there is one display register".

Two consequences worth stating outright:

**Syne is wider than it looks.** Per character Syne 600 is 1.110× Schibsted.
But its cap height is 0.650 against Schibsted's 0.703, so at equal point size it
also *renders smaller*. Normalised for cap height it is **1.20× wider**. Set Syne
larger to match Schibsted optically and it costs width twice over. That compound
is the entire headline-wrapping problem.

**Ink extents, not font metrics, set the line-height floor.** `hhea` ascender
and descender describe a box that is much taller than the glyphs. What actually
collides is ink: in Syne 600 the dotted `i` reaches +0.709 and the `g` −0.203,
so 0.912em is the floor no matter what the font's own metrics claim.

## The corrections

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

0.92 is the hard floor; 0.94 was chosen, leaving 0.02em. The token was cut soon
after (below) and the tightest line-height in the system is now `display-lead`
at 1.00, with 0.088em of clearance. The lesson stands regardless: **measure ink,
not the font's declared ascender and descender.**

### 3. `display-hero` was 44 → 132px, and is now gone entirely

The maximum was first re-derived as 152px, which was a *fitting result, not a
judgement* — the largest size at which the widest authored line fits the hero
column, which is not the same as the right size. Rendered at 96 / 120 / 152 on
the specimen, 120 and 152 both read as too large and 96 was chosen.

96 against `display-lead`'s 64 is 1.5×, and the token was then cut. See below.

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

## Why there is one display register

`display-hero` is deleted, and Syne 700 with it. Three faces load, not four.

The scale is bimodal on purpose: text steps 1.14 and 1.24, display steps 2.06
and 2.29, and an empty band between them. A second display size 1.5× from
`display-lead` sits exactly in that empty band — it is the wobble the gap exists
to prevent, and on the specimen it read as two sizes of the same thing rather
than two registers.

Three further reasons, in order of weight:

1. **Nothing consumes it.** Concept C's hero is `display-lead`. A larger step
   downstream would compete with the hero, which is backwards — the hero should
   be the largest type on the page.
2. **It removed the tightest line-height in the system.** Syne 700 at 0.94 has
   ink of 0.920em, leaving **0.020em** of collision clearance. Syne 600 at 1.00
   has 0.088em — 4.4× the margin. The one place a rounding error could have put
   a `g` into an `i` is gone.
3. It drops a font file.

The cost is foreclosing a large closing statement. `display-lead` at 64px
full-bleed already is one; Concept C's whole argument is that mass is not point
size. If a genuine second register is needed later it should be **≥2×
`display-lead`** — 128px or more — and decided with the content that needs it.

## The occlusion seam

Concept C's only depth mechanism is a panel crossing the hero's final line.
The contract is that it **clips descenders and nothing else**.

Measured in Syne 600, baseline at 0:

| | ink bottom |
|---|---|
| `g` | −0.2030 |
| `j` `p` `q` `y` | −0.2000 |
| `a b c d e o s u` (round-letter overshoot) | −0.0110 |
| everything else | 0.0000 |

So the seam must sit inside **(−0.203, −0.011)** — below every round letter,
above the descender tips. It ships at **−0.069em**, which leaves 0.058em of
clearance under the round letters and hides 0.134em of descender: 4.3px at 320,
8.6px at 1440.

An earlier version put it 0.08em *above* the baseline, with a 0.20em mobile
override "so it bites harder at small sizes". The x-height is 0.500em, so that
override was slicing **40% off every letter body** — collision, not occlusion.

**There is no mobile override and there cannot be one.** The entire descender is
0.203em, which at 32px type is 6.5px. There is nothing left to bite into without
cutting letters. Presence at small sizes has to come from the panel's own mass.

In CSS the offset is derived rather than restated, because restating it is how
the seam and the line-height drifted apart in the first place:

```css
--seam-below-baseline: 0.069em;
--seam-from-bottom: calc(lh * 0.5em - 0.325em - var(--seam-below-baseline));
```

`0.325em` is `(typoAscender + typoDescender) / 2` = `(0.925 − 0.275) / 2`. Syne
sets `USE_TYPO_METRICS`, so the browser uses the OS/2 typo values; here they
match hhea, so there is no ambiguity.

**Open problem.** The mechanism only shows when the final line *has* a
descender. With the current hero copy it does not at 320, 375, 414, 568, 900,
1024, 1100 or 1200 — only at 768 and 1440+, where "places." lands last. At the
other widths the hero keeps its layering but loses its occlusion. This is a
hero-build decision, not a token one; see `PLACEHOLDERS.md`.

## The scale

Bimodal on purpose. Text sits in a narrow band with 1.14 and 1.24 steps; display
sits an octave above with 2.06 and 2.29 steps; the mid-range is empty. Hierarchy
comes from that gap. There is deliberately **no display step below 28px**, so a
sub-heading has to be Schibsted 500 — which is what stops Syne creeping under
its 24px floor.

| Token | Face | Weight | Range | LH | Tracking |
|---|---|---|---|---|---|
| `display-lead` | Syne | 600 | 32 → 64 | 1.00 | −0.02em |
| `display-sub` | Syne | 600 | 24 → 28 | 1.15 | −0.01em |
| `text-lead` | Schibsted | 400 | 18 → 21 | 1.50 | 0 |
| `text-body` | Schibsted | 400 | 16 → 17 | 1.60 | 0 |
| `text-small` | Schibsted | 400 | 14 | 1.55 | 0 |

Fluid range is anchored 375 → 1440. Every middle term is `rem + vw`, never bare
`vw` — a pure-viewport scale ignores browser text zoom and fails WCAG 1.4.4.

At ≤480px line-heights loosen (`display-lead` 1.05, `text-body` 1.65). Smaller type at a shorter measure needs more leading, not the
same amount.

Negative tracking on Syne is optical correction at display size, not styling.
Schibsted carries none: it is chosen to be quiet.

## Copy constraints that follow from the metrics

These are typography rules that can only be honoured in the writing.

- **No word longer than 18 characters at the 32px floor.** 320px leaves 280px,
  which at Syne 600's 0.5655em advance is about 15.5 characters — and the check
  script fails on anything wider. ("internationalisation" overflows until
  352px.) A word that cannot fit at the floor must not exist in the headline.
- **Display type never wraps on its own** where breaks matter. Headlines are marked up as phrase
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

The current hero copy is 23 words: *"Most teams buy the thing that runs and the
thing that tells them if it works from two different places. We build both."*
It runs to 8 lines at 320 and 4 at 1440, peak fill 99.8% at 1216.

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
