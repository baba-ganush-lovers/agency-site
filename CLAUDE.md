# CLAUDE.md

Project rulebook. Read this fully before doing anything in this repo.

## What this is

The marketing site for a two-person software and data studio. One engineer is
full-stack (Europe), the other works with data (USA).

The studio's client work is largely confidential or company-owned, so it cannot
be shown publicly. **This site is therefore the portfolio piece.** A prospective
client evaluating us will judge our engineering ability primarily by this site:
its interaction quality, its performance, its responsiveness, its accessibility,
and — since the repo is public — its source.

Build accordingly. Nothing here is throwaway marketing-site code.

## Current scope: the homepage only

Do not build other pages, routes, or a full site architecture yet. The homepage
is the test. If it isn't convincing, the rest of the site is wasted work.

Out of scope until the homepage is approved:

- `/work`, `/services`, `/about`, `/contact`, or any other route
- a CMS, blog, or content pipeline
- case study templates
- a component library intended for reuse across pages

Build what the homepage needs and nothing more. Resist generalising early —
premature abstraction here is a real failure mode, not a virtue.

## Stack

Fixed. Do not substitute.

| Layer | Choice |
|---|---|
| Framework | Next.js 16, App Router |
| Language | TypeScript, `strict` |
| Styling | Tailwind v4 (CSS-first `@theme` tokens) |
| Animation | GSAP + ScrollTrigger, via `@gsap/react`'s `useGSAP` |
| Fonts | `next/font` |
| Hosting | Vercel |

**Ask before adding any dependency.** State what it does, what it costs in
bundle size, and what writing it ourselves would take. Most of the time the
answer will be that we write it ourselves.

Specifically do not add: Framer Motion / Motion (GSAP covers it — two animation
libraries is a mistake), Lenis or ScrollSmoother (hijacked scroll is the
clearest "cloned an Awwwards site" tell and breaks native scroll feel),
Three.js / React Three Fiber (only if a specific approved concept requires it),
shadcn/ui or any component kit (recognisable on sight), an icon library before
we know we need more than three icons.

## Identity

Palette and typefaces are decided and are specified below. The studio name and
logo do not exist yet — those remain placeholders, and the rules below keep
them swappable.

Rules:

- The studio name lives **only** in `src/config/brand.ts`. Never hardcode it.
- The wordmark is `src/components/brand/Wordmark.tsx`, typeset from
  `brand.name`. Do not create an SVG logo, generate a mark, or invent one.
- Colours come from the `@theme` tokens in `globals.css`. Never write a raw hex
  value or a Tailwind default colour class (`bg-slate-900`, `text-gray-400`) in
  a component.
- Two families, both through `next/font/google`:
  `font-display` is Syne (weights 600, 700) — headlines and large statements only.
  `font-text` is Schibsted Grotesk (weights 400, 500) — everything else.
- Syne is never used below 24px. Its width and tight apertures make it hard work
  at text sizes, and mixing it into body copy is the fastest way to make the page
  look amateur. If a piece of type is being read rather than seen, it is
  `font-text`.
- Schibsted Grotesk is chosen to be quiet. Do not give it personality — no
  tracking tricks, no small caps, no weight above 500.
- Mark every temporary value with a `PLACEHOLDER` comment and list it in
  `PLACEHOLDERS.md`.

The point is that choosing a name and two typefaces later should mean editing
three files, not forty components.

### Palette

Decided. These are the values — do not propose alternatives.

```css
--color-bg:       #2B103D;   /* deep plum ground */
--color-fg:       #FFFFFF;
--color-violet:   #6574FF;   /* periwinkle */
--color-lime:     #B8F60D;
--color-purple:   #8103FC;

/* Glow field — page background only */
--color-abyss:    #180A28;   /* deepest plum, edges and vignette */
--color-glow-blue:   #2B5BD7;
--color-glow-violet: #6574FF;
```

The ground is `--color-bg`, darkened toward `--color-abyss` at the edges, with
two soft radial glows bleeding in from opposite corners:

```css
body {
  background:
    radial-gradient(80% 60% at 12% 8%,  color-mix(in oklab, var(--color-glow-blue) 55%, transparent), transparent 70%),
    radial-gradient(70% 55% at 88% 92%, color-mix(in oklab, var(--color-glow-violet) 40%, transparent), transparent 72%),
    radial-gradient(120% 100% at 50% 50%, var(--color-bg), var(--color-abyss));
  background-attachment: fixed;
}
```

The glow is atmosphere and belongs to the page background only. Never put a
gradient on a card, button, heading, or divider. Two glow sources maximum — a
third turns the page to soup. Keep them far from the headline so contrast holds
where text sits; measure it there, not at the darkest point.

**Contrast, measured on the ground:**

| Colour | Ratio | Permitted use |
|---|---|---|
| `#FFFFFF` | 16.9:1 | All text, any size |
| `#B8F60D` | 13.0:1 | Text, borders, fills. Black text on it: 16.2:1 |
| `#6574FF` | 4.4:1 | Large text (24px+) and borders only — never body copy |
| `#8103FC` | 2.7:1 | **Fills only.** Never text, never a hairline. White on it: 6.3:1 |

