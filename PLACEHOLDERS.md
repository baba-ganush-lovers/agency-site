# Placeholders

Everything temporary, and what has to happen before it stops being temporary.
Each entry is marked with a `PLACEHOLDER` comment at its site.

## Unresolved decisions

### `display-hero` maximum — 152px is provisional

`--text-display-hero` currently tops out at 152px. That number is a **fitting
result, not a judgement**: it is the largest size at which the widest authored
line of the candidate headline fits the hero column at 1440, which is not the
same as the right size.

`/specimen` renders 96 / 120 / 152 on the same string for the comparison, and
`display-hero` beside `display-lead` at maximum for the related question —
whether Concept C needs a second display register at all, or whether the lead
size carries the whole page. If it doesn't, the token and the Syne 700 weight
both come out.

*Resolve at:* the milestone 1 step 1 gate.

### Hero sentence — length undecided

The current 28-word sentence runs to **ten lines at 320px** and orphans
"people." on its own line at 1100 and 1200. A trimmed 22-word variant is
rendered beside it in `/specimen`. This is a copy decision, not a layout one.

Whichever wins, put it in `scripts/measure-type.mjs` as `HERO` and re-run the
script — longest-line fill sits at 95–99%, so there is very little slack.

*Resolve at:* the milestone 1 step 3 gate, with the hero.

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
