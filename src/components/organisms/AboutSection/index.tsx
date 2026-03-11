import React from "react";
import { Typography, Badge } from "@/components/atoms";

interface AboutSectionProps {
  className?: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  className = "",
}) => {
  const strengths = [
    "React.js and Next.js delivery",
    "Laravel and Express.js backends",
    "Project coordination and client communication",
    "DevOps-aware deployment workflows",
  ];

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
              I earned my Bachelor of Science in Information Technology with a specialization
              in Web Development from PHINMA University of Pangasinan in June 2024. Since then,
              I&apos;ve been building on that foundation through enterprise, freelance, and product work.
            </Typography>
            <Typography
              variant="body"
              color="gray"
              font="poppins"
              className="leading-relaxed"
            >
              My work spans front-end implementation, middleware integration, full-stack
              delivery, QA, and project management. That range lets me contribute beyond code:
              I can move between technical execution, team coordination, and client-facing problem solving.
            </Typography>
            <Typography
              variant="body"
              color="gray"
              font="poppins"
              className="leading-relaxed"
            >
              I&apos;m currently based in Pasig City, Metro Manila and working as a Mid-Level Full Stack
              Developer at{" "}
              <a
                href="https://services.global.ntt/"
                className="text-brand-primary hover:underline inline-block"
                target="_blank"
                rel="noopener noreferrer"
              >
                NTT Limited Philippines Branch
              </a>
              , where I help build scalable web solutions for enterprise-facing teams.
            </Typography>
            <div className="flex flex-wrap gap-3 pt-2">
              {strengths.map((strength) => (
                <Badge key={strength} variant="tech">
                  {strength}
                </Badge>
              ))}
            </div>
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="rounded-card-lg border border-white/10 bg-gradient-to-br from-gray-900 to-black p-card-padding shadow-elevation-medium">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-card border border-brand-primary/20 bg-brand-primary/5 p-5">
                  <Typography variant="caption" color="yellow" className="mb-2 block">
                    Education
                  </Typography>
                  <Typography variant="h4" color="white" font="spaceGrotesk" className="mb-2">
                    BS Information Technology
                  </Typography>
                  <Typography variant="caption" color="gray" font="poppins" className="leading-relaxed">
                    Specializing in Web Development
                  </Typography>
                  <Typography variant="caption" color="gray" font="poppins" className="mt-2 block leading-relaxed">
                    PHINMA University of Pangasinan
                  </Typography>
                </div>
                <div className="rounded-card border border-white/10 bg-white/5 p-5">
                  <Typography variant="caption" color="yellow" className="mb-2 block">
                    Communication
                  </Typography>
                  <Typography variant="h4" color="white" font="spaceGrotesk" className="mb-2">
                    EF SET C1 Advanced
                  </Typography>
                  <Typography variant="caption" color="gray" font="poppins" className="leading-relaxed">
                    Strong English proficiency for remote collaboration and client communication.
                  </Typography>
                </div>
                <div className="rounded-card border border-white/10 bg-white/5 p-5 sm:col-span-2">
                  <Typography variant="caption" color="yellow" className="mb-2 block">
                    Working Style
                  </Typography>
                  <Typography variant="caption" color="gray" font="poppins" className="leading-relaxed">
                    I work best in environments where ownership matters: clarify the requirement,
                    ship the feature, document the decision, and keep the handoff clean for the next person.
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
