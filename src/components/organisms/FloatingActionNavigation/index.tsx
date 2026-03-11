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

  const navLinks: NavLink[] = useMemo(
    () => [
      { id: "home", label: "Home", href: "#home" },
      { id: "about", label: "About", href: "#about" },
      { id: "skills", label: "Skills", href: "#skills" },
      { id: "projects", label: "Projects", href: "#projects" },
      { id: "experience", label: "Experience", href: "#experience" },
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
    const handleScroll = () => {
      const viewportMarker = window.scrollY + window.innerHeight * 0.35;
      let currentSection = navLinks[0]?.id ?? "home";

      for (const link of navLinks) {
        const element = document.getElementById(link.id);

        if (!element) {
          continue;
        }

        const { offsetTop, offsetHeight } = element;

        if (viewportMarker >= offsetTop) {
          currentSection = link.id;
        }

        if (viewportMarker >= offsetTop && viewportMarker < offsetTop + offsetHeight) {
          currentSection = link.id;
          break;
        }
      }

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 8) {
        currentSection = navLinks[navLinks.length - 1]?.id ?? currentSection;
      }

      if (pendingSectionRef.current) {
        if (currentSection !== pendingSectionRef.current) {
          return;
        }

        pendingSectionRef.current = null;
      }

      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [navLinks]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    href: string
  ) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      pendingSectionRef.current = targetId;
      setActiveSection(targetId);
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen((currentState) => !currentState);
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
    let angle = getNavAngle(index, total);
    let radius;

    if (isFanOpen) {
      // Final fan position
      // Push buttons farther from the hub so they separate more along the arc
      radius = 118;
    } else {
      // Rest indicator dots on the edge of the main FAB
      radius = 42;
    }

    const radian = (angle * Math.PI) / 180;

    return {
      x: Math.cos(radian) * radius,
      y: -Math.sin(radian) * radius,
    };
  };

  const activeIndex = navLinks.findIndex((link) => link.id === activeSection);
  const compassRotation =
    compassRotations[activeIndex >= 0 ? activeIndex : 0] ?? compassRotations[0];

  useEffect(() => {
    console.log("Compass icon rotation:", compassRotation);
  }, [compassRotation]);

  return (
    <>
      {/* Background overlay when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div
        className={`fixed bottom-8 right-8 z-50 h-16 w-16 overflow-visible transition-transform duration-300 ease-out md:bottom-20 md:right-20 ${
          isOpen
            ? "-translate-x-12 -translate-y-12 md:translate-x-0 md:translate-y-0"
            : "translate-x-0 translate-y-0"
        } ${className}`}
      >
        {/* Navigation Items */}
        <div
          id="floating-navigation-menu"
          className="pointer-events-none absolute inset-0 z-10 overflow-visible"
        >
          {navLinks.map((link, index) => {
            const isActive = activeSection === link.id;
            const position = getRadialPosition(index, navLinks.length, isOpen);
            
            return (
              <div
                key={link.id}
                className={`absolute right-1/2 bottom-1/2 transition-all duration-300 ease-out ${
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
                <button
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`group relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out ${
                    isOpen
                      ? isActive
                        ? "bg-gradient-to-r from-brand-primary to-brand-primary-dark text-black border-brand-primary shadow-elevation-high hover:scale-hover-lg"
                        : "bg-gray-900/90 backdrop-blur-sm text-white border-gray-700 shadow-elevation-high hover:border-brand-primary hover:bg-gray-800 hover:scale-hover-lg"
                      : isActive
                        ? "border-white/80 bg-white text-transparent shadow-none"
                        : "border-white/20 bg-brand-primary/90 text-transparent shadow-none"
                  }`}
                  title={link.label}
                  aria-label={`Go to ${link.label}`}
                  aria-current={isActive ? "page" : undefined}
                  tabIndex={isOpen ? 0 : -1}
                >
                  <span
                    className={`transition-all duration-200 ${
                      isOpen ? "opacity-100 scale-100" : "opacity-0 scale-0"
                    }`}
                  >
                    <Icon size="lg" color={isActive ? "black" : "white"}>
                      {navIcons[link.id as keyof typeof navIcons]}
                    </Icon>
                  </span>
                  <span
                    className={`pointer-events-none absolute right-[calc(100%+0.75rem)] top-1/2 -translate-y-1/2 rounded-element bg-gray-900/90 px-3 py-2 text-body-sm text-white whitespace-nowrap transition-opacity duration-200 ${
                      isOpen ? "opacity-0 group-hover:opacity-100" : "opacity-0"
                    }`}
                  >
                    {link.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Main FAB Button */}
        <button
          onClick={toggleMenu}
          className="relative z-0 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-brand-primary to-brand-primary-dark text-black shadow-elevation-highest transition-all duration-300 hover:scale-hover-lg active:scale-95"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
          aria-controls="floating-navigation-menu"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none transition-transform duration-500 ease-[cubic-bezier(0.22,1.35,0.36,1)]"
            style={{ transform: `rotate(${compassRotation}deg)` }}
          >
            <Icon size="xl" color="black">
              <FaCompass />
            </Icon>
          </span>
        </button>
      </div>
    </>
  );
};
