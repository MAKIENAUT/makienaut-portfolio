import React from "react";
import { Typography } from "@/components/atoms";
import { ProjectCard } from "@/components/molecules";
import { projects } from "@/data/portfolio";

interface ProjectsSectionProps {
  className?: string;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  className = "",
}) => {
  return (
    <section
      id="projects"
      className={`py-section-y px-section-x bg-black/50 ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-gap-lg">
          <Typography variant="overline" color="yellow" className="mb-2">
            03. Portfolio
          </Typography>
          <Typography variant="h2" color="white" font="spaceGrotesk">
            Featured Projects
          </Typography>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gap-md">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};