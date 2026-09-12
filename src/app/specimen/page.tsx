"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/Container";
import "./specimen.css";

// PLACEHOLDER: temporary route. Deleted at the milestone 1 step 3 gate.
// Its job is to make the remaining type decisions visible rather than argued.
// Numbers quoted here come from docs/type-system.md, measured by
// scripts/measure-type.mjs against the real font files.

const HERO =
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
  sentence = HERO,
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
    <Container className="py-7">
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
                <th className="p-2 text-right font-normal">Schibsted 400</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["cap height", "0.650", "0.703"],
                ["x-height", "0.500", "0.527"],
                ["avg lowercase advance", "0.5655", "0.5093"],
                ["1ch (advance of “0”)", "0.6830", "0.6113"],
                ["ink top", "+0.709", "+0.752"],
                ["ink bottom (descender)", "−0.203", "−0.202"],
                ["ink bottom (overshoot)", "−0.011", "−0.010"],
                ["min line-height", "0.912", "0.955"],
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
          Syne 600 is 1.110&times; Schibsted per character, but its cap height is
          0.650 against 0.703 — so normalised for optical size it is 1.20&times;
          wider. It reads small for its point size and is wide. That compound is
          the whole wrapping problem.
        </Note>
      </Section>

      <Section title="The scale">
        <Note>
          Bimodal: text in a narrow band, display above it, nothing in between.
          No display step exists below 28px, which is what stops Syne creeping
          under its 24px floor — and only one display register, because a second
          one 1.5&times; away from this reads as a wobble rather than a step.
        </Note>

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


      <Section title="Concept C hero, rule B, with the occlusion seam">
        <Note>
          The seam sits 0.069em <em>below</em> the baseline. Descenders reach
          −0.203em and round letters overshoot to −0.011em, so that offset clips
          descenders and touches nothing else, with 0.058em of clearance under
          the round letters. There is no mobile override: the whole descender is
          0.203em, which at 32px is 6.5px, so there is nothing left to bite into
          without cutting letter bodies. The lime hairline marks where column 6
          starts, and the gap to the longest line is the clearance.
        </Note>
        {WIDTHS.map((width) => (
          <Panel key={width} width={width} seam />
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
    </Container>
  );
}
