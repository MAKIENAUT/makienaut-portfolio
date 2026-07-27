export default function VroomBroomBookingLoading() {
  return (
    <div
      role="status"
      aria-label="Loading appointment form"
      className="min-h-svh bg-[#090a08] text-stone-100"
    >
      <div className="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-amber-300/15">
        <div className="h-full w-full animate-pulse bg-amber-400" />
      </div>
      <header className="border-b border-white/[0.07]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="h-10 w-24 animate-pulse rounded-xl bg-white/[0.07]" />
          <div className="h-10 w-28 animate-pulse rounded-xl bg-white/[0.05]" />
        </div>
      </header>
      <main className="px-5 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto h-7 w-64 animate-pulse rounded-lg bg-white/[0.07]" />
          <div className="mx-auto mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-white/[0.05]" />
          <div className="mt-7 overflow-hidden rounded-[1.75rem] border border-amber-300/15 bg-[#10110f]/95">
            <div className="border-b border-white/[0.08] p-5">
              <div className="h-1.5 w-full animate-pulse rounded-full bg-amber-300/30" />
            </div>
            <div className="space-y-4 p-6">
              <div className="h-6 w-52 animate-pulse rounded bg-white/[0.08]" />
              <div className="h-11 w-full animate-pulse rounded-xl bg-white/[0.05]" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-11 animate-pulse rounded-xl bg-white/[0.05]" />
                <div className="h-11 animate-pulse rounded-xl bg-white/[0.05]" />
              </div>
            </div>
            <div className="flex justify-end border-t border-white/[0.08] p-4">
              <div className="h-11 w-28 animate-pulse rounded-xl bg-amber-300/20" />
            </div>
          </div>
          <p className="mt-5 text-center text-sm text-stone-500">
            Preparing your saved booking…
          </p>
        </div>
      </main>
    </div>
  );
}
