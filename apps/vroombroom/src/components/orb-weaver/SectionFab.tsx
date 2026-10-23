"use client";

import { useRouter } from "next/navigation";
import {
  type ComponentType,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  FaCalendarCheck,
  FaClipboardList,
  FaHome,
  FaMapMarkerAlt,
  FaSprayCan,
} from "react-icons/fa";
import { GiSpiderWeb } from "react-icons/gi";
import type { IconBaseProps } from "react-icons";

const sections: Array<{
  href?: string;
  id: string;
  label: string;
  icon: ComponentType<IconBaseProps>;
}> = [
  { id: "ow-home", label: "Home", icon: FaHome },
  { id: "ow-services", label: "Services", icon: FaSprayCan },
  { id: "ow-location", label: "Meetup", icon: FaMapMarkerAlt },
  { id: "ow-process", label: "Process", icon: FaClipboardList },
  {
    id: "ow-booking",
    href: "/vroombroom/book",
    label: "Book",
    icon: FaCalendarCheck,
  },
];

export function OrbWeaverSectionFab() {
  const router = useRouter();
  const [isNavigating, startNavigation] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {
    const visibleSections = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.add(entry.target.id);
          } else {
            visibleSections.delete(entry.target.id);
          }
        });

        const current = [...sections]
          .reverse()
          .find((section) => visibleSections.has(section.id));

        if (current) {
          setActiveSection(current.id);
        }
      },
      { rootMargin: "0px 0px -52% 0px", threshold: 0 }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);

      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const activeIndex = sections.findIndex(
        (section) => section.id === activeSection
      );
      itemRefs.current[Math.max(activeIndex, 0)]?.focus();
    });

    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeSection, isOpen]);

  const handleLinkClick = (
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    const target = document.getElementById(sectionId);

    if (!target) {
      return;
    }

    event.preventDefault();
    setActiveSection(sectionId);
    window.history.pushState(null, "", `#${sectionId}`);
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
    setIsOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLAnchorElement>,
    index: number
  ) => {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % sections.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + sections.length) % sections.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = sections.length - 1;
    }

    if (nextIndex !== undefined) {
      event.preventDefault();
      itemRefs.current[nextIndex]?.focus();
    }
  };

  const radialPosition = (index: number) => {
    // Fan from left to directly above the trigger so every item stays inside
    // the viewport when the FAB sits in the bottom-right corner.
    const angle = 180 - (90 / (sections.length - 1)) * index;
    const radius = isOpen ? 116 : 0;
    const radians = (angle * Math.PI) / 180;

    return {
      x: Math.cos(radians) * radius,
      y: -Math.sin(radians) * radius,
    };
  };

  const activeLabel =
    sections.find((section) => section.id === activeSection)?.label ?? "Home";

  return (
    <>
      {isNavigating && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 top-0 z-[200] flex justify-center"
        >
          <span className="absolute inset-x-0 top-0 h-1 animate-pulse bg-amber-400" />
          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-[#10110f]/95 px-4 py-2 text-xs font-semibold text-amber-100 shadow-xl backdrop-blur-xl">
            <span
              aria-hidden="true"
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-300 border-r-transparent"
            />
            Opening booking…
          </span>
        </div>
      )}

      {isOpen && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close section navigation"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-black/45 backdrop-blur-sm print:hidden"
        />
      )}

      <nav
        aria-label="VroomBroom page sections"
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-50 h-16 w-16 overflow-visible print:hidden sm:bottom-8 sm:right-8"
      >
        <ul
          id="orb-weaver-section-menu"
          aria-hidden={!isOpen}
          className="pointer-events-none absolute inset-0 list-none"
        >
          {sections.map((section, index) => {
            const Icon = section.icon;
            const position = radialPosition(index);
            const isActive = activeSection === section.id;

            return (
              <li
                key={section.id}
                className={`absolute bottom-1/2 right-1/2 transition-all duration-300 ${
                  isOpen
                    ? "visible pointer-events-auto opacity-100"
                    : "invisible pointer-events-none opacity-0"
                }`}
                style={{
                  marginBottom: "-26px",
                  marginRight: "-26px",
                  transform: `translate(${position.x}px, ${position.y}px) scale(${
                    isOpen ? 1 : 0.65
                  })`,
                  transitionDelay: isOpen ? `${index * 45}ms` : "0ms",
                }}
              >
                <a
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  href={section.href ?? `#${section.id}`}
                  tabIndex={isOpen ? 0 : -1}
                  aria-current={isActive ? "location" : undefined}
                  onClick={(event) => {
                    if (section.href) {
                      const href = section.href;
                      event.preventDefault();
                      setIsOpen(false);
                      startNavigation(() => router.push(href));
                      return;
                    }

                    handleLinkClick(event, section.id);
                  }}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  className={`group relative flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border text-lg shadow-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-4 focus-visible:ring-offset-black ${
                    isActive
                      ? "border-amber-300 bg-amber-400 text-black"
                      : "border-stone-700 bg-[#171815]/95 text-stone-100 hover:border-amber-300 hover:text-amber-300"
                  }`}
                >
                  <Icon aria-hidden="true" />
                  <span className="pointer-events-none absolute right-[calc(100%+0.6rem)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full border border-stone-700 bg-[#10110f]/95 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">
                    {section.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        <button
          ref={triggerRef}
          type="button"
          aria-expanded={isOpen}
          aria-controls="orb-weaver-section-menu"
          aria-label={`${isOpen ? "Close" : "Open"} section navigation. Current section: ${activeLabel}`}
          onClick={() => setIsOpen((current) => !current)}
          className="group relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-amber-200/60 bg-amber-400 text-2xl text-black shadow-[0_14px_40px_rgba(245,158,11,0.32)] transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
        >
          <GiSpiderWeb
            aria-hidden="true"
            className={`transition-transform duration-500 ${
              isOpen ? "rotate-90" : ""
            }`}
          />
          <span className="pointer-events-none absolute right-[calc(100%+0.75rem)] hidden whitespace-nowrap rounded-full border border-amber-300/20 bg-[#10110f]/95 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">
            {isOpen ? "Close" : "Navigate"}
          </span>
        </button>
      </nav>
    </>
  );
}
