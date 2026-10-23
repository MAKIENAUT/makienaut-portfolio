import Image, { getImageProps } from "next/image";
import {
  FaArrowRight,
  FaCalendarCheck,
  FaChevronDown,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaMotorcycle,
  FaReceipt,
  FaShieldAlt,
  FaSprayCan,
} from "react-icons/fa";
import { GiBubbles } from "react-icons/gi";
import { OrbWeaverSectionFab } from "@/components/orb-weaver/SectionFab";
import { PendingNavigationLink } from "@/components/orb-weaver/PendingNavigationLink";
import { PublicMeetupMap } from "@/components/orb-weaver/PublicMeetupMap";
import { ResponsiveDetails } from "@/components/orb-weaver/ResponsiveDetails";
import { ServiceBookingLink } from "@/components/orb-weaver/ServiceBookingLink";
import {
  ORB_WEAVER_ADD_ONS,
  ORB_WEAVER_SERVICES,
} from "@/types/orb-weaver";
import { ORB_WEAVER_MEETUP } from "@/lib/orb-weaver/location";

const processSteps = [
  {
    number: "01",
    title: "Send a request",
    description:
      "Choose your clean, optional extras, schedule, and preferred handoff.",
  },
  {
    number: "02",
    title: "Confirm the details",
    description:
      "VroomBroom confirms availability, location, and your final total before pickup.",
  },
  {
    number: "03",
    title: "Ride refreshed",
    description:
      "Your helmet gets a care-first clean and is returned ready for the next ride.",
  },
];

const serviceIcons = [GiBubbles, FaShieldAlt, FaMotorcycle];
const vroomBroomHeroImage = "/vroombroom.png";
const meetupEmbedUrl = `https://www.google.com/maps?q=${ORB_WEAVER_MEETUP.latitude},${ORB_WEAVER_MEETUP.longitude}&z=16&output=embed`;

const deliveryOptions = [
  {
    label: "Drop off + return",
    distance: "Within 10 km",
    price: "Free",
    description: "You drop off the helmet; VroomBroom returns it when ready.",
  },
  {
    label: "Pickup + return",
    distance: "Up to 5 km",
    price: "₱30",
    description: "Door-to-door service for a single-helmet booking.",
  },
  {
    label: "Pickup + return",
    distance: "Over 5–10 km",
    price: "₱50",
    description: "Door-to-door service for a single-helmet booking.",
  },
  {
    label: "Two or more helmets",
    distance: "Within 10 km",
    price: "Free",
    description: "Pickup and return are included in one shared booking.",
  },
];

