export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7 flex gap-4">
            <div className="flex flex-col gap-3 w-24 shrink-0">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-20 aspect-3/4 bg-brand-cream animate-pulse rounded-md" />
              ))}
            </div>
            <div className="flex-1 aspect-3/4 bg-brand-cream animate-pulse rounded-xl" />
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="h-4 bg-brand-cream animate-pulse rounded w-1/4" />
            <div className="h-8 bg-brand-cream animate-pulse rounded w-3/4" />
            <div className="h-6 bg-brand-cream animate-pulse rounded w-1/3" />
            <div className="h-32 bg-brand-cream animate-pulse rounded w-full mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
