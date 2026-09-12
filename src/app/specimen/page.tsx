"use client";

import { useEffect, useRef, useState } from "react";
import "./specimen.css";

// PLACEHOLDER: temporary route. Deleted at the milestone 1 step 3 gate.
// Its job is to make the remaining type decisions visible rather than argued.
// Numbers quoted here come from docs/type-system.md, measured by
// scripts/measure-type.mjs against the real font files.

const HERO_FULL =
  "Most teams buy the thing that runs and the thing that tells them whether " +
  "it’s working from two different places. Here they’re built by the " +
  "same two people.";

const HERO_TRIMMED =
  "Most teams buy the thing that runs and the thing that tells them if it " +
  "works from two different places. We build both.";

const WIDTHS = [320, 768, 900, 1100, 1200, 1440];

/** Reads what a token actually resolves to at the current viewport. */
function Resolved({ className }: { className: string }) {
  const probe = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    const el = probe.current;
    if (!el) return;
    const read = () => {
      const style = getComputedStyle(el);
      const size = parseFloat(style.fontSize);
      const leading = parseFloat(style.lineHeight) / size;
      setValue(`${size.toFixed(1)}px / ${leading.toFixed(2)}`);
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <span
        ref={probe}
        aria-hidden
        className={className}
        style={{ position: "absolute", visibility: "hidden", height: 0 }}
      >
        0
      </span>
      <span className="text-lime">{value || "—"}</span>
    </>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 max-w-measure text-small text-fg/60">{children}</p>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-small text-fg/50">{children}</p>;
}

function Step({
  token,
  clamp,
  className,
  children,
}: {
  token: string;
  clamp: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-7 border-t border-fg/10 pt-4">
      <Label>
        {token}, {clamp}, resolves to <Resolved className={className} />
      </Label>
      <div className={`mt-3 ${className}`}>{children}</div>
    </div>
  );
}

function Panel({
  width,
  rule = "b",
  sentence = HERO_FULL,
  seam = false,
}: {
  width: number;
  rule?: "a" | "b";
  sentence?: string;
  seam?: boolean;
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <Label>
        {width}px simulated, rule {rule.toUpperCase()}
      </Label>
      <div
        className="sim mt-2 border border-fg/10"
        style={{ width: `${width}px` }}
      >
        <div className="sim-page">
          <div className="sim-content">
            {seam && <div className="sim-col6" />}
            <div className={`sim-hero sim-hero-${rule}`}>
              <p className="sim-lead">{sentence}</p>
              {seam && <div className="sim-seam" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return (
    <section id={id} className="mt-8 scroll-mt-4">
      <h2 className="text-display-sub font-display">{title}</h2>
      {children}
    </section>
  );
}

export default function Specimen() {
  return (
    <main className="mx-auto max-w-content px-page py-7">
      <h1 className="text-display-lead font-display">Type specimen</h1>
      <Note>
        Everything below is measured against the real font files, not estimated.
        The panels simulate viewports using container queries, so each responds
        to its own width — but the live page sizes type against the real
        viewport, so resize the browser to check that for real.
      </Note>

      <Section title="Measured constants">
        <div className="mt-4 overflow-x-auto">
          <table className="text-small">
            <thead className="text-fg/50">
              <tr>
                <th className="p-2 text-left font-normal">metric</th>
                <th className="p-2 text-right font-normal">Syne 600</th>
                <th className="p-2 text-right font-normal">Syne 700</th>
                <th className="p-2 text-right font-normal">Schibsted 400</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["cap height", "0.650", "0.650", "0.703"],
                ["x-height", "0.500", "0.500", "0.527"],
                ["avg lowercase advance", "0.5655", "0.6113", "0.5093"],
                ["1ch (advance of “0”)", "0.6830", "0.7380", "0.6113"],
                ["ink top", "+0.709", "+0.715", "+0.752"],
                ["ink bottom", "−0.203", "−0.205", "−0.202"],
                ["min line-height", "0.912", "0.920", "0.955"],
              ].map(([metric, ...cells]) => (
                <tr key={metric} className="border-t border-fg/10">
                  <td className="p-2 text-fg/70">{metric}</td>
                  {cells.map((cell, i) => (
                    <td key={i} className="p-2 text-right">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Note>
          Syne is 1.200&times; Schibsted per character, but its cap height is
          0.650 against 0.703 — so normalised for optical size it is 1.30&times;
          wider. It reads small for its point size and is wide. That compound is
          the whole wrapping problem.
        </Note>
      </Section>

      <Section title="The scale">
        <Note>
          Bimodal: text in a narrow band, display an octave above, nothing in
          between. No display step exists below 28px, which is what stops Syne
          creeping under its 24px floor.
        </Note>

        <Step
          token="display-hero"
          clamp="56 → 152px"
          className="text-display-hero font-display"
        >
          We build systems that can be read
        </Step>
        <Step
          token="display-lead"
          clamp="32 → 64px"
          className="text-display-lead font-display"
        >
          Built to run, built to be read
        </Step>
        <Step
          token="display-sub"
          clamp="24 → 28px"
          className="text-display-sub font-display"
        >
          The floor for Syne. Nothing display-set goes smaller.
        </Step>
        <Step token="text-lead" clamp="18 → 21px" className="text-lead">
          <span className="block max-w-measure">
            Two engineers, one in Europe and one in the United States. One
            builds the software, the other works with the data it produces.
          </span>
        </Step>
        <Step token="text-body" clamp="16 → 17px" className="text-body">
          <span className="block max-w-measure">
            This is the reading size, set at the measure token. Schibsted
            Grotesk is chosen to be quiet: no tracking, no small caps, nothing
            above weight 500. If a piece of type is being read rather than seen,
            it is set in this face.
          </span>
        </Step>
        <Step token="text-small" clamp="14px fixed" className="text-small">
          <span className="block max-w-measure">
            Captions, asides, and the candid note about not being able to show
            client work.
          </span>
        </Step>
      </Section>

      <Section title="How large should display-hero be?">
        <Note>
          152px is a fitting result, not a judgement — it is the largest size
          that fits the widest authored line into the hero column at 1440, which
          is not the same as the right size. Same string at all three. Unresolved
          in PLACEHOLDERS.md.
        </Note>
        {[96, 120, 152].map((size) => (
          <div key={size} className="mt-7 border-t border-fg/10 pt-4">
            <Label>{size}px</Label>
            <p
              className="mt-3 font-display"
              style={{
                fontSize: `${size}px`,
                lineHeight: 0.94,
                letterSpacing: "-0.03em",
                fontWeight: 700,
              }}
            >
              We build systems that can be read
            </p>
          </div>
        ))}
        <Note>
          And the register question — does Concept C need a second display size
          at all, or does the lead size carry the whole page?
        </Note>
        <div className="mt-4 border-t border-fg/10 pt-4">
          <Label>display-hero at maximum</Label>
          <p className="mt-2 text-display-hero font-display">Systems that</p>
          <div className="mt-5">
            <Label>display-lead at maximum</Label>
          </div>
          <p className="mt-2 text-display-lead font-display">Systems that</p>
        </div>
      </Section>

      <Section title="Concept C hero, rule B, with the occlusion seam">
        <Note>
          The seam crosses the final line 0.08em above the baseline (0.20em at
          ≤480px, where a subtler cut would not read). Descenders pass behind
          it; no letter body is hidden. The lime hairline marks where column 6
          starts — above 1200 that is where the panel&rsquo;s vertical arm sits, and
          the gap between it and the longest line is the clearance.
        </Note>
        {WIDTHS.map((width) => (
          <Panel key={width} width={width} seam />
        ))}
      </Section>

      <Section title="Rule A against rule B">
        <Note>
          Identical below 1100. At 1200 rule A switches to a 5/6 column span,
          which is narrower than the full content width at the same viewport —
          so the hero drops from 1088px to 908px and gains a line as the window
          gets wider. Rule B has no defect across 561 samples from 320 to 2560.
        </Note>
        {[1100, 1200, 1440].map((width) => (
          <div key={width} className="mt-7 border-t border-fg/10 pt-4">
            <Panel width={width} rule="a" />
            <Panel width={width} rule="b" />
          </div>
        ))}
      </Section>

      <Section title="Full sentence against a trimmed one">
        <Note>
          28 words against 22. The full sentence runs to ten lines at 320px and
          orphans &ldquo;people.&rdquo; at 1100 and 1200. This is a copy decision, not a
          layout one.
        </Note>
        {[320, 1100, 1440].map((width) => (
          <div key={width} className="mt-7 border-t border-fg/10 pt-4">
            <Panel width={width} sentence={HERO_FULL} />
            <Panel width={width} sentence={HERO_TRIMMED} />
          </div>
        ))}
      </Section>

      <Section title="Measure">
        <Note>
          52ch. Not 62ch — 1ch is the advance of &ldquo;0&rdquo;, which is 0.6113em in
          Schibsted, while running prose averages 0.4501em per character. So 1ch
          is 1.358 characters, and 52ch is 71 of them. 62ch would have been 84,
          over the limit.
        </Note>
        <p className="mt-4 max-w-measure text-body">
          Most teams buy the thing that runs and the thing that tells them
          whether it is working from two different places, and the two never
          quite fit together. Here they are built by the same two people, which
          means the thing that reports on the system and the system itself are
          designed at the same time rather than bolted together afterwards.
        </p>
      </Section>
    </main>
  );
}
