"use client";

import React from "react";
import { Typography, Button, Badge } from "@/components/atoms";
import { FaBriefcase, FaEnvelope, FaArrowRight } from "react-icons/fa";

interface HeroSectionProps {
  fullName?: string;
  onScrollToSection?: (sectionId: string) => void;
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  fullName = "Mc Ray Escoto",
  onScrollToSection,
  className = "",
}) => {
  const quickFacts = [
    "Mid-Level Full Stack Developer",
    "React.js, Next.js, Laravel",
    "Pangasinan, Philippines",
  ];
  const highlights = [
    { label: "Experience", value: "4+ roles shipped" },
    { label: "Core focus", value: "Web apps and UI delivery" },
    { label: "English", value: "C1 EF SET" },
  ];

  const scrollToSection = (sectionId: string) => {
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    } else {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section
      id="home"
      className={`relative flex min-h-screen items-center justify-center overflow-hidden px-section-x ${className}`}
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(255,215,0,0.16),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.06),transparent_24%),linear-gradient(180deg,rgba(0,0,0,0.35),rgba(0,0,0,0.88))]" />
      <div className="absolute inset-x-0 top-0 z-0 h-px bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent" />

      <div className="relative z-medium grid w-full max-w-7xl grid-cols-1 items-center gap-gap-lg lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:gap-section-x">
        <div className="space-y-gap-md text-center text-white animate-fadeIn lg:text-left">
          <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
            {quickFacts.map((fact) => (
              <Badge key={fact} variant="tech" className="bg-white/5 text-gray-100 border-white/10">
                {fact}
              </Badge>
            ))}
          </div>

          <div className="max-w-4xl">
            <Typography
              variant="h1"
              color="white"
              font="spaceGrotesk"
              className="text-balance text-heading-lg leading-tight sm:text-display-sm lg:text-display-md"
            >
              Building production-ready web experiences for teams that need clean delivery.
            </Typography>
            <Typography
              variant="h1"
              color="gradient"
              font="spaceGrotesk"
              className="mt-4 block text-display-lg font-bold tracking-tight leading-none sm:text-display-xl sm:leading-none lg:text-[5.5rem] lg:leading-[1.02]"
            >
              {fullName}
              <span className="animate-pulse">|</span>
            </Typography>
          </div>

          <Typography
            variant="body"
            color="gray"
            font="poppins"
            className="max-w-2xl leading-relaxed text-gray-200 mx-auto lg:mx-0"
          >
            I&apos;m a full-stack developer with professional experience across enterprise work,
            freelance delivery, and AI-assisted product development. My stack is strongest in
            React.js, Next.js, Laravel, TypeScript, and practical end-to-end execution.
          </Typography>

          <div className="flex flex-col justify-center gap-gap-sm pt-gap-sm sm:flex-row lg:justify-start">
            <Button
              variant="primary"
              onClick={() => scrollToSection("projects")}
              icon={<FaBriefcase />}
              className="w-full sm:w-auto"
            >
              View Selected Work
            </Button>
            <Button
              variant="outline"
              onClick={() => scrollToSection("contact")}
              icon={<FaEnvelope />}
              className="w-full sm:w-auto"
            >
              Contact Me
            </Button>
          </div>

          <div className="grid gap-4 pt-gap-sm sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-card border border-white/10 bg-white/5 px-4 py-4 text-left backdrop-blur-sm"
              >
                <Typography variant="caption" color="yellow" className="mb-2 block">
                  {item.label}
                </Typography>
                <Typography variant="body" color="white" font="spaceGrotesk" className="text-body-md">
                  {item.value}
                </Typography>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-8 w-full max-w-md lg:mt-0 lg:max-w-none">
          <div className="relative overflow-hidden rounded-card-lg border border-brand-primary/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 shadow-elevation-high">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,215,0,0.12),transparent_55%)]" />
            <div className="relative space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <Typography variant="caption" color="yellow" className="mb-1 block">
                    Current Role
                  </Typography>
                  <Typography variant="h4" color="white" font="spaceGrotesk">
                    NTT Limited Philippines
                  </Typography>
                </div>
                <div className="inline-flex whitespace-nowrap rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-1 text-xs text-brand-primary sm:text-sm">
                  June 2024 - Present
                </div>
              </div>

              <div className="space-y-3">
                <Typography variant="h3" color="white" font="spaceGrotesk">
                  What I bring
                </Typography>
                <div className="space-y-3 text-left">
                  {[
                    "Enterprise-facing full-stack work with React.js, Next.js, and Laravel.",
                    "Cross-functional delivery across development, QA, design, and client communication.",
                    "Hands-on experience shipping websites, internal tools, and custom business platforms.",
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <span className="mt-1 text-brand-primary">
                        <FaArrowRight />
                      </span>
                      <Typography variant="caption" color="gray" font="poppins" className="leading-relaxed text-gray-200">
                        {point}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-card border border-white/10 bg-black/20 p-4">
                  <Typography variant="caption" color="yellow" className="mb-2 block">
                    Availability
                  </Typography>
                  <Typography variant="caption" color="gray" font="poppins" className="leading-relaxed">
                    Open for part-time roles, contract work, and freelance web development.
                  </Typography>
                </div>
                <div className="rounded-card border border-white/10 bg-black/20 p-4">
                  <Typography variant="caption" color="yellow" className="mb-2 block">
                    Priority
                  </Typography>
                  <Typography variant="caption" color="gray" font="poppins" className="leading-relaxed">
                    Collaborative teams focused on reliable delivery and clean, maintainable implementation.
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
