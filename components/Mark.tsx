// The mark is a rasterised letter: six bars, offset like a half-tone scan of a monogram, with the
// uneven steps that make it read as printed rather than drawn.
const BARS = [
  { y: 0, x: 0, w: 26 },
  { y: 5, x: 6, w: 20 },
  { y: 10, x: 0, w: 30 },
  { y: 15, x: 12, w: 16 },
  { y: 20, x: 0, w: 24 },
  { y: 25, x: 16, w: 12 },
];

export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 34 29" fill="currentColor" aria-hidden className={className}>
      {BARS.map((b) => (
        <rect key={b.y} x={b.x} y={b.y} width={b.w} height={3} />
      ))}
    </svg>
  );
}
