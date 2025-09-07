import React from "react";
import { Card, Icon, Typography } from "@/components/atoms";
import { Skill } from "@/types";

interface SkillCardProps {
  skill: Skill;
  className?: string;
  isLearning?: boolean;
}

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  className = "",
  isLearning = false,
}) => {
  return (
    <Card
      className={`p-card-padding text-center hover:scale-hover-md cursor-pointer group relative ${
        isLearning ? 'border-brand-secondary/30' : ''
      } ${className}`}
    >
      {isLearning && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-brand-secondary text-black px-2 py-1 rounded-full text-xs font-semibold">
            Learning
          </div>
        </div>
      )}
      <div className="mb-gap-sm">
        <Icon
          size="xl"
          color={isLearning ? "cyan" : "yellow"}
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
      {isLearning && (
        <div className="mt-2">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-brand-secondary to-brand-tertiary h-2 rounded-full animate-pulse"
              style={{
                width: `${Math.floor(Math.random() * 40) + 30}%`
              }}
            ></div>
          </div>
        </div>
      )}
    </Card>
  );
};