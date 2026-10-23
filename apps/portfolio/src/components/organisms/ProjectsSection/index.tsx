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
            01. Selected Work
          </Typography>
          <Typography variant="h2" color="white" font="spaceGrotesk">
            Featured Projects
          </Typography>
          <Typography
            variant="body"
            color="gray"
            font="poppins"
            className="mx-auto mt-4 max-w-2xl leading-relaxed"
          >
            Selected client and academic projects, with the responsibilities and
            technology behind each delivery.
          </Typography>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-gap-lg lg:grid-cols-2">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              featured={index === 0}
              className={index === 0 ? "lg:col-span-2" : ""}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
