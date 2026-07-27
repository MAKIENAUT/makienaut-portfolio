import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { FaArrowLeft, FaCheck } from "react-icons/fa";
import { BookingForm } from "@/components/orb-weaver/BookingForm";
import { PendingNavigationLink } from "@/components/orb-weaver/PendingNavigationLink";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Book a Helmet Clean",
  description:
    "Request a VroomBroom helmet cleaning appointment in four quick steps.",
  alternates: {
    canonical: "https://orb-weaver.xyz/vroombroom/book",
  },
};

export default function VroomBroomBookingPage() {
  return (
    <div className="orb-weaver-page min-h-svh overflow-x-hidden bg-[#090a08] text-stone-100">
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-20 bg-[radial-gradient(circle_at_50%_8%,rgba(245,158,11,0.13),transparent_28%),linear-gradient(145deg,#11130f_0%,#090a08_50%,#030403_100%)]"
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:42px_42px]"
      />

      <header className="border-b border-white/[0.07] bg-[#090a08]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <PendingNavigationLink
            eagerPrefetch
            href="/vroombroom"
            pendingLabel="Returning…"
            className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <span className="flex h-10 w-14 items-center justify-center overflow-hidden rounded-lg">
              <Image
                src="/vroombroom-thumb.webp"
                alt=""
                width={96}
                height={96}
                unoptimized
                className="h-full w-full object-cover object-[50%_52%]"
              />
            </span>
            <span className="hidden text-sm font-semibold uppercase tracking-[0.16em] text-amber-300 sm:block">
              VroomBroom
            </span>
          </PendingNavigationLink>

          <PendingNavigationLink
            href="/vroombroom"
            pendingLabel="Returning…"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-stone-400 transition hover:text-white"
          >
            <FaArrowLeft aria-hidden="true" className="text-xs" />
            Back to site
          </PendingNavigationLink>
        </div>
      </header>

      <main className="px-5 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 text-center">
            <h1 className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
              Appointment request
            </h1>
          </div>

          <Suspense
            fallback={
              <div className="rounded-[1.75rem] border border-amber-300/15 bg-[#10110f]/95 p-6 text-sm text-stone-400">
                Preparing your booking…
              </div>
            }
          >
            <BookingForm />
          </Suspense>

          <div className="mt-5 grid gap-2 text-xs text-stone-500 sm:grid-cols-3">
            {[
              "No payment collected",
              "Private booking details",
              "Confirmation before handoff",
            ].map((item) => (
              <p key={item} className="flex items-center justify-center gap-2">
                <FaCheck
                  aria-hidden="true"
                  className="shrink-0 text-amber-300"
                />
                {item}
              </p>
            ))}
          </div>
        </div>
      </main>

    </div>
  );
}
