import { brand } from "@/config/brand";

// Typeset from brand.name. Never a generated mark or SVG — see the Identity
// rules in CLAUDE.md.
export function Wordmark() {
  return (
    <span className="whitespace-nowrap text-display-sub font-display">
      {brand.name}
    </span>
  );
}
