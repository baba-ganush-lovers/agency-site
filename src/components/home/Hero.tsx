import { Fragment } from "react";
import { heroLines } from "@/config/hero.mjs";
import { Container } from "@/components/layout/Container";
import { PlaceholderBlock } from "@/components/placeholder/PlaceholderBlock";

// One h1, one accessible string. Each authored line is a block; the phrase
// atoms inside it never break, so a line that does not fit wraps only at
// seams written in src/config/hero.mjs. No JS, no duplicated copy.
export function Hero() {
  return (
    <>
      <Container className="pt-7">
        <h1 className="hero-seam max-w-hero font-display text-display-lead">
          {heroLines.map((atoms, line) => (
            <Fragment key={line}>
              {line > 0 && " "}
              <span className="block">
                {atoms.map((atom, i) => (
                  <Fragment key={i}>
                    {i > 0 && " "}
                    <span className="whitespace-nowrap">{atom}</span>
                  </Fragment>
                ))}
              </span>
            </Fragment>
          ))}
        </h1>
      </Container>

      {/* The page's second plane. Full-bleed and square because a card's
          corner would curve under the first word of the last line. */}
      <div className="border-y border-fg/12 bg-fg/6 py-6">
        <Container>
          {/* PLACEHOLDER: lead copy, written by the studio. */}
          <PlaceholderBlock label="lead copy" />
        </Container>
      </div>
    </>
  );
}
