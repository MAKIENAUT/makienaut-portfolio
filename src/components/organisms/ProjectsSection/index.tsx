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
      className={`py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 bg-black/50 ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <Typography variant="overline" color="yellow" className="mb-2">
            03. Portfolio
          </Typography>
          <Typography variant="h2" color="white" font="spaceGrotesk">
            Featured Projects
          </Typography>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};