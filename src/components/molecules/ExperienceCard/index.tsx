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
    <Card className={`p-4 sm:p-5 md:p-6 ${className}`}>
      <Typography
        variant="caption"
        color="yellow"
        className="mb-1.5 sm:mb-2"
      >
        {experience.date}
      </Typography>
      
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
        className="mb-2 sm:mb-3"
      >
        {experience.company}
      </Typography>
      
      <Typography
        variant="caption"
        color="gray"
        font="poppins"
        className="leading-relaxed"
      >
        {experience.description}
      </Typography>
    </Card>
  );
};