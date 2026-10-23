import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import { OrderTracker } from "@/components/orb-weaver/OrderTracker";
import { PendingNavigationLink } from "@/components/orb-weaver/PendingNavigationLink";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Check your VroomBroom helmet cleaning status, delivery distance, proof, and confirmed total.",
  alternates: {
    canonical: "https://orb-weaver.xyz/vroombroom/orders",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function VroomBroomOrdersPage() {
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
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
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
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-7 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
              Order tracking
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Your cleaning ticket, live.
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone-400">
              Use the reference from your booking confirmation and the same
              mobile number you submitted.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="mx-auto max-w-2xl rounded-[1.75rem] border border-amber-300/15 bg-[#10110f]/95 p-6 text-sm text-stone-400">
                Preparing order tracking…
              </div>
            }
          >
            <OrderTracker />
          </Suspense>

          <p className="mx-auto mt-6 flex max-w-2xl items-start justify-center gap-2 text-center text-xs leading-5 text-stone-500">
            <FaShieldAlt
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-amber-300"
            />
            Your mobile number is used only to match this lookup and is not
            displayed on the ticket.
          </p>
        </div>
      </main>
    </div>
  );
}
