import React from "react";
import { Card, Icon, Typography } from "@/components/atoms";
import { Skill } from "@/types";

interface SkillCardProps {
  skill: Skill;
  className?: string;
}

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  className = "",
}) => {
  return (
    <Card
      className={`p-card-padding text-center hover:scale-hover-sm transition-all duration-300 cursor-pointer group relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-low">
        <div className="mb-gap-md flex justify-center">
          <div className="p-4 rounded-card bg-gray-800/50 group-hover:bg-gray-800 transition-colors duration-300">
            <Icon
              size="xl"
              color="yellow"
              hover={true}
            >
              {skill.icon}
            </Icon>
          </div>
        </div>

        <Typography
          variant="body"
          color="white"
          font="poppins"
          className="font-medium tracking-wide"
        >
          {skill.name}
        </Typography>
      </div>
    </Card>
  );
};