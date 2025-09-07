"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

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
      const sections = navLinks.map((link) => link.id);
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navLinks]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    href: string
  ) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Calculate positions for radial menu (150° arc from 210° to 60°)
  const getRadialPosition = (index: number, total: number, isFanOpen: boolean = true) => {
    // Create a 150° arc from 210° to 60°
    const startAngle = 210; // Start angle
    const endAngle = 60; // End angle
    const arcSpan = startAngle - endAngle; // 150 degrees
    
    let angle, radius;
    
    if (isFanOpen) {
      // Final fan position
      angle = startAngle - (arcSpan / (total - 1)) * index;
      // Use consistent radius across all devices
      radius = 90;
    } else {
      // Initial collapsed position (all buttons start at center)
      angle = (startAngle + endAngle) / 2; // Center angle (135°)
      radius = 0; // All buttons start at center
    }
    
    const radian = (angle * Math.PI) / 180;
    const x = Math.cos(radian) * radius;
    const y = -Math.sin(radian) * radius; // Up direction (negative y)
    return { x, y };
  };

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
        className={`fixed z-50 transition-all duration-300 ease-out ${
          isOpen 
            ? "bottom-16 right-16" 
            : "bottom-8 right-8"
        } ${className}`}
      >
        {/* Navigation Items */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10">
          {navLinks.map((link, index) => {
            const position = getRadialPosition(index, navLinks.length, isOpen);
            const isActive = activeSection === link.id;
            
            return (
              <div key={link.id} className="absolute">
                <button
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`w-12 h-12 rounded-full border-2 transform hover:scale-hover-lg ${
                    isActive
                      ? "bg-gradient-to-r from-brand-primary to-brand-primary-dark text-black border-brand-primary shadow-elevation-high scale-hover-lg"
                      : "bg-gray-900/90 backdrop-blur-sm text-white border-gray-700 hover:border-brand-primary hover:bg-gray-800"
                  } flex items-center justify-center shadow-elevation-high transition-all duration-300 ease-out`}
                  style={{
                    transform: `translate(${position.x - 24}px, ${position.y - 24}px) scale(${isOpen ? 1 : 0})`,
                    transitionDelay: `${index * 60}ms`,
                    opacity: isOpen ? 1 : 0,
                  }}
                  title={link.label}
                >
                  <Icon size="sm" color={isActive ? "black" : "white"}>
                    {navIcons[link.id as keyof typeof navIcons]}
                  </Icon>
                </button>
                
                {/* Tooltip */}
                <div
                  className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-caption rounded-element whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    transform: `translate(${position.x - 24}px, ${position.y - 56}px) translateX(-50%)`,
                    opacity: isOpen ? 0 : 0, // Initially hidden, shows on hover
                  }}
                >
                  {link.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main FAB Button */}
        <button
          onClick={toggleMenu}
          className={`w-14 h-14 rounded-full bg-gradient-to-r from-brand-primary to-brand-primary-dark text-black shadow-elevation-highest flex items-center justify-center transition-all duration-300 hover:scale-hover-lg active:scale-95 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-label="Toggle navigation"
        >
          <Icon size="md" color="black">
            <FaCompass />
          </Icon>
        </button>
      </div>
    </>
  );
};