export default function OrbWeaverPage() {
  const {
    props: { srcSet: mobileHeroSrcSet, ...mobileHeroProps },
  } = getImageProps({
    src: vroomBroomHeroImage,
    alt: "",
    width: 1024,
    height: 1024,
    sizes: "100vw",
    quality: 65,
    priority: true,
  });
  const {
    props: { srcSet: desktopHeroSrcSet },
  } = getImageProps({
    src: vroomBroomHeroImage,
    alt: "",
    width: 1024,
    height: 1024,
    sizes: "min(44rem, 46vw)",
    quality: 65,
    priority: true,
  });

  return (
    <div className="orb-weaver-page min-h-screen overflow-x-hidden bg-[#090a08] text-stone-100">
      <link
        rel="preload"
        as="image"
        imageSrcSet={mobileHeroSrcSet}
        imageSizes="100vw"
        media="(max-width: 1023px)"
      />
      <link
        rel="preload"
        as="image"
        imageSrcSet={desktopHeroSrcSet}
        imageSizes="min(44rem, 46vw)"
        media="(min-width: 1024px)"
      />
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
            <span className="flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14">
              <Image
                src="/vroombroom-thumb.webp"
                alt=""
                width={96}
                height={96}
                unoptimized
                className="h-full w-full rounded-xl object-cover"
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

          <div className="flex items-center gap-1.5 sm:gap-2">
            <PendingNavigationLink
              href="/vroombroom/orders"
              pendingLabel="Opening…"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-stone-300 transition hover:bg-white/[0.06] hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:px-4 sm:text-sm"
            >
              <FaReceipt aria-hidden="true" />
              <span className="hidden min-[390px]:inline">Track order</span>
              <span className="min-[390px]:hidden">Track</span>
            </PendingNavigationLink>
            <PendingNavigationLink
              eagerPrefetch
              href="/vroombroom/book"
              pendingLabel="Opening…"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-400 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-4 focus-visible:ring-offset-black sm:px-4 sm:text-sm"
            >
              Book a clean
              <FaArrowRight
                aria-hidden="true"
                className="hidden text-xs sm:block"
              />
            </PendingNavigationLink>
          </div>
        </div>
      </header>

      <main id="orb-main">
        <section
          id="ow-home"
          className="relative isolate flex min-h-svh items-stretch overflow-hidden px-5 pb-20 pt-28 sm:items-start sm:px-8 sm:pt-32 lg:items-center lg:px-12"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_73%_34%,rgba(245,158,11,0.15),transparent_27%),radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.06),transparent_24%),linear-gradient(135deg,#11130f_0%,#090a08_55%,#030403_100%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:42px_42px]"
          />
          <div className="mx-auto grid w-full max-w-7xl items-stretch gap-14 sm:items-center lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
            <div className="relative z-10 flex min-h-[calc(100svh-12rem)] flex-col text-center sm:block sm:min-h-0 sm:text-left">
              <div className="my-auto sm:my-0">
                <h1 className="mx-auto max-w-4xl text-balance text-[2.35rem] font-semibold leading-[0.96] tracking-[-0.045em] text-white sm:mx-0 sm:text-6xl lg:text-7xl">
                  A cleaner helmet.
                  <span className="mt-2 block text-amber-400">
                    A better next ride.
                  </span>
                </h1>

                <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-stone-300 sm:mx-0 sm:mt-7 sm:max-w-2xl sm:text-lg sm:leading-8">
                  VroomBroom is a small, care-first helmet cleaning service for
                  riders who want a fresh interior, clear visor, and one less
                  thing to worry about.
                </p>

                <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2.5 text-left text-xs text-stone-300 sm:mt-8 sm:grid sm:grid-cols-3 sm:justify-start sm:gap-3 sm:text-sm">
                  {[
                    "Single cleans from ₱300",
                    "Free return within 10 km",
                    "No upfront payment",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/15 text-[0.6rem] text-amber-300">
                        <span aria-hidden="true">✓</span>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3 pt-7 sm:mt-9 sm:flex-row sm:pt-0">
                <PendingNavigationLink
                  href="/vroombroom/book"
                  pendingLabel="Opening booking…"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
                >
                  <FaCalendarCheck aria-hidden="true" />
                  Request an appointment
                </PendingNavigationLink>
                <PendingNavigationLink
                  href="/vroombroom/orders"
                  pendingLabel="Opening orders…"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-amber-300/30 bg-amber-300/[0.08] px-6 py-3 font-semibold text-amber-100 transition hover:bg-amber-300/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
                >
                  <FaReceipt aria-hidden="true" />
                  Check my order
                </PendingNavigationLink>
                <a
                  href="#ow-services"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition hover:border-amber-300/50 hover:bg-amber-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
                >
                  View prices
                </a>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden lg:relative lg:inset-auto lg:z-auto lg:mx-auto lg:aspect-square lg:w-full lg:max-w-[44rem] lg:overflow-visible"
            >
              <div className="absolute -right-24 top-20 h-[30rem] w-[30rem] rounded-full bg-amber-400/10 blur-3xl lg:hidden" />
              <div className="absolute inset-[10%] hidden rounded-full bg-amber-400/20 blur-3xl lg:block" />
              <picture className="block h-full w-full">
                <source
                  media="(min-width: 1024px)"
                  srcSet={desktopHeroSrcSet}
                  sizes="min(44rem, 46vw)"
                />
                <img
                  {...mobileHeroProps}
                  alt=""
                  srcSet={mobileHeroSrcSet}
                  className="absolute inset-0 h-full w-full -translate-y-[9%] scale-[1.16] object-contain opacity-[0.28] lg:relative lg:inset-auto lg:z-10 lg:h-auto lg:translate-y-0 lg:scale-105 lg:opacity-100 lg:drop-shadow-[0_28px_32px_rgba(0,0,0,0.5)]"
                />
              </picture>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,10,8,0.2)_0%,rgba(9,10,8,0.5)_48%,rgba(9,10,8,0.94)_100%)] lg:hidden" />
            </div>
          </div>
        </section>

        <section
          id="ow-services"
          className="scroll-mt-6 border-y border-white/[0.07] bg-[#0e100d] px-5 py-12 sm:px-8 sm:py-20 lg:px-12"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(28rem,1.1fr)] lg:items-end lg:gap-12">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                  Cleaning options
                </p>
                <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Start with the care your helmet needs.
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-stone-400 lg:justify-self-end">
                Straightforward prices, useful extras, and no surprise charges.
                Compare what is included, then choose the clean that fits.
              </p>
            </div>

            <div className="mt-8 grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ORB_WEAVER_SERVICES.map((service, index) => {
                const Icon = serviceIcons[index];

                return (
                  <ResponsiveDetails
                    desktopOpen
                    key={service.id}
                    className={`group self-start overflow-hidden rounded-2xl border transition open:self-stretch hover:border-amber-300/40 lg:flex lg:flex-col ${
                      service.popular
                        ? "border-amber-300/30 bg-amber-300/[0.07]"
                        : !service.available
                        ? "border-white/[0.07] bg-white/[0.02] opacity-75"
                        : "border-white/[0.08] bg-white/[0.035] hover:bg-amber-300/[0.05]"
                    }`}
                  >
                    <summary className="cursor-pointer list-none p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300 [&::-webkit-details-marker]:hidden">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-300/10 text-base text-amber-300 transition group-hover:bg-amber-400 group-hover:text-black">
                          <Icon aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h3 className="font-semibold text-white">
                              {service.name}
                            </h3>
                            {service.popular && (
                              <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-black">
                                Popular
                              </span>
                            )}
                            {!service.available && (
                              <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-stone-300">
                                Coming soon
                              </span>
                            )}
                          </div>
                          <p className="mt-1 hidden text-xs leading-5 text-stone-500 sm:block">
                            {service.shortDescription}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-end justify-between gap-3 border-t border-white/[0.07] pt-3">
                        <div>
                          <p className="text-xl font-semibold text-white">
                            ₱{service.price}
                          </p>
                          <p className="text-[0.65rem] text-stone-500">
                            {service.priceSuffix}
                          </p>
                        </div>
                        <span className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-200">
                          Details
                          <FaChevronDown
                            aria-hidden="true"
                            className="transition-transform duration-200 group-open:rotate-180"
                          />
                        </span>
                      </div>
                    </summary>

                    <div className="border-t border-white/[0.08] px-4 pb-4 pt-3 lg:flex lg:flex-1 lg:flex-col">
                      <p className="mb-3 text-xs leading-5 text-stone-500 sm:hidden">
                        {service.shortDescription}
                      </p>
                      <ul className="space-y-2.5 text-xs leading-5 text-stone-300">
                        {service.inclusions.map((inclusion) => (
                          <li
                            key={inclusion}
                            className="flex items-start gap-2.5"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-0.5 shrink-0 text-amber-300"
                            >
                              ✓
                            </span>
                            {inclusion}
                          </li>
                        ))}
                      </ul>
                      {service.available ? (
                        <ServiceBookingLink
                          serviceId={service.id}
                          className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-3 py-2 text-xs font-semibold text-black transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 lg:mt-auto"
                        >
                          Choose this clean
                          <FaArrowRight
                            aria-hidden="true"
                            className="text-xs"
                          />
                        </ServiceBookingLink>
                      ) : (
                        <span className="mt-4 inline-flex min-h-10 w-full cursor-not-allowed items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-semibold text-stone-500 lg:mt-auto">
                          Coming soon
                        </span>
                      )}
                    </div>
                  </ResponsiveDetails>
                );
              })}
            </div>

            <div className="mt-6 grid gap-3">
              <ResponsiveDetails
                desktopOpen
                className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-black/20 lg:grid lg:grid-cols-[minmax(15rem,0.34fr)_minmax(0,1fr)]"
              >
                <summary className="cursor-pointer list-none p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300 sm:p-5 [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-300/10 text-amber-300">
                      <FaSprayCan aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">
                        Optional add-ons
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {ORB_WEAVER_ADD_ONS.length} extras from ₱20
                      </p>
                    </div>
                    <FaChevronDown
                      aria-hidden="true"
                      className="shrink-0 text-amber-300 transition-transform duration-200 group-open:rotate-180"
                    />
                  </div>
                </summary>
                <div className="grid border-t border-white/[0.08] px-4 py-2 sm:grid-cols-2 sm:px-5 lg:grid lg:grid-cols-3 lg:border-l lg:border-t-0">
                  {ORB_WEAVER_ADD_ONS.map((addOn) => (
                    <div
                      key={addOn.id}
                      className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-2.5 text-sm last:border-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:border-r lg:px-4 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
                    >
                      <span className="text-stone-300">{addOn.name}</span>
                      <span className="shrink-0 font-semibold text-amber-200">
                        +₱{addOn.price}
                      </span>
                    </div>
                  ))}
                </div>
              </ResponsiveDetails>

              <ResponsiveDetails
                desktopOpen
                className="group overflow-hidden rounded-2xl border border-amber-300/15 bg-amber-300/[0.05]"
              >
                <summary className="cursor-pointer list-none p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300 sm:p-5 [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-black">
                      <FaMotorcycle aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">
                        Pickup and return
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        From ₱30 · free for 2+ within 10 km
                      </p>
                    </div>
                    <FaChevronDown
                      aria-hidden="true"
                      className="shrink-0 text-amber-300 transition-transform duration-200 group-open:rotate-180"
                    />
                  </div>
                </summary>

                <div className="border-t border-white/[0.08] p-4 sm:p-5 lg:block">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {deliveryOptions.map((option) => (
                      <div
                        key={`${option.label}-${option.distance}`}
                        className="rounded-xl border border-white/[0.08] bg-black/20 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {option.label}
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 text-[0.7rem] text-stone-500">
                              <FaMapMarkerAlt aria-hidden="true" />
                              {option.distance}
                            </p>
                          </div>
                          <span className="font-semibold text-amber-200">
                            {option.price}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-stone-400">
                          {option.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.035] p-3 text-xs leading-5 text-stone-400">
                    Beyond 10 km, add ₱10 per excess kilometer based on the
                    one-way route. Distance and any transport fee are confirmed
                    first.
                  </div>
                </div>
              </ResponsiveDetails>
            </div>
          </div>
        </section>

        <section
          id="ow-location"
          className="scroll-mt-6 px-5 py-8 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
        >
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl border border-white/[0.08] bg-[linear-gradient(135deg,rgba(245,158,11,0.09),rgba(255,255,255,0.025)_48%,transparent)] sm:rounded-[2rem] lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[13rem] border-b border-white/[0.08] sm:min-h-[24rem] lg:min-h-[34rem] lg:border-b-0 lg:border-r">
              <PublicMeetupMap
                src={meetupEmbedUrl}
                title={`${ORB_WEAVER_MEETUP.name} meetup map`}
              />
              <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-amber-200/30 bg-[#10110f]/90 px-2.5 py-1.5 text-[0.65rem] font-semibold text-amber-200 shadow-xl backdrop-blur sm:left-6 sm:top-6 sm:px-3 sm:py-2 sm:text-xs">
                <FaMapMarkerAlt
                  aria-hidden="true"
                  className="mr-2 inline-block"
                />
                Public meetup pin
              </div>
            </div>

            <div className="flex items-center p-5 sm:p-10 lg:p-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                  Meetup location
                </p>
                <h2 className="mt-2 text-balance text-2xl font-semibold leading-tight tracking-tight text-white sm:mt-4 sm:text-5xl">
                  Meet at a familiar public landmark.
                </h2>
                <div className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.06] p-3.5 sm:mt-7 sm:rounded-2xl sm:p-5">
                  <p className="flex items-start gap-2.5 text-sm font-semibold text-amber-100 sm:gap-3 sm:text-base">
                    <FaMapMarkerAlt
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-amber-300 sm:mt-1"
                    />
                    {ORB_WEAVER_MEETUP.name}
                  </p>
                  <p className="mt-1 pl-6 text-xs font-medium text-amber-100/80 sm:pl-7 sm:text-sm">
                    {ORB_WEAVER_MEETUP.label}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-stone-400 sm:mt-3 sm:text-sm sm:leading-6">
                    This is VroomBroom&apos;s public meetup point—not a private
                    home address. Every handoff is scheduled and confirmed
                    first.
                  </p>
                </div>

                <ul className="mt-4 space-y-2 text-xs leading-5 text-stone-300 sm:mt-6 sm:space-y-3 sm:text-sm sm:leading-6">
                  {[
                    "Drop-off customers meet on Belton Drive at the confirmed time.",
                    "Delivery distance and fees are confirmed before handoff.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 sm:gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-amber-300"
                      >
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <a
                  href={ORB_WEAVER_MEETUP.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-4 focus-visible:ring-offset-black sm:mt-8 sm:min-h-12 sm:w-auto sm:px-5 sm:py-3 sm:text-base"
                >
                  Open meetup in Google Maps
                  <FaExternalLinkAlt aria-hidden="true" className="text-xs" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          id="ow-process"
          className="scroll-mt-6 px-5 py-12 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
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

            <ol className="mt-8 grid gap-4 sm:mt-12 lg:mt-14 lg:grid-cols-3 lg:gap-5">
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

      </main>

      <footer className="border-t border-white/[0.08] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl text-sm text-stone-500">
          <p>© {new Date().getFullYear()} VroomBroom. Ride fresh.</p>
        </div>
      </footer>

      <OrbWeaverSectionFab />
    </div>
  );
}
