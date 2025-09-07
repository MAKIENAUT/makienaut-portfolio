import React from "react";
import Image from "next/image";
import { Typography } from "@/components/atoms";

interface AboutSectionProps {
  className?: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  className = "",
}) => {
  return (
    <section
      id="about"
      className={`py-section-y px-section-x bg-black/50 ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-gap-lg">
          <Typography variant="overline" color="yellow" className="mb-2">
            01. Introduction
          </Typography>
          <Typography variant="h2" color="white" font="spaceGrotesk">
            About Me
          </Typography>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gap-lg items-center">
          <div className="space-y-gap-md text-gray-300 order-2 lg:order-1">
            <Typography
              variant="body"
              color="gray"
              font="poppins"
              className="leading-relaxed"
            >
              Tech and the Internet have always fascinated me. During the
              pandemic, I had a voluntary mentorship that introduced me to
              JavaScript - my first programming language. Learning it was a
              &ldquo;Brain Rewire&rdquo; moment that sparked my deep love for
              programming.
            </Typography>
            <Typography
              variant="body"
              color="gray"
              font="poppins"
              className="leading-relaxed"
            >
              Currently, I&apos;m a graduating student at{" "}
              <a
                href="https://up.phinma.edu.ph/"
                className="text-brand-primary hover:underline inline-block"
              >
                PHINMA - University of Pangasinan
              </a>
              , pursuing internship opportunities. I lead my team as Project
              Manager for our Capstone Project, which has helped me land several
              small-scale projects.
            </Typography>
            <Typography
              variant="body"
              color="gray"
              font="poppins"
              className="leading-relaxed"
            >
              Aspiring to be a Tech Entrepreneur, I founded &ldquo;Orb-Weaver&rdquo; - a
              small start-up dedicated to helping growing developers like myself
              build their digital presence.
            </Typography>
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="aspect-square max-w-[280px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-full mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-card-lg p-card-padding shadow-elevation-medium">
              <div className="w-full h-full bg-gradient-to-r from-brand-primary/10 to-brand-primary-dark/10 rounded-card flex items-center justify-center p-card-padding">
                <div className="relative w-full h-full">
                  <Image
                    src="/Orb-Weaver logo.png"
                    alt="Orb-Weaver Logo"
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 200px, (max-width: 768px) 250px, (max-width: 1024px) 300px, 400px"
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