import type { ReactNode } from "react";

// The page grid: content-width column, centered, with the fluid page margin.
// A section that needs a narrower measure nests its own max-w-measure div
// inside rather than overriding max-w-content here — two max-w-* classes on
// one element would leave the winner to CSS generation order, not intent.
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-content px-page ${className}`.trim()}>
      {children}
    </div>
  );
}
