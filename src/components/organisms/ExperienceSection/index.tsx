import React from "react";
import { Typography } from "@/components/atoms";
import { ExperienceCard } from "@/components/molecules";
import { experiences } from "@/data/portfolio";

interface ExperienceSectionProps {
  className?: string;
}

const getExperienceEndDate = (dateRange: string) => {
  const endDate = dateRange.split(" - ")[1];

  if (endDate === "Present") {
    return Number.POSITIVE_INFINITY;
  }

  return endDate ? Date.parse(`1 ${endDate}`) : 0;
};

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  className = "",
}) => {
  const orderedExperiences = [...experiences].sort(
    (a, b) => getExperienceEndDate(b.date) - getExperienceEndDate(a.date)
  );

  return (
    <section
      id="experience"
      className={`py-section-y px-section-x ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-gap-lg">
          <Typography variant="overline" color="yellow" className="mb-2">
            02. Experience
          </Typography>
          <Typography variant="h2" color="white" font="spaceGrotesk">
            Experience
          </Typography>
          <Typography
            variant="body"
            color="gray"
            font="poppins"
            className="mx-auto mt-4 max-w-2xl leading-relaxed"
          >
            My path combines enterprise work, internships, freelance delivery, and project leadership.
            That mix made me comfortable owning both implementation details and delivery outcomes.
          </Typography>
        </div>

        <ol className="relative mx-auto max-w-4xl space-y-5 before:absolute before:bottom-4 before:left-[0.4375rem] before:top-4 before:w-px before:bg-gradient-to-b before:from-brand-primary before:via-brand-primary/60 before:to-brand-primary/10 sm:before:left-[0.6875rem]">
          {orderedExperiences.map((exp) => (
            <li key={exp.id} className="relative pl-8 sm:pl-12">
              <span
                aria-hidden="true"
                className="absolute left-0 top-7 z-low h-3.5 w-3.5 rounded-full border-[3px] border-black bg-brand-primary shadow-[0_0_0_4px_rgba(255,215,0,0.12)] sm:left-1"
              />
              <ExperienceCard experience={exp} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
