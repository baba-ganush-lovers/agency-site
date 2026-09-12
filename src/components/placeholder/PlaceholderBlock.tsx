// A labelled slot for content the studio has not written yet. Never ships:
// every use is listed in PLACEHOLDERS.md.
export function PlaceholderBlock({ label }: { label: string }) {
  return (
    <div className="max-w-measure border border-dashed border-fg/30 p-4 text-small text-fg/60">
      Placeholder: {label}. See PLACEHOLDERS.md.
    </div>
  );
}
