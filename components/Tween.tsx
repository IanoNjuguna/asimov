"use client";

import { useEffect, useRef, useState } from "react";

const reduce = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Figures that answer typing. 160ms of eased interpolation, skipped entirely under
 * reduced motion, and always settles on the exact value rather than a rounded one.
 */
export function Tween({
  value,
  format,
  duration = 160,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
}) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = from.current;
    if (start === value) return;

    const span = reduce() ? 0 : duration;
    const began = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = span === 0 ? 1 : Math.min(1, (now - began) / span);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(start + (value - start) * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        from.current = value;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      from.current = value;
    };
  }, [value, duration]);

  return <>{format(shown)}</>;
}
