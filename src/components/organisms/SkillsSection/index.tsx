import React from "react";
import { Typography } from "@/components/atoms";
import { SkillCard } from "@/components/molecules";
import {
  FaCode,
  FaDatabase,
  FaReact,
  FaHtml5,
  FaCss3Alt,
  FaPhp,
  FaWordpress,
  FaJs,
} from "react-icons/fa";
import { Skill } from "@/types";

interface SkillsSectionProps {
  className?: string;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  className = "",
}) => {
  const skills: Skill[] = [
    { id: 1, name: "JavaScript", icon: <FaJs /> },
    { id: 2, name: "React.js", icon: <FaReact /> },
    { id: 3, name: "HTML5", icon: <FaHtml5 /> },
    { id: 4, name: "CSS3", icon: <FaCss3Alt /> },
    { id: 5, name: "PHP", icon: <FaPhp /> },
    { id: 6, name: "MySQL", icon: <FaDatabase /> },
    { id: 7, name: "WordPress", icon: <FaWordpress /> },
    { id: 8, name: "C++", icon: <FaCode /> },
  ];

  return (
    <section
      id="skills"
      className={`py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <Typography variant="overline" color="yellow" className="mb-2">
            02. Technologies
          </Typography>
          <Typography variant="h2" color="white" font="spaceGrotesk">
            Skills & Tools
          </Typography>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </div>
    </section>
  );
};