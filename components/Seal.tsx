// Institutional seal, after the reference's badge: double rule, atom at the centre, ring text top and
// bottom. Characters are placed radially rather than on a textPath: textPath on an arc renders
// inverted in Chrome for both sweep directions, and per-character placement is deterministic.
const CX = 60;
const CY = 60;

function arc(
  text: string,
  opts: { radius: number; center: number; step: number; size: number; inside: boolean },
) {
  const { radius, center, step, size, inside } = opts;
  // Top arc runs left to right (increasing angle). Bottom arc runs the other way, otherwise the
  // word lands in mirror order.
  const dir = inside ? -1 : 1;
  const start = center - (dir * step * (text.length - 1)) / 2;
  return text.split("").map((ch, i) => {
    const deg = start + dir * i * step;
    const rad = (deg * Math.PI) / 180;
    const x = CX + radius * Math.cos(rad);
    const y = CY + radius * Math.sin(rad);
    // Top arc reads with glyph up pointing outward, bottom arc with glyph up pointing inward.
    const rot = inside ? deg - 90 : deg + 90;
    return (
      <text
        key={`${ch}-${i}`}
        x={x}
        y={y}
        transform={`rotate(${rot} ${x} ${y})`}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size}
        fill="currentColor"
        className="label"
      >
        {ch}
      </text>
    );
  });
}

export function Seal({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden fill="none">
      <g stroke="currentColor">
        <circle cx={CX} cy={CY} r="59" strokeWidth="1.2" />
        <circle cx={CX} cy={CY} r="51" strokeWidth="0.6" strokeDasharray="1 2.6" />
        <ellipse cx={CX} cy={CY} rx="18" ry="6.8" strokeWidth="1.1" transform={`rotate(34 ${CX} ${CY})`} />
        <ellipse cx={CX} cy={CY} rx="18" ry="6.8" strokeWidth="1.1" transform={`rotate(-34 ${CX} ${CY})`} />
      </g>
      <circle cx={CX} cy={CY} r="3.4" fill="currentColor" />

      {arc("ASIMOV", { radius: 55, center: -90, step: 9.8, size: 8.6, inside: false })}
      {arc("PREDICTION", { radius: 55, center: 90, step: 6, size: 6.8, inside: true })}
    </svg>
  );
}
