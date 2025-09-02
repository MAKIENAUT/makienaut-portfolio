import React from "react";
import { Typography } from "@/components/atoms";
import { ExperienceCard } from "@/components/molecules";
import { experiences } from "@/data/portfolio";

interface ExperienceSectionProps {
  className?: string;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  className = "",
}) => {
  return (
    <section
      id="experience"
      className={`py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <Typography variant="overline" color="yellow" className="mb-2">
            04. Journey
          </Typography>
          <Typography variant="h2" color="white" font="spaceGrotesk">
            Experience
          </Typography>
        </div>

        {/* Mobile/Tablet Timeline */}
        <div className="lg:hidden space-y-6">
          {experiences.map((exp) => (
            <div key={exp.id} className="relative pl-8 sm:pl-10">
              <div className="absolute left-0 top-2 w-4 h-4 bg-yellow-400 rounded-full border-2 sm:border-4 border-black" />
              <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gradient-to-b from-yellow-400 to-transparent" />
              <ExperienceCard experience={exp} />
            </div>
          ))}
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-yellow-400 to-orange-500" />

          {experiences.map((exp, index) => (
            <div
              key={exp.id}
              className={`relative flex items-center mb-12 ${
                index % 2 === 0 ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`w-5/12 ${
                  index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"
                }`}
              >
                <ExperienceCard experience={exp} />
              </div>

              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-400 rounded-full border-4 border-black" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};