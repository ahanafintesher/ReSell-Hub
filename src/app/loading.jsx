export default function Loading() {
  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4"
      role="status"
      aria-label="Loading content"
    >
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-3 border-emerald-100" />
        <div className="absolute inset-0 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin" />
      </div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider animate-pulse">
        Loading ReSell Hub...
      </p>
    </div>
  );
}
