#!/usr/bin/env node
/**
 * Wrap and monotonicity check for the hero type.
 *
 * The hero headline is set in Syne, which is wide enough that a sentence
 * fitting at one viewport can overflow its column at another. Longest-line
 * fill currently runs 95-99% across the range, so there is almost no
 * horizontal headroom and a one-word copy change can tip a line past 100%.
 *
 * This sweeps the viewport range against the real font metrics and fails if
 * that happens. Run it whenever the hero copy or the type tokens change.
 *
 *   node scripts/measure-type.mjs
 *   node scripts/measure-type.mjs --sentence "..."
 *   node scripts/measure-type.mjs --help
 *
 * See docs/type-system.md for where the constants come from.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// --- what we are checking -------------------------------------------------

/** The current hero sentence. Change it here, then re-run this script. */
const HERO =
  'Most teams buy the thing that runs and the thing that tells them whether ' +
  'it’s working from two different places. Here they’re built by the ' +
  'same two people.'

/** The `--text-display-lead` token, copied verbatim from globals.css. */
const FONT = 'clamp(2rem, 1.30rem + 3.00vw, 4rem)'
const TRACKING = -0.02 // em, `--text-display-lead--letter-spacing`
const FACE = 'Syne:600'

/**
 * Page grid. Mirrors the spacing tokens in globals.css.
 *
 * Margin and gutter are fluid rather than stepped at breakpoints. Tiered
 * values (20/32/52) made the content width — and so the hero — narrow by 20px
 * at 640 and 36px at 1024 as the viewport widened, which is the same defect
 * that disqualified hero width rule A, just smaller.
 */
const MAX_CONTENT = 1280
const COLUMNS = 6
const MARGIN = (vw) => Math.min(52, Math.max(20, 5.45 + (4.545 * vw) / 100))
const GUTTER = (vw) => Math.min(32, Math.max(20, 14.55 + (1.705 * vw) / 100))

/**
 * Hero width rules.
 *
 * B ships. A is kept so the defect it has at 1200 stays reproducible: a 5/6
 * column span is always narrower than the full content width at the same
 * viewport, so switching span at a fixed breakpoint makes the hero shrink and
 * reflow as the window widens.
 */
const RULES = {
  B: (vw, content) => Math.min(744.24 + (22.8873 * vw) / 100, content, 1061),
  A: (vw, content, gutter) =>
    vw >= 1200 ? ((content - 5 * gutter) / COLUMNS) * 5 + gutter * 4 : content,
}

// --- font metrics ---------------------------------------------------------

const HERE = dirname(fileURLToPath(import.meta.url))
const CACHE = join(HERE, '.font-metrics.json')
const CACHE_VERSION = 1

/**
 * Google Fonts serves woff2 to a modern user-agent (Brotli, needs a decoder)
 * and EOT to an ancient IE one. Safari 5 is the UA that still gets raw TTF,
 * which we can parse directly.
 */
const TTF_UA =
  'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; en-us) ' +
  'AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1'

const FACES = ['Syne:600', 'Syne:700', 'Schibsted Grotesk:400', 'Schibsted Grotesk:500']

/** Characters we measure. Anything outside this forces a re-fetch. */
const CHARSET = [
  ...Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)),
  '‘', '’', '“', '”', '–', '—', '…',
]

