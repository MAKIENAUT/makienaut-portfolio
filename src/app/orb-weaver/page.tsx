import Image from "next/image";
import Link from "next/link";
import {
  FaArrowRight,
  FaCalendarCheck,
  FaCheck,
  FaLock,
  FaQuoteLeft,
  FaShieldAlt,
  FaSprayCan,
} from "react-icons/fa";
import { GiBubbles, GiWaterDrop } from "react-icons/gi";
import { AppointmentForm } from "@/components/orb-weaver/AppointmentForm";
import { OrbWeaverSectionFab } from "@/components/orb-weaver/SectionFab";
import { ORB_WEAVER_SERVICES } from "@/types/orb-weaver";

const processSteps = [
  {
    number: "01",
    title: "Send a request",
    description:
      "Choose a cleaning option, preferred date, and a time window that suits you.",
  },
  {
    number: "02",
    title: "Confirm the details",
    description:
      "VroomBroom gets in touch to confirm availability, handoff, and the final service.",
  },
  {
    number: "03",
    title: "Ride refreshed",
    description:
      "Your helmet gets a care-first clean and is returned ready for the next ride.",
  },
];

const serviceIcons = [GiBubbles, GiWaterDrop, FaSprayCan, FaShieldAlt];

export default function OrbWeaverPage() {
  return (
    <div className="orb-weaver-page min-h-screen overflow-x-hidden bg-[#090a08] text-stone-100">
      <a
        href="#orb-main"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-xl bg-amber-400 px-4 py-3 font-semibold text-black transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>

      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <a
            href="#ow-home"
            className="inline-flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          >
            <span className="flex h-12 w-24 items-center justify-center sm:w-20">
              <Image
                src="/vroombroom.png"
                alt=""
                width={120}
                height={80}
                className="h-auto w-full object-contain"
              />
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
                VroomBroom
              </span>
              <span className="block text-[0.68rem] text-stone-400">
                Helmet care
              </span>
            </span>
          </a>

          <a
            href="#ow-booking"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-400 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          >
            Book a clean
            <FaArrowRight aria-hidden="true" className="text-xs" />
          </a>
        </div>
      </header>

      <main id="orb-main">
        <section
          id="ow-home"
          className="relative isolate flex min-h-svh items-center overflow-hidden px-5 pb-20 pt-32 sm:px-8 lg:px-12"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_73%_34%,rgba(245,158,11,0.15),transparent_27%),radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.06),transparent_24%),linear-gradient(135deg,#11130f_0%,#090a08_55%,#030403_100%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:42px_42px]"
          />

          <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
                Independent care · By appointment
              </p>

              <h1 className="mt-7 max-w-4xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                A cleaner helmet.
                <span className="mt-2 block text-amber-400">
                  A better next ride.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
                VroomBroom is a small, care-first helmet cleaning service for
                riders who want a fresh interior, clear visor, and one less
                thing to worry about.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#ow-booking"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
                >
                  <FaCalendarCheck aria-hidden="true" />
                  Request an appointment
                </a>
                <a
                  href="#ow-process"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition hover:border-amber-300/50 hover:bg-amber-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
                >
                  See how it works
                </a>
              </div>

              <ul className="mt-10 grid gap-3 text-sm text-stone-300 sm:grid-cols-3">
                {[
                  "Care-first handling",
                  "Simple scheduling",
                  "Clear confirmation",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/15 text-[0.6rem] text-amber-300">
                      <FaCheck aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mx-auto w-full max-w-[44rem]">
              <div
                aria-hidden="true"
                className="absolute inset-[10%] rounded-full bg-amber-400/20 blur-3xl"
              />
              <Image
                src="/vroombroom.png"
                alt="VroomBroom rider logo"
                width={1536}
                height={1024}
                priority
                className="relative z-10 h-auto w-full scale-110 object-contain drop-shadow-[0_28px_32px_rgba(0,0,0,0.5)] sm:scale-125 lg:scale-[1.35]"
              />
            </div>
          </div>
        </section>

        <section
          id="ow-services"
          className="scroll-mt-6 border-y border-white/[0.07] bg-[#0e100d] px-5 py-24 sm:px-8 lg:px-12"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                  Cleaning options
                </p>
                <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Start with the care your helmet needs.
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-8 text-stone-400 lg:justify-self-end">
                This first service menu keeps the choices straightforward.
                Exact inclusions and pricing can be finalized when we go over
                the business details.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {ORB_WEAVER_SERVICES.map((service, index) => {
                const Icon = serviceIcons[index];

                return (
                  <article
                    key={service.id}
                    className="group rounded-[1.5rem] border border-white/[0.08] bg-white/[0.035] p-6 transition hover:border-amber-300/30 hover:bg-amber-300/[0.05] sm:p-7"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-xl text-amber-300 transition group-hover:bg-amber-400 group-hover:text-black">
                        <Icon aria-hidden="true" />
                      </span>
                      <span className="text-xs font-semibold text-stone-600">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-7 text-xl font-semibold text-white">
                      {service.name}
                    </h3>
                    <p className="mt-3 leading-7 text-stone-400">
                      {service.shortDescription}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="ow-process"
          className="scroll-mt-6 px-5 py-24 sm:px-8 lg:px-12"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                Simple by design
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                From request to refreshed.
              </h2>
              <p className="mt-5 leading-8 text-stone-400">
                No account to create and no complicated checkout. Just tell us
                what you need and we&apos;ll confirm the details with you.
              </p>
            </div>

            <ol className="mt-14 grid gap-5 lg:grid-cols-3">
              {processSteps.map((step, index) => (
                <li
                  key={step.number}
                  className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-b from-white/[0.055] to-transparent p-7"
                >
                  <span className="text-sm font-semibold text-amber-300">
                    {step.number}
                  </span>
                  <h3 className="mt-10 text-2xl font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 leading-7 text-stone-400">
                    {step.description}
                  </p>
                  {index < processSteps.length - 1 && (
                    <FaArrowRight
                      aria-hidden="true"
                      className="absolute right-6 top-6 hidden text-amber-300/30 lg:block"
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="ow-booking"
          className="scroll-mt-6 border-y border-white/[0.07] bg-[#0e100d] px-5 py-24 sm:px-8 lg:px-12"
        >
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                Book your clean
              </p>
              <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Give your helmet a reset.
              </h2>
              <p className="mt-6 max-w-xl leading-8 text-stone-400">
                Send an appointment request in a minute or two. Your entry is
                saved securely to the VroomBroom back-office for review.
              </p>

              <div className="mt-9 rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-5">
                <p className="font-semibold text-amber-100">
                  Before you submit
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-300">
                  {[
                    "A request is not an automatic confirmation.",
                    "VroomBroom will contact you using the details provided.",
                    "No payment information is collected here.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <FaCheck
                        aria-hidden="true"
                        className="mt-1 shrink-0 text-amber-300"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <AppointmentForm />
          </div>
        </section>

        <section
          id="ow-stories"
          className="scroll-mt-6 px-5 py-24 sm:px-8 lg:px-12"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(130deg,rgba(245,158,11,0.09),rgba(255,255,255,0.025)_45%,transparent)] lg:grid-cols-[0.75fr_1.25fr]">
              <div className="border-b border-white/[0.08] p-7 sm:p-10 lg:border-b-0 lg:border-r">
                <FaQuoteLeft
                  aria-hidden="true"
                  className="text-3xl text-amber-300"
                />
                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                  Rider stories
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">
                  Customer feedback belongs here.
                </h2>
              </div>
              <div className="flex items-center p-7 sm:p-10 lg:p-14">
                <div>
                  <p className="max-w-2xl text-xl leading-9 text-stone-200 sm:text-2xl">
                    This testimonial space is ready for real, customer-approved
                    feedback—without inventing names or reviews before you
                    provide them.
                  </p>
                  <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-stone-400">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Verified rider stories coming soon
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.08] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} VroomBroom. Ride fresh.</p>
          <Link
            href="/orb-weaver/backoffice"
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg px-2 text-stone-500 transition hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <FaLock aria-hidden="true" />
            Owner access
          </Link>
        </div>
      </footer>

      <OrbWeaverSectionFab />
    </div>
  );
}
