// A market costs three upstream calls keyless, so the shell is a skeleton rather than
// a spinner on an empty page.
export default function LoadingMarket() {
  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top)+12px)]">
      <div className="breathe h-3 w-24 rounded bg-line" />
      <div className="mt-4 space-y-2">
        <div className="breathe h-6 w-[85%] rounded bg-line" />
        <div className="breathe h-6 w-[45%] rounded bg-line" />
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div className="breathe h-11 w-28 rounded bg-line" />
        <div className="breathe h-8 w-16 rounded bg-line" />
      </div>
      <div className="breathe mt-5 h-[168px] rounded-2xl border border-line bg-surface" />
      <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
        <div className="breathe h-[124px] bg-surface" />
        <div className="breathe h-[124px] bg-surface" />
      </div>
    </div>
  );
}
