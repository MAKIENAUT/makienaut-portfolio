"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/atoms";
import {
  FaCompass,
  FaHome,
  FaUser,
  FaCog,
  FaBriefcase,
  FaClock,
  FaEnvelope,
} from "react-icons/fa";
import { NavLink } from "@/types";

interface FloatingActionNavigationProps {
  className?: string;
}

export const FloatingActionNavigation: React.FC<FloatingActionNavigationProps> = ({
  className = "",
}) => {
  const compassRotations = [12, 42, 72, 102, 132, 162];
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const pendingSectionRef = useRef<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const navItemRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  const navLinks: NavLink[] = useMemo(
    () => [
      { id: "home", label: "Home", href: "#home" },
      { id: "projects", label: "Projects", href: "#projects" },
      { id: "experience", label: "Experience", href: "#experience" },
      { id: "skills", label: "Skills", href: "#skills" },
      { id: "about", label: "About", href: "#about" },
      { id: "contact", label: "Contact", href: "#contact" },
    ],
    []
  );

  const navIcons = {
    home: <FaHome />,
    about: <FaUser />,
    skills: <FaCog />,
    projects: <FaBriefcase />,
    experience: <FaClock />,
    contact: <FaEnvelope />,
  };

  useEffect(() => {
    const visibleSections = new Set<string>();
    const sectionElements = navLinks
      .map((link) => document.getElementById(link.id))
      .filter((element): element is HTMLElement => element !== null);

    const syncSectionFromHash = () => {
      const hashSection = window.location.hash.slice(1);

      if (navLinks.some((link) => link.id === hashSection)) {
        pendingSectionRef.current = hashSection;
        setActiveSection(hashSection);
      } else {
        pendingSectionRef.current = null;
      }
    };

    syncSectionFromHash();
    window.addEventListener("hashchange", syncSectionFromHash);
    window.addEventListener("popstate", syncSectionFromHash);

    if (!("IntersectionObserver" in window)) {
      return () => {
        window.removeEventListener("hashchange", syncSectionFromHash);
        window.removeEventListener("popstate", syncSectionFromHash);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.add(entry.target.id);
          } else {
            visibleSections.delete(entry.target.id);
          }
        });

        const pendingSection = pendingSectionRef.current;

        if (pendingSection) {
          if (visibleSections.has(pendingSection)) {
            pendingSectionRef.current = null;
            setActiveSection(pendingSection);
          }

          return;
        }

        // The final matching section is the one furthest down the page. Using
        // the top half of the viewport makes this act like a stable scroll spy
        // without reading layout values on every scroll event.
        const currentSection = [...navLinks]
          .reverse()
          .find((link) => visibleSections.has(link.id));

        if (currentSection) {
          setActiveSection(currentSection.id);
        }
      },
      { rootMargin: "0px 0px -50% 0px", threshold: 0 }
    );

    sectionElements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", syncSectionFromHash);
      window.removeEventListener("popstate", syncSectionFromHash);
    };
  }, [navLinks]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      const currentItem = navItemRefs.current.find(
        (item) => item?.getAttribute("aria-current") === "location"
      );
      (currentItem ?? navItemRefs.current[0])?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      triggerRef.current?.focus({ preventScroll: true });
      setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const closeMenu = (returnFocus = true) => {
    if (returnFocus) {
      triggerRef.current?.focus({ preventScroll: true });
    }

    setIsOpen(false);
  };

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const targetId = href.slice(1);
    const element = document.getElementById(targetId);

    if (!element) {
      return;
    }

    event.preventDefault();
    pendingSectionRef.current = targetId;
    setActiveSection(targetId);

    if (window.location.hash !== href) {
      window.history.pushState(null, "", href);
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    element.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
    closeMenu();
  };

  const handleMenuKeyDown = (
    event: React.KeyboardEvent<HTMLAnchorElement>,
    index: number
  ) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (index + 1) % navLinks.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (index - 1 + navLinks.length) % navLinks.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = navLinks.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      navItemRefs.current[nextIndex]?.focus();
    }
  };

  const toggleMenu = () => {
    if (isOpen) {
      closeMenu(false);
    } else {
      setIsOpen(true);
    }
  };

  const getNavAngle = (index: number, total: number) => {
    const startAngle = 210;
    const endAngle = 60;
    const arcSpan = startAngle - endAngle;

    return total > 1 ? startAngle - (arcSpan / (total - 1)) * index : 135;
  };

  const getRadialPosition = (
    index: number,
    total: number,
    isFanOpen: boolean = true
  ) => {
    const angle = getNavAngle(index, total);
    const radius = isFanOpen ? 118 : 42;
    const radian = (angle * Math.PI) / 180;

    return {
      x: Math.cos(radian) * radius,
      y: -Math.sin(radian) * radius,
    };
  };

  const activeIndex = navLinks.findIndex((link) => link.id === activeSection);
  const activeLabel =
    navLinks[activeIndex >= 0 ? activeIndex : 0]?.label ?? "Home";
  const compassRotation =
    compassRotations[activeIndex >= 0 ? activeIndex : 0] ?? compassRotations[0];

  return (
    <>
      {isOpen && (
        <button
          type="button"
          tabIndex={-1}
          className="fixed inset-0 z-40 cursor-default border-0 bg-black/30 p-0 backdrop-blur-sm print:hidden"
          onClick={() => closeMenu()}
          aria-label="Close section navigation"
        />
      )}

      <nav
        aria-label="Page sections"
        className={`fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-50 h-16 w-16 overflow-visible transition-transform duration-300 ease-out motion-reduce:transition-none print:hidden md:bottom-[calc(5rem+env(safe-area-inset-bottom))] md:right-[calc(5rem+env(safe-area-inset-right))] ${
          isOpen
            ? "-translate-x-12 -translate-y-12 md:translate-x-0 md:translate-y-0"
            : "translate-x-0 translate-y-0"
        } ${className}`}
      >
        <ul
          id="floating-navigation-menu"
          aria-hidden={!isOpen}
          className="pointer-events-none absolute inset-0 z-10 m-0 list-none overflow-visible p-0"
        >
          {navLinks.map((link, index) => {
            const isActive = activeSection === link.id;
            const position = getRadialPosition(index, navLinks.length, isOpen);

            return (
              <li
                key={link.id}
                className={`absolute bottom-1/2 right-1/2 transition-all duration-300 ease-out motion-reduce:transition-none ${
                  isOpen ? "pointer-events-auto" : "pointer-events-none"
                }`}
                style={{
                  marginRight: "-28px",
                  marginBottom: "-28px",
                  transform: `translate(${position.x}px, ${position.y}px) scale(${
                    isOpen ? 1 : 0.18
                  })`,
                  transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
                }}
              >
                <a
                  ref={(element) => {
                    navItemRefs.current[index] = element;
                  }}
                  href={link.href}
                  onClick={(event) => handleNavClick(event, link.href)}
                  onKeyDown={(event) => handleMenuKeyDown(event, index)}
                  className={`group relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black ${
                    isOpen
                      ? isActive
                        ? "border-brand-primary bg-gradient-to-r from-brand-primary to-brand-primary-dark text-black shadow-elevation-high hover:scale-hover-lg"
                        : "border-gray-700 bg-gray-900/95 text-white shadow-elevation-high backdrop-blur-sm hover:scale-hover-lg hover:border-brand-primary hover:bg-gray-800"
                      : isActive
                        ? "border-white/80 bg-white text-transparent shadow-none"
                        : "border-white/20 bg-brand-primary/90 text-transparent shadow-none"
                  }`}
                  aria-current={isActive ? "location" : undefined}
                  tabIndex={isOpen ? 0 : -1}
                  title={link.label}
                >
                  <span
                    aria-hidden="true"
                    className={`transition-all duration-200 motion-reduce:transition-none ${
                      isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    }`}
                  >
                    <Icon size="lg" color={isActive ? "black" : "white"}>
                      {navIcons[link.id as keyof typeof navIcons]}
                    </Icon>
                  </span>
                  <span
                    className={`pointer-events-none absolute right-[calc(100%+0.625rem)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-element border px-3 py-2 text-body-sm font-medium opacity-0 shadow-elevation-high transition-opacity duration-200 motion-reduce:transition-none md:block md:group-hover:opacity-100 md:group-focus-visible:opacity-100 ${
                      isActive
                        ? "border-brand-primary bg-brand-primary text-black"
                        : "border-gray-700 bg-gray-950/95 text-white"
                    }`}
                  >
                    {link.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        <button
          ref={triggerRef}
          type="button"
          onClick={toggleMenu}
          className="group relative z-20 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-brand-primary to-brand-primary-dark text-black shadow-elevation-highest transition-all duration-300 hover:scale-hover-lg active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          aria-label={`${isOpen ? "Close" : "Open"} section navigation. Current section: ${activeLabel}`}
          aria-expanded={isOpen}
          aria-controls="floating-navigation-menu"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none transition-transform duration-500 ease-[cubic-bezier(0.22,1.35,0.36,1)] motion-reduce:transition-none"
            style={{ transform: `rotate(${compassRotation}deg)` }}
          >
            <Icon size="xl" color="black">
              <FaCompass />
            </Icon>
          </span>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-[calc(100%+0.75rem)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full border border-brand-primary/40 bg-gray-950/95 px-3 py-1.5 text-xs font-semibold tracking-wide text-white opacity-0 shadow-elevation-high transition-opacity duration-200 motion-reduce:transition-none md:block md:group-hover:opacity-100 md:group-focus-visible:opacity-100"
          >
            {isOpen ? "Close navigation" : "Navigate"}
          </span>
        </button>
      </nav>
    </>
  );
};
