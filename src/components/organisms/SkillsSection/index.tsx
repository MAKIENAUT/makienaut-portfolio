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
  FaNodeJs,
  FaLaravel,
  FaPython,
  FaDocker,
} from "react-icons/fa";
import { SiNextdotjs, SiTailwindcss, SiTypescript } from "react-icons/si";
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
    { id: 3, name: "Next.js", icon: <SiNextdotjs /> },
    { id: 4, name: "TypeScript", icon: <SiTypescript /> },
    { id: 5, name: "HTML5", icon: <FaHtml5 /> },
    { id: 6, name: "CSS3", icon: <FaCss3Alt /> },
    { id: 7, name: "Tailwind", icon: <SiTailwindcss /> },
    { id: 8, name: "PHP", icon: <FaPhp /> },
    { id: 9, name: "MySQL", icon: <FaDatabase /> },
    { id: 10, name: "WordPress", icon: <FaWordpress /> },
    { id: 11, name: "C++", icon: <FaCode /> },
  ];

  const learningSkills: Skill[] = [
    { id: 1, name: "Laravel", icon: <FaLaravel /> },
    { id: 2, name: "Node.js", icon: <FaNodeJs /> },
    { id: 3, name: "Python", icon: <FaPython /> },
    { id: 4, name: "Docker", icon: <FaDocker /> },
  ];

  return (
    <section
      id="skills"
      className={`py-section-y px-section-x ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-gap-lg">
          <Typography variant="overline" color="yellow" className="mb-2">
            02. Technologies
          </Typography>
          <Typography variant="h2" color="white" font="spaceGrotesk">
            Skills & Tools
          </Typography>
        </div>

        {/* Proficient Skills */}
        <div className="mb-16">
          <Typography variant="h3" color="white" className="mb-8 text-center">
            Proficient
          </Typography>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-gap-md">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>

        {/* Learning Progress */}
        <div>
          <Typography variant="h3" color="white" className="mb-8 text-center">
            Currently Learning
          </Typography>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-gap-md">
            {learningSkills.map((skill) => (
              <SkillCard 
                key={`learning-${skill.id}`} 
                skill={skill} 
                isLearning={true}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};