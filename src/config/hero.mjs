// The hero headline, as it is set: authored lines, each made of phrase atoms.
// A line is a block; an atom never breaks. Where a line does not fit, it
// wraps at its atoms, so every break at every width is one written here.
//
// Plain ESM rather than TypeScript because scripts/measure-type.mjs reads the
// same array — the markup and the check cannot drift apart.
//
// PLACEHOLDER: the ending has no descender, so the seam has nothing to clip
// and the check fails by design until the studio writes the last line. The
// last atom must carry a descender. See PLACEHOLDERS.md.
export const heroLines = [
  ["Most teams buy"],
  ["the thing", "that runs", "and the thing"],
  ["that tells them", "if it works"],
  ["from two", "different places."],
  ["We build both."],
];
