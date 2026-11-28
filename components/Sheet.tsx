"use client";

import type { ReactNode } from "react";

/**
 * One bottom sheet for the app: backdrop, grabber, safe-area padding, and an escape
 * hatch for the states that must not be dismissed with a stray thumb.
 */
export function Sheet({
  open,
  onClose,
  dismissible = true,
  labelledBy,
  children,
}: {
  open: boolean;
  onClose: () => void;
  dismissible?: boolean;
  labelledBy?: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        onClick={() => {
          if (dismissible) onClose();
        }}
        className="backdrop-in absolute inset-0 bg-canvas/70"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="sheet-in absolute inset-x-0 bottom-0 mx-auto max-w-[520px] border-t border-line bg-surface px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3"
      >
        <div className="mx-auto mb-3 h-[2px] w-10 bg-line" />
        {children}
      </div>
    </div>
  );
}
