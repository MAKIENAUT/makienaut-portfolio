import React from "react";
import { Typography, Button } from "@/components/atoms";
import { FaBriefcase, FaEnvelope, FaArrowRight, FaMapMarkerAlt } from "react-icons/fa";

interface HeroSectionProps {
  fullName?: string;
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  fullName = "Mc Ray Escoto",
  className = "",
}) => {
  const proofPoints = [
    { label: "Work contexts", value: "Enterprise + client delivery" },
    { label: "Core stack", value: "React · Next.js · Laravel" },
    { label: "Communication", value: "EF SET C1 Advanced" },
  ];

  return (
    <section
      id="home"
      className={`relative min-h-svh overflow-hidden px-section-x py-16 sm:py-20 xl:flex xl:items-center xl:py-24 ${className}`}
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(255,215,0,0.16),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.06),transparent_24%),linear-gradient(180deg,rgba(0,0,0,0.35),rgba(0,0,0,0.88))]" />
      <div className="absolute inset-x-0 top-0 z-0 h-px bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent" />

      <div className="relative z-medium mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] xl:gap-section-x">
        <div className="space-y-6 text-center text-white motion-safe:animate-fadeIn xl:text-left">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-gray-200 xl:justify-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-2 text-brand-primary">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand-primary shadow-[0_0_12px_rgba(255,215,0,0.8)]" />
              Open to new opportunities
            </span>
            <span className="inline-flex items-center gap-2">
              <FaMapMarkerAlt aria-hidden="true" className="text-brand-primary" />
              From Pangasinan · based in Pasig
            </span>
          </div>

          <div className="mx-auto max-w-4xl xl:mx-0">
            <Typography variant="overline" color="yellow" className="mb-3 block">
              Mid-Level Full-Stack Developer
            </Typography>
            <Typography
              variant="h1"
              color="gradient"
              font="spaceGrotesk"
              className="text-balance text-display-lg font-bold leading-none tracking-tight sm:text-display-xl sm:leading-none xl:text-[4.75rem] xl:leading-[1.02]"
            >
              {fullName}
            </Typography>
            <Typography
              variant="h2"
              color="white"
              font="spaceGrotesk"
              className="mx-auto mt-5 max-w-3xl text-balance text-heading-lg font-medium leading-tight xl:mx-0 xl:text-display-md"
            >
              Building reliable web products from interface to deployment.
            </Typography>
          </div>

          <Typography
            variant="body"
            color="gray"
            font="poppins"
            className="mx-auto max-w-2xl leading-relaxed text-gray-200 xl:mx-0"
          >
            I work across interface development, APIs, QA, and delivery—turning requirements
            into maintainable applications with React.js, Next.js, Laravel, and TypeScript.
          </Typography>

          <div className="flex flex-col justify-center gap-3 pt-1 sm:flex-row xl:justify-start">
            <Button
              variant="primary"
              href="#projects"
              icon={<FaBriefcase />}
              className="w-full sm:w-auto"
            >
              View Selected Work
            </Button>
            <Button
              variant="outline"
              href="#contact"
              icon={<FaEnvelope />}
              className="w-full sm:w-auto"
            >
              Contact Me
            </Button>
          </div>

          <dl className="grid gap-3 pt-2 sm:grid-cols-3">
            {proofPoints.map((item) => (
              <div
                key={item.label}
                className="rounded-card border border-white/10 bg-white/[0.04] px-4 py-4 text-left"
              >
                <dt className="mb-2 text-caption uppercase tracking-wider text-brand-primary">
                  {item.label}
                </dt>
                <dd className="font-medium text-white">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="hidden w-full xl:block">
          <div className="relative overflow-hidden rounded-card-lg border border-brand-primary/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 shadow-elevation-high">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,215,0,0.12),transparent_55%)]" />
            <div className="relative space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <Typography variant="caption" color="yellow" className="mb-1 block">
                    Current Role
                  </Typography>
                  <Typography variant="h2" color="white" font="spaceGrotesk" className="text-heading-md">
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
                <ul className="space-y-3 text-left">
                  {[
                    "Enterprise-facing full-stack work with React.js, Next.js, and Laravel.",
                    "Cross-functional delivery across development, QA, design, and client communication.",
                    "Hands-on experience shipping websites, internal tools, and custom business platforms.",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span aria-hidden="true" className="mt-1 text-brand-primary">
                        <FaArrowRight />
                      </span>
                      <Typography variant="caption" color="gray" font="poppins" className="leading-relaxed text-gray-200">
                        {point}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-card border border-white/10 bg-black/20 p-4">
                  <Typography variant="caption" color="yellow" className="mb-2 block">
                    Availability
                  </Typography>
                  <Typography variant="caption" color="gray" font="poppins" className="leading-relaxed">
                    Open to full-time roles, part-time roles, contract work, and freelance web development.
                  </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