`#8103FC` failing on the ground is not negotiable by design preference — a
2.7:1 hairline is invisible on a dimmed laptop screen. If you want purple to
carry text, it has to sit on a fill.

**Usage:** white does the reading. One accent leads per view — do not use
lime, periwinkle and purple together in the same section. Accent still appears
only where something is live, active, or changing.

Surfaces are translucent panels over the gradient: white at 4–8% with a white
hairline at 10–14%, generous corner radius. Keep the blur subtle and check what
it costs on scroll before committing to it.


## Content rules

**Never invent facts about the studio.** No fake clients, logos, testimonials,
metrics, awards, years-in-business, team size claims, or case study results.
If the design needs a slot for something we don't have, render a labelled
placeholder block and note it in `PLACEHOLDERS.md`.

Copy is design content, not filler. Write it as carefully as the layout: plain
verbs, sentence case, active voice, no marketing inflation. Two engineers who
are good at their work should sound like it. Flag any copy you are unsure about
rather than writing something confident and hollow.

Do not use stock photography, even temporarily. It shapes the layout around
images we will never ship. Use `<PlaceholderMedia>` with the correct aspect
ratio instead.

## Design direction

We are the creative directors. Your job is to get from our taste to a working
implementation, not to decide what the studio looks like. When a visual
decision is genuinely open, propose options with trade-offs rather than picking
silently.

What the homepage has to communicate: serious engineering capability, and the
software × data pairing that makes this studio specific. Not "we build
websites."

### Composition principles

These are decided. Work within them.

- **The hero is typographic.** Set at a scale that commits — the headline is
  the composition, not an element placed within it. If it could be mistaken for
  a large heading, it isn't large enough.
- **Depth comes from two mechanisms, both deliberate.** One element passes
  through or in front of the headline plane (occlusion), and translucent panels
  sit over the glow field (layering). Never drop shadows, never a third
  mechanism. If a section uses neither, it should be flat — not "slightly
  raised".
- **Hierarchy comes from scale contrast.** The ratio between headline and
  supporting copy does the work. No eyebrow labels, no dividers, no section
  headings explaining what the reader is looking at.
- **Any central object must mean something.** No decorative abstract geometry,
  no chrome blob, no particle field standing in for a mark.
- **One accent leads per view.** The palette has three, but a section that uses
  all three has no hierarchy. Accent marks what is live, active, or changing.
- **We cannot display proof.** No client logos, no award badges, no metrics.
  The construction of this page is the evidence. The signature interaction
  should demonstrate capability rather than assert it.

### Calibration — things that read as generated

These are defaults rather than choices, and they show up regardless of subject.
Avoid them unless there is a specific reason, stated out loud:

