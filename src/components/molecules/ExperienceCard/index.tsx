import React from "react";
import { Card, Typography } from "@/components/atoms";
import { Experience } from "@/types";

interface ExperienceCardProps {
  experience: Experience;
  className?: string;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  className = "",
}) => {
  return (
    <Card hover={false} className={`p-card-padding text-left ${className}`}>
      <div className="mb-gap-sm flex flex-wrap items-center justify-between gap-2">
        <Typography variant="caption" color="yellow">
          {experience.date}
        </Typography>
        {experience.date.includes("Present") && (
          <span className="rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary">
            Current
          </span>
        )}
      </div>
      
      <Typography
        variant="h3"
        color="white"
        font="spaceGrotesk"
        className="mb-1"
      >
        {experience.title}
      </Typography>
      
      <Typography
        variant="body"
        color="gray"
        className="mb-gap-sm"
      >
        {experience.company}
      </Typography>
      
      <Typography
        variant="body"
        color="gray"
        font="poppins"
        className="text-body-md leading-relaxed"
      >
        {experience.description}
      </Typography>
    </Card>
  );
};
