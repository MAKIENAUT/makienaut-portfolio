import React from "react";
import { Typography } from "@/components/atoms";
import { SkillCard } from "@/components/molecules";
import {
  FaDatabase,
  FaReact,
  FaWordpress,
  FaNodeJs,
  FaLaravel,
  FaPython,
  FaDocker,
} from "react-icons/fa";
import { SiNextdotjs, SiTailwindcss, SiTypescript, SiMysql } from "react-icons/si";
import { Skill } from "@/types";

interface SkillsSectionProps {
  className?: string;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  className = "",
}) => {
  const skills: Skill[] = [
    { id: 1, name: "React", icon: <FaReact /> },
    { id: 2, name: "Next.js", icon: <SiNextdotjs /> },
    { id: 3, name: "TypeScript", icon: <SiTypescript /> },
    { id: 4, name: "Tailwind CSS", icon: <SiTailwindcss /> },
    { id: 5, name: "Node.js", icon: <FaNodeJs /> },
    { id: 6, name: "Laravel", icon: <FaLaravel /> },
    { id: 7, name: "Python", icon: <FaPython /> },
    { id: 8, name: "MySQL", icon: <SiMysql /> },
    { id: 9, name: "Docker", icon: <FaDocker /> },
    { id: 10, name: "WordPress", icon: <FaWordpress /> },
  ];

  return (
    <section
      id="skills"
      className={`py-section-y px-section-x ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-gap-lg">
          <Typography variant="overline" color="yellow" className="mb-gap-sm">
            02. Technologies
          </Typography>
          <Typography variant="h2" color="white" font="spaceGrotesk">
            Skills & Tools
          </Typography>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-gap-md md:gap-gap-lg">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </div>
    </section>
  );
};