- Cream background (~#F4F1EA) + high-contrast serif + terracotta accent (~#D97757)
- Near-black background with one acid-green or vermilion accent — **exempt.**
  The dark ground with `#B8F60D` is the chosen direction; do not flag it
- Content chopped into identical rounded cards with the same soft grey shadow.
  Translucent panels are permitted per the palette section, but panels are for
  content that genuinely is a bounded object. Do not put every section in one,
  and do not give them all the same size and radius
- Gradient washes used as decoration — exempt for the page background field
  only. Still not permitted on cards, buttons, text, or section dividers
- Tracked-out ALL-CAPS eyebrow labels above headings
- Numbered markers (01 / 02 / 03) on content that isn't actually a sequence
- Meta strings joined with middle dots (`A · B · C`)
- `WORD — fragment` labels with a spaced em dash
- Tinted near-black (#0B0B0B, #111) standing in for black
- A monospace face for small data labels
- `→` appended to link and button text
- Accenting a single word in a headline in italic, bold, or a different colour

If you find yourself producing one of these, stop and say so.

### Typography

Families are specified under Identity above — Syne for display, Schibsted
Grotesk for text. Do not revisit that choice.

What remains open is the scale, and it is the first gate of Milestone 1.
Propose a type scale with intentional steps, weights, and line heights rather
than a default ramp. Type treatment is an active part of the design, not a
neutral delivery vehicle for the words.

Body line length under 80 characters. Syne is wide — a headline that fits at
1440px will break badly at 900px, so propose the mobile headline treatment at
the same time as the desktop one. With this face the answer is usually fewer
words, not smaller type.

### Motion

Motion must mean something. Before implementing any animation, state:

1. what it communicates
2. why it exists rather than being decoration
3. its mobile behaviour
4. its `prefers-reduced-motion` behaviour
5. its performance cost (what triggers layout, what runs on the compositor)

**One orchestrated moment beats scattered effects.** Fade-and-slide-up
entrances on every section and hover transitions on every card are the generic
default and read as AI-generated. Spend the boldness in one place; keep
everything around it quiet.

**The homepage has exactly one scroll-driven sequence.** It is the signature
interaction, and it is the only place scroll position drives animation. Do not
add scroll-triggered reveals to other sections — entrance animations on every
block are the generic default and they dilute the one moment that matters.
Sections other than the signature sequence are static unless we say otherwise.

Animation code belongs in a deliberate motion layer under
`src/components/motion/`, composed as components. Page sections should read
like `<TextReveal>…</TextReveal>`, not contain inline GSAP timelines.

Always use `useGSAP` from `@gsap/react` so ScrollTrigger instances are cleaned
up. Leaked instances across navigation are a known failure here.

## Quality floor

Non-negotiable, built in from the start rather than retrofitted:

- Responsive from 320px up; design mobile deliberately, don't shrink desktop
- Visible keyboard focus on every interactive element
- `prefers-reduced-motion` honoured everywhere
- Semantic HTML, correct heading order, real landmarks
- Colour contrast meets WCAG AA
- No layout shift; images sized; fonts loaded without FOUT thrash
- Lighthouse: performance and accessibility both 95+ on mobile

The repo is public. Commit messages, file organisation, and naming are part of
the portfolio.

## References and inspiration

We will show you screenshots of sites we admire. Treat a reference as evidence
of a principle, not as a target.

When we share one:

- Say what specifically is working — the type treatment, the pacing, the
  restraint, the way the navigation behaves, the ratio of emptiness to content.
- Extract it as a principle that could be applied without the source being
  recognisable.
- Tell us if you think we're wrong about why it works.

Never reproduce layout structure, palette, copy patterns, animation timing, or
asset treatment from a named site. If the only available description of an idea
is "like [that site]", it isn't usable yet.

Do not add references to this file. Once we agree on an extracted principle, it
goes into the design direction section above, and the source is dropped.

## How to work

### Think before coding

State assumptions explicitly. If you're uncertain, ask.

If a request has multiple reasonable interpretations, present them rather than
picking one silently. If a simpler approach exists, say so — push back when
warranted. If something is unclear, stop and name what's confusing.

Don't hide confusion behind plausible-looking code.

### Simplicity first

The minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked
- No abstractions for single-use code
- No configurability or flexibility that wasn't requested
- No error handling for impossible scenarios
- If you wrote 200 lines and it could be 50, rewrite it

The check: would a senior engineer call this overcomplicated?

### Surgical changes

Touch only what the request requires.

- Don't improve adjacent code, comments, or formatting
- Don't refactor what isn't broken
- Match existing style even where you'd do it differently
- Mention unrelated dead code rather than deleting it
- Do remove imports, variables, and functions that your own changes orphaned

Every changed line should trace back to the request.

### Verify against the right thing

This is a visual project. Tests are not the verification loop for most of it.

State how each step will be checked before you start it:

- Layout and type → screenshot at 320px, 768px, and 1440px
- Motion → behaviour under `prefers-reduced-motion`; no dropped frames while scrubbing
- Performance → Lighthouse on mobile
- Accessibility → tab through it; check heading order and contrast
- Real logic (form handling, data shaping, utilities) → a test

Write tests for logic, not for markup. Don't add a suite for components whose
only behaviour is rendering.

For multi-step work, state the plan as steps with their checks:

```
1. [step] → verify: [check]
2. [step] → verify: [check]
```

Weak criteria ("make it work") mean you have to come back and ask. Strong ones
let you finish the loop yourself.

### Plan before building

For any non-trivial piece of work, produce a plan and **stop for approval**
before writing code. A plan is:

- what you are going to build and how it is structured
- the visual approach, with ASCII wireframes where layout is at stake
- the motion, with the five points above answered
- anything you're unsure about or where you'd like a decision from us

Then check the plan against this document. If any part of it is what you'd
produce for any generic agency site rather than a choice made for this brief,
revise it and say what you changed and why.

### Then build

Small commits. After each meaningful piece, critique your own work against this
file before moving on. Take a screenshot and look at it if you can.

### Don't drift

If implementation teaches us something that contradicts this document, say so
and propose the update. This file is the living rulebook — it should change
when reality demands it, not be quietly ignored.

## Milestone 1 — homepage

Order of work. Stop for review at each gate.

1. **Design tokens and type scale.** The `@theme` block, spacing rhythm, type
   scale, and motion timing/easing constants. *Gate: we review the tokens.*
2. **Layout shell and navigation.** Header, footer, page grid.
3. **Hero.** The single most important thing on the site. Propose three
   concepts with composition, motion, mobile behaviour, and performance
   characteristics before implementing any of them. *Gate: we pick one.*
4. **One signature interaction.** The thing someone remembers. It should
   communicate something about software, data, systems, or transformation —
   not be an effect for its own sake.
5. **Remaining homepage sections.** Only after 1–4 are approved.

After step 4 we stop and ask: if someone saw only this, would they believe
these two can build serious software? If the answer is no, we fix the visual
language before adding anything else.

## First task

Do not write application code yet.

Read the repo as it currently stands. Then produce a homepage plan covering:
structure and section order, the design token proposal (palette, type scale,
spacing, motion constants), the layout concept with wireframes, three hero
concepts with trade-offs, and the one signature interaction you'd argue for.

Include what you think the weakest part of your own proposal is.

Wait for approval before implementing.
