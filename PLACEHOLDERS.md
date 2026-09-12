# Placeholders

Everything temporary, and what has to happen before it stops being temporary.
Each entry is marked with a `PLACEHOLDER` comment at its site.

## Waiting on copy

### The hero's last line — `src/config/hero.mjs`

"We build both." has no descender, so the seam has nothing to clip and the
hero has no occlusion. `node scripts/measure-type.mjs` **fails by design**
until the last line is rewritten; it exits 0 the moment the last atom carries
ink below the seam.

The mechanism is settled: the final sentence is one unbreakable atom, so
whatever descender it carries is on the last row at every width. The
constraint on the writing is only that the atom fits the 280px column at the
32px floor. Measured, as single atoms at 320:

| ending | fill at 320 | fits |
|---|---|---|
| "We build the pair." | 98.0% | yes |
| "We ship both." | 90.8% | yes |
| "We build both parts." | 113.4% | no — unless split into two atoms |
| "We build both, properly." | 133.0% | no — unless split into two atoms |

Check a candidate with `node scripts/measure-type.mjs --ending "..."`.

*Resolve at:* whenever the studio writes it. Not a gate.

### Lead copy — `src/components/home/Hero.tsx`

The panel below the hero holds `<PlaceholderBlock label="lead copy" />`.
Written by the studio. The slot is `text-lead` at `max-w-measure`; it needs to
be true (see the content rules in `CLAUDE.md`) and can be as short as one
sentence.

## Temporary content

### Studio name — does not exist

There is no studio name yet. `brand.name` in `src/config/brand.ts` holds
`"Studio"` until one is chosen; `src/components/brand/Wordmark.tsx` typesets
it. `src/app/layout.tsx`'s metadata title reads `brand.name` directly, so it
will pick up the real name automatically once `brand.ts` is updated — nothing
else to change.

### Contact email — does not exist

`src/components/layout/Header.tsx` has a single nav item, "Contact", as a
`mailto:` link to `hello@studio.example`. `.example` is the RFC 2606 reserved
domain — it reads as a placeholder rather than a broken real address. Replace
with the studio's real address once there is one.

## Resolved at the step 3 gate

- **The seam clips at every width** — mechanism-wise. The last line is one
  atom, so its descender (once it has one) is always on the last row, and the
  script guards it.
- **The specimen's seam never occluded anything.** It painted a 6% white panel
  over white text, which hides nothing; the descenders ran straight through
  the hairline. The hero now clips its own ink at the seam and the panel
  begins where the ink stops. `docs/type-system.md` has the details.
- **Phrase atoms change the composition.** Atoms small enough for 320px make
  the headline five authored lines, not four. The sweep now models the real
  markup. `docs/type-system.md`, "Authored lines".
- **`/specimen` and the holding page — deleted.** Nothing else imported them.
  What survives: `docs/type-system.md` and `scripts/measure-type.mjs`.

## Not placeholders

Listed because they look provisional and are not:

- The palette and the two typefaces are decided. See `CLAUDE.md`.
- Hero width rule B's constants (`744.24px + 22.8873vw`) carry full precision
  on purpose. Rounding them reintroduces a measurable defect —
  `docs/type-system.md` explains why.
- The seam offset of `0.069em` is bounded on both sides by measured ink and is
  not a taste value. Above −0.011em it cuts letter bodies; below −0.203em it
  clips nothing.
- The panel under the hero is full-bleed with no radius. It is the page's
  second plane, not a card; a card's corner would curve under the first word
  of the last line.