async function fetchFace(family, weight) {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`
  const css = await fetch(url, { headers: { 'User-Agent': TTF_UA } }).then((r) => r.text())
  const src = css.match(/src:\s*url\(([^)]+)\)/)
  if (!src) throw new Error(`No font URL in the CSS for ${family} ${weight}`)
  const buf = await fetch(src[1]).then((r) => r.arrayBuffer())
  return readTTF(new DataView(buf))
}

/** Minimal TTF reader: enough for advance widths, ink extents and cap/x-height. */
function readTTF(dv) {
  const tables = {}
  for (let i = 0, n = dv.getUint16(4); i < n; i++) {
    const o = 12 + i * 16
    const tag = String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3))
    tables[tag] = dv.getUint32(o + 8)
  }
  const upem = dv.getUint16(tables.head + 18)
  const longLoca = dv.getInt16(tables.head + 50) === 1
  const numHMetrics = dv.getUint16(tables.hhea + 34)
  const capHeight = dv.getInt16(tables['OS/2'] + 88) / upem
  const xHeight = dv.getInt16(tables['OS/2'] + 86) / upem

  const cmap = pickCmap(dv, tables.cmap)
  const glyphId = (cp) => lookupGlyph(dv, cmap, cp)
  const advance = (cp) => dv.getUint16(tables.hmtx + Math.min(glyphId(cp), numHMetrics - 1) * 4) / upem

  const inkOf = (cp) => {
    const g = glyphId(cp)
    if (!g) return null
    const at = (i) => (longLoca ? dv.getUint32(tables.loca + i * 4) : dv.getUint16(tables.loca + i * 2) * 2)
    if (at(g) === at(g + 1)) return null // empty glyph, e.g. space
    const o = tables.glyf + at(g)
    return { bottom: dv.getInt16(o + 4) / upem, top: dv.getInt16(o + 8) / upem }
  }

  const advances = {}
  let inkTop = -Infinity
  let inkBottom = Infinity
  const missing = []
  for (const ch of CHARSET) {
    const cp = ch.codePointAt(0)
    if (ch !== ' ' && !glyphId(cp)) missing.push(ch)
    advances[cp] = advance(cp)
    const ink = inkOf(cp)
    if (ink) {
      inkTop = Math.max(inkTop, ink.top)
      inkBottom = Math.min(inkBottom, ink.bottom)
    }
  }
  return { upem, capHeight, xHeight, inkTop, inkBottom, advances, missing }
}

function pickCmap(dv, base) {
  let best = -1
  let bestScore = -1
  for (let i = 0, n = dv.getUint16(base + 2); i < n; i++) {
    const rec = base + 4 + i * 8
    const platform = dv.getUint16(rec)
    const encoding = dv.getUint16(rec + 2)
    const sub = base + dv.getUint32(rec + 4)
    const format = dv.getUint16(sub)
    let score = -1
    if (format === 12 && platform === 3 && encoding === 10) score = 4
    else if (format === 4 && platform === 3 && encoding === 1) score = 3
    else if (format === 12) score = 2
    else if (format === 4) score = 1
    if (score > bestScore) {
      bestScore = score
      best = sub
    }
  }
  if (best < 0) throw new Error('No usable cmap subtable')
  return best
}

function lookupGlyph(dv, sub, cp) {
  if (dv.getUint16(sub) === 4) {
    const segX2 = dv.getUint16(sub + 6)
    const ends = sub + 14
    const starts = ends + segX2 + 2
    const deltas = starts + segX2
    const ranges = deltas + segX2
    for (let i = 0; i < segX2 / 2; i++) {
      if (cp > dv.getUint16(ends + i * 2)) continue
      const start = dv.getUint16(starts + i * 2)
      if (cp < start) return 0
      const delta = dv.getInt16(deltas + i * 2)
      const rangeOffset = dv.getUint16(ranges + i * 2)
      if (rangeOffset === 0) return (cp + delta) & 0xffff
      const g = dv.getUint16(ranges + i * 2 + rangeOffset + (cp - start) * 2)
      return g === 0 ? 0 : (g + delta) & 0xffff
    }
    return 0
  }
  for (let i = 0, n = dv.getUint32(sub + 12); i < n; i++) {
    const g = sub + 16 + i * 12
    const from = dv.getUint32(g)
    if (cp >= from && cp <= dv.getUint32(g + 4)) return dv.getUint32(g + 8) + (cp - from)
  }
  return 0
}

async function loadMetrics(refresh) {
  if (!refresh) {
    try {
      const cached = JSON.parse(await readFile(CACHE, 'utf8'))
      if (cached.version === CACHE_VERSION) return cached.faces
    } catch {
      // no cache yet, or unreadable — fetch below
    }
  }
  process.stderr.write('Fetching font files from Google Fonts…\n')
  const faces = {}
  for (const key of FACES) {
    const [family, weight] = key.split(':')
    faces[key] = await fetchFace(family, weight)
    if (faces[key].missing.length) {
      process.stderr.write(`  warning: ${key} is missing ${faces[key].missing.join('')}\n`)
    }
  }
  await writeFile(CACHE, JSON.stringify({ version: CACHE_VERSION, fetchedAt: new Date().toISOString(), faces }, null, 2))
  process.stderr.write(`Cached to ${CACHE}\n\n`)
  return faces
}

// --- layout simulation ----------------------------------------------------

/** Parses `clamp(<min>, <A>rem + <B>vw, <max>)` into a viewport -> px function. */
function parseClamp(spec) {
  const m = spec.trim().match(/^clamp\(([^,]+),([^,]+),([^,]+)\)$/i)
  if (!m) throw new Error(`Expected clamp(min, Arem + Bvw, max), got: ${spec}`)
  const min = toPx(m[1])
  const max = toPx(m[3])
  let base = 0
  let perVw = 0
  for (const term of m[2].split('+')) {
    const t = term.trim()
    if (t.endsWith('vw')) perVw += parseFloat(t)
    else base += toPx(t)
  }
  return (vw) => Math.min(max, Math.max(min, base + (perVw * vw) / 100))
}

function toPx(value) {
  const v = value.trim()
  const n = parseFloat(v)
  if (Number.isNaN(n)) throw new Error(`Cannot read a length from: ${value}`)
  if (v.endsWith('rem')) return n * 16
  if (v.endsWith('px')) return n
  throw new Error(`Expected rem or px, got: ${value}`)
}

const contentWidth = (vw) => Math.min(vw - 2 * MARGIN(vw), MAX_CONTENT)

/** Greedy line breaker. Matches how a browser breaks on spaces. */
function wrap(face, sentence, fontPx, availablePx, trackingEm) {
  const widthOf = (text) => {
    let em = 0
    for (const ch of text) em += face.advances[ch.codePointAt(0)] ?? 0
    return (em + trackingEm * [...text].length) * fontPx
  }
  const lines = []
  let line = ''
  for (const word of sentence.split(' ')) {
    const candidate = line ? `${line} ${word}` : word
    if (widthOf(candidate) <= availablePx || !line) line = candidate
    else {
      lines.push({ text: line, px: widthOf(line) })
      line = word
    }
  }
  if (line) lines.push({ text: line, px: widthOf(line) })
  return lines
}

function sample(face, sentence, vw, fontFor, rule, trackingEm) {
  const content = contentWidth(vw)
  const heroW = RULES[rule](vw, content, GUTTER(vw))
  const fontPx = fontFor(vw)
  const lines = wrap(face, sentence, fontPx, heroW, trackingEm)
  const longest = Math.max(...lines.map((l) => l.px))
  return { vw, content, heroW, air: content - heroW, fontPx, lines, longest, fill: (longest / heroW) * 100 }
}

// --- cli ------------------------------------------------------------------

const HELP = `
Wrap and monotonicity check for the hero type.

  node scripts/measure-type.mjs [options]

  --sentence <text>   Sentence to check          (default: the current hero copy)
  --font <clamp>      Font-size token            (default: ${FONT})
  --tracking <em>     Letter-spacing in em       (default: ${TRACKING})
  --rule <A|B>        Hero width rule            (default: B)
  --min <px>          Sweep from                 (default: 320)
  --max <px>          Sweep to                   (default: 2560)
  --step <px>         Sweep resolution           (default: 8)
  --refresh           Re-fetch the font files instead of using the cache
  --help

Exits 1 if any line overflows its column, or if the hero width is not
monotonic across the range.
`

function parseArgs(argv) {
  const opts = {
    sentence: HERO, font: FONT, tracking: TRACKING, rule: 'B',
    min: 320, max: 2560, step: 8, refresh: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    const next = () => {
      const v = argv[++i]
      if (v === undefined) throw new Error(`${arg} needs a value`)
      return v
    }
    if (arg === '--help' || arg === '-h') return null
    else if (arg === '--refresh') opts.refresh = true
    else if (arg === '--sentence') opts.sentence = next()
    else if (arg === '--font') opts.font = next()
    else if (arg === '--tracking') opts.tracking = parseFloat(next())
    else if (arg === '--rule') opts.rule = next().toUpperCase()
    else if (arg === '--min') opts.min = parseInt(next(), 10)
    else if (arg === '--max') opts.max = parseInt(next(), 10)
    else if (arg === '--step') opts.step = parseInt(next(), 10)
    else throw new Error(`Unknown option: ${arg}`)
  }
  if (!RULES[opts.rule]) throw new Error(`Unknown rule "${opts.rule}". Expected A or B.`)
  if (opts.min >= opts.max) throw new Error('--min must be below --max')
  if (opts.step < 1) throw new Error('--step must be at least 1')
  return opts
}

function main(opts, faces) {
  const face = faces[FACE]
  if (!face) throw new Error(`No metrics for ${FACE}. Try --refresh.`)

  const unknown = [...new Set([...opts.sentence].filter((ch) => face.advances[ch.codePointAt(0)] === undefined))]
  if (unknown.length) throw new Error(`Not measured for these characters: ${unknown.join(' ')}. Add them to CHARSET and --refresh.`)

  const fontFor = parseClamp(opts.font)
  const at = (vw) => sample(face, opts.sentence, vw, fontFor, opts.rule, opts.tracking)

  console.log(`sentence  ${opts.sentence.length} chars, ${opts.sentence.split(' ').length} words`)
  console.log(`face      ${FACE}, tracking ${opts.tracking}em`)
  console.log(`font      ${opts.font}`)
  console.log(`rule      ${opts.rule}\n`)
  console.log('   vw  content   heroW    air   font  lines  longest-fill')

  const tableStep = Math.max(opts.step, 128)
  for (let vw = opts.min; vw <= opts.max; vw += tableStep) {
    const d = at(vw)
    console.log(
      `  ${String(vw).padStart(4)}   ${String(Math.round(d.content)).padStart(5)}` +
        `  ${String(Math.round(d.heroW)).padStart(6)} ${String(Math.round(d.air)).padStart(6)}` +
        `  ${d.fontPx.toFixed(1).padStart(5)}   ${String(d.lines.length).padStart(3)}` +
        `    ${d.fill.toFixed(1).padStart(5)}%`
    )
  }

  const overflow = []
  const heroShrank = []
  const airShrank = []
  const linesGrew = []
  let prev = null
  let samples = 0
  for (let vw = opts.min; vw <= opts.max; vw += opts.step) {
    const d = at(vw)
    samples++
    if (d.fill > 100) overflow.push(`${vw}px (${d.fill.toFixed(1)}%, "${d.lines.find((l) => l.px === d.longest).text}")`)
    if (prev) {
      if (d.heroW < prev.heroW - 0.01) heroShrank.push(`${vw}px (${Math.round(prev.heroW)} → ${Math.round(d.heroW)})`)
      if (d.air < prev.air - 0.01) airShrank.push(`${vw}px (${Math.round(prev.air)} → ${Math.round(d.air)})`)
      if (d.lines.length > prev.lines.length) linesGrew.push(`${vw}px (${prev.lines.length} → ${d.lines.length})`)
    }
    prev = d
  }

  const report = (label, hits) =>
    console.log(`  ${label.padEnd(26)}: ${hits.length ? `${hits.length} — ${hits.slice(0, 5).join(', ')}${hits.length > 5 ? ' …' : ''}` : 'none'}`)

  console.log(`\n${samples} samples, ${opts.min}–${opts.max}px every ${opts.step}px:`)
  report('line overflows column', overflow)
  report('heroW non-monotonic', heroShrank)
  report('air non-monotonic', airShrank)
  report('line count non-monotonic', linesGrew)

  const failed = overflow.length > 0 || heroShrank.length > 0
  console.log(
    failed
      ? `\nFAIL — ${overflow.length ? 'the hero overflows its column' : ''}` +
          `${overflow.length && heroShrank.length ? ' and ' : ''}` +
          `${heroShrank.length ? 'the hero narrows as the viewport widens' : ''}.`
      : '\nPASS'
  )
  if (!failed && (airShrank.length || linesGrew.length)) {
    console.log('Composition warnings above are not failures, but they are worth a look.')
  }
  return failed ? 1 : 0
}

try {
  const opts = parseArgs(process.argv.slice(2))
  if (!opts) {
    console.log(HELP.trim())
    process.exit(0)
  }
  process.exit(main(opts, await loadMetrics(opts.refresh)))
} catch (error) {
  console.error(`measure-type: ${error.message}`)
  process.exit(2)
}
