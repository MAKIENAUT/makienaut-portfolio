"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Typography, Button, Icon } from "@/components/atoms";
import { FaBriefcase, FaEnvelope } from "react-icons/fa";

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
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullName.length) {
        setTypedText(fullName.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [fullName]);

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
      className={`min-h-screen flex items-center justify-center px-section-x relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70 z-0" />

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-gap-lg lg:gap-section-x items-center relative z-medium">
        <div className="text-white space-y-gap-md animate-fadeIn text-center lg:text-left">
          <Typography
            variant="overline"
            color="yellow"
            font="poppins"
            className="font-semibold"
          >
            Welcome to my portfolio
          </Typography>
          
          <Typography variant="h1" color="white" font="spaceGrotesk">
            Hi, I&apos;m{" "}
            <span className="bg-gradient-to-r from-brand-primary to-brand-primary-dark bg-clip-text text-transparent block sm:inline mt-2 sm:mt-0">
              {typedText}
              <span className="animate-pulse">|</span>
            </span>
          </Typography>
          
          <Typography
            variant="body"
            color="gray"
            font="poppins"
            className="leading-relaxed max-w-2xl mx-auto lg:mx-0"
          >
            Full-Stack Web Developer with an acute fascination for spiders 🕸️
            <br className="hidden sm:block" />
            <span className="block mt-2 sm:inline sm:mt-0">
              Building exceptional web experiences, hunting bugs, and delivering
              quality solutions.
            </span>
          </Typography>
          
          <div className="flex flex-col sm:flex-row gap-gap-sm justify-center lg:justify-start pt-gap-sm">
            <Button
              variant="primary"
              onClick={() => scrollToSection("projects")}
              icon={<FaBriefcase />}
              className="w-full sm:w-auto"
            >
              View Projects
            </Button>
            <Button
              variant="outline"
              onClick={() => scrollToSection("contact")}
              icon={<FaEnvelope />}
              className="w-full sm:w-auto"
            >
              Get In Touch
            </Button>
          </div>
        </div>

        <div className="relative mt-8 lg:mt-0 max-w-sm sm:max-w-md mx-auto lg:max-w-none">
          <div className="w-full max-w-[280px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-md mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-primary-dark rounded-card-lg blur-xl sm:blur-2xl opacity-20 animate-pulse" />
            <div className="relative bg-gray-800 rounded-card-lg p-card-padding border-2 border-brand-primary/20 shadow-elevation-medium">
              <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-900 rounded-card flex items-center justify-center p-card-padding">
                <div className="relative w-full h-full">
                  <Image
                    src="/Orb-Weaver logo.png"
                    alt="Orb-Weaver Logo"
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 200px, (max-width: 768px) 250px, (max-width: 1024px) 300px, 400px"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};