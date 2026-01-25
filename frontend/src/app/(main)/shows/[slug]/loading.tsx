export default function ShowDetailLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Back Button */}
      <div className="h-6 w-40 bg-neutral-100 rounded animate-pulse mb-4 sm:mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Hero Section */}
          <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-200 h-48 sm:h-64 animate-pulse" />

          {/* Description */}
          <div className="bg-white rounded-xl p-6 space-y-3">
            <div className="h-6 w-32 bg-neutral-200 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-neutral-100 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-neutral-100 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-neutral-100 rounded animate-pulse" />
            </div>
          </div>

          {/* Artists */}
          <div className="bg-white rounded-xl p-6 space-y-4">
            <div className="h-6 w-48 bg-neutral-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-neutral-200 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-5 w-24 bg-neutral-200 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-neutral-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-white rounded-xl p-6 space-y-4 lg:sticky lg:top-24">
            <div className="h-6 w-24 bg-neutral-200 rounded animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="h-5 w-20 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-5 w-24 bg-neutral-200 rounded animate-pulse" />
                </div>
                <div className="h-10 w-full bg-neutral-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
