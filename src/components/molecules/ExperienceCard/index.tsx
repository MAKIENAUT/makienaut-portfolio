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
    <Card className={`p-card-padding ${className}`}>
      <Typography
        variant="caption"
        color="yellow"
        className="mb-gap-sm"
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
        className="mb-gap-sm"
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