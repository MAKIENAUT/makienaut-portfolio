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
      className={`p-4 sm:p-5 md:p-6 text-center hover:scale-105 cursor-pointer group ${className}`}
    >
      <div className="mb-2 sm:mb-3">
        <Icon
          size="xl"
          color="yellow"
          hover={true}
        >
          {skill.icon}
        </Icon>
      </div>
      <Typography
        variant="body"
        color="white"
        font="poppins"
        className="font-medium"
      >
        {skill.name}
      </Typography>
    </Card>
  );
};