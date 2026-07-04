export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-brand-cream/15 py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 bg-brand-cream animate-pulse rounded w-48" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-brand-cream-dark rounded-xl overflow-hidden">
            <div className="px-6 py-4 bg-brand-cream/15 border-b border-brand-cream-dark">
              <div className="h-4 bg-brand-cream animate-pulse rounded w-32" />
            </div>
            <div className="p-6 space-y-4">
              {[...Array(2)].map((_, j) => (
                <div key={j} className="flex items-center gap-4">
                  <div className="w-12 h-14 bg-brand-cream animate-pulse rounded-md" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-brand-cream animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-brand-cream animate-pulse rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
