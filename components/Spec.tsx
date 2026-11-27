// Spec line, the reference's strongest device: institutional labels in a loose row, separated by a
// small star rather than a middot. Values switch to mono because they are numbers.
export function Spec({
  items,
  className = "",
}: {
  items: Array<{ k: string; v?: string }>;
  className?: string;
}) {
  return (
    <p className={`label flex flex-wrap items-center gap-x-2 gap-y-1 text-dim ${className}`}>
      {items.map((it, i) => (
        <span key={`${it.k}-${i}`} className="flex items-center gap-2">
          {i > 0 ? (
            <span aria-hidden className="text-[7px]">
              ✳
            </span>
          ) : null}
          <span>{it.k}</span>
          {it.v ? <span className="tnum font-mono text-muted">{it.v}</span> : null}
        </span>
      ))}
    </p>
  );
}
