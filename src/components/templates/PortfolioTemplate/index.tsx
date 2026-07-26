import React from "react";
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
  return (
    <div className={`w-full overflow-x-hidden ${className}`}>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-button bg-brand-primary px-4 py-3 font-semibold text-black shadow-elevation-high transition-transform focus:translate-y-0 print:hidden"
      >
        Skip to main content
      </a>

      <main id="main-content">
        <HeroSection />
        <ProjectsSection />
        <ExperienceSection />
        <SkillsSection />
        <AboutSection />
        <ContactSection />
      </main>

      <Footer />
      <FloatingActionNavigation />
    </div>
  );
};
