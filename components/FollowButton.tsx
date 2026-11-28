"use client";

import { toggleFollow, useFollowing, type Followed } from "@/lib/follow";

/** addedAt is stamped on the click, never during render. */
export function FollowButton({ entry }: { entry: Omit<Followed, "addedAt"> }) {
  const following = useFollowing();
  const on = following.some((f) => f.marketId === entry.marketId);

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Unfollow ${entry.eventTitle}` : `Follow ${entry.eventTitle}`}
      onClick={() => toggleFollow({ ...entry, addedAt: Date.now() })}
      className="flex h-9 w-9 items-center justify-center text-dim active:text-ink"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={on ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        className={on ? "text-ink" : undefined}
      >
        <path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.6 9.7l5.8-.8z" />
      </svg>
    </button>
  );
}
