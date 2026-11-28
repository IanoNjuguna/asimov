"use client";

/* eslint-disable @next/next/no-img-element */
// Plain img on purpose: the venue hosts its artwork on several S3 buckets and Kalshi's
// CDN, so a next/image allow-list would break a row the first time a provider moves.
// Fixed box, lazy load, and a monogram when the request fails.

import { useState } from "react";

export function EventThumb({
  src,
  alt,
  size = 44,
  className = "",
}: {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const monogram = (alt.match(/[a-z0-9]/i)?.[0] ?? "?").toUpperCase();
  const box = { width: size, height: size };

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-raised ${className}`}
      style={box}
      aria-hidden
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          width={size}
          height={size}
          onError={() => setFailed(true)}
          className="fade-in h-full w-full object-cover"
        />
      ) : (
        <span className="text-[15px] font-semibold text-muted" style={{ fontSize: Math.round(size / 2.6) }}>
          {monogram}
        </span>
      )}
    </span>
  );
}
