export default function ShowDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-4 h-6 w-40 animate-pulse rounded bg-neutral-100 sm:mb-6" />

      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          <div className="h-48 animate-pulse overflow-hidden rounded-xl bg-neutral-200 sm:h-64 sm:rounded-2xl" />

          <div className="space-y-3 rounded-xl bg-white p-6">
            <div className="h-6 w-32 animate-pulse rounded bg-neutral-200" />
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-100" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-100" />
            </div>
          </div>

          <div className="space-y-4 rounded-xl bg-white p-6">
            <div className="h-6 w-48 animate-pulse rounded bg-neutral-200" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg bg-neutral-50 p-4">
                  <div className="h-12 w-12 animate-pulse rounded-full bg-neutral-200" />
                  <div className="space-y-2">
                    <div className="h-5 w-24 animate-pulse rounded bg-neutral-200" />
                    <div className="h-4 w-32 animate-pulse rounded bg-neutral-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="space-y-4 rounded-xl bg-white p-6 lg:sticky lg:top-24">
            <div className="h-6 w-24 animate-pulse rounded bg-neutral-200" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3 rounded-lg border p-4">
                <div className="flex justify-between">
                  <div className="h-5 w-20 animate-pulse rounded bg-neutral-200" />
                  <div className="h-5 w-24 animate-pulse rounded bg-neutral-200" />
                </div>
                <div className="h-10 w-full animate-pulse rounded-lg bg-neutral-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
