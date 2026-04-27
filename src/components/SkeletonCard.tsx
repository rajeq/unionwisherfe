export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded skeleton" />
          <div className="h-3 w-24 rounded skeleton" />
          <div className="h-3 w-40 rounded skeleton" />
        </div>
      </div>
      <div className="h-9 w-full rounded-lg skeleton mt-4" />
    </div>
  );
}
