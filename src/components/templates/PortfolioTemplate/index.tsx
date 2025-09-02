"use client";

import React, { useRef } from "react";
import { inter } from "@/styles/fonts";
import {
  HeroSection,
  AboutSection,
  SkillsSection,
  ProjectsSection,
  ExperienceSection,
  ContactSection,
  Footer,
  FloatingActionNavigation,
} from "@/components/organisms";

interface PortfolioTemplateProps {
  className?: string;
}

export const PortfolioTemplate: React.FC<PortfolioTemplateProps> = ({
  className = "",
}) => {
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});

  const scrollToSection = (sectionId: string) => {
    const section = sectionsRef.current[sectionId] || document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className={`${inter.className} w-full overflow-x-hidden ${className}`}>
      <div
        ref={(el) => {
          sectionsRef.current["home"] = el;
        }}
      >
        <HeroSection onScrollToSection={scrollToSection} />
      </div>
      
      <div
        ref={(el) => {
          sectionsRef.current["about"] = el;
        }}
      >
        <AboutSection />
      </div>
      
      <div
        ref={(el) => {
          sectionsRef.current["skills"] = el;
        }}
      >
        <SkillsSection />
      </div>
      
      <div
        ref={(el) => {
          sectionsRef.current["projects"] = el;
        }}
      >
        <ProjectsSection />
      </div>
      
      <div
        ref={(el) => {
          sectionsRef.current["experience"] = el;
        }}
      >
        <ExperienceSection />
      </div>
      
      <div
        ref={(el) => {
          sectionsRef.current["contact"] = el;
        }}
      >
        <ContactSection />
      </div>
      
      <Footer />
      
      {/* Floating Action Navigation */}
      <FloatingActionNavigation />
    </main>
  );
};