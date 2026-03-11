"use client";

import React from "react";
import Image from "next/image";
import { Card, Typography, Badge, Icon } from "@/components/atoms";
import { FaExternalLinkAlt, FaLock, FaGithub } from "react-icons/fa";
import { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  className = "",
}) => {
  const [isExpandedMobile, setIsExpandedMobile] = React.useState(false);
  const collapsedDescriptionClasses =
    "max-h-[5.25rem] opacity-90 md:max-h-[5.25rem] md:group-hover:max-h-44 md:group-hover:opacity-100";

  const toggleDescription = () => {
    setIsExpandedMobile((prev) => !prev);
  };

  return (
    <Card className={`overflow-hidden group ${className}`}>
      <div className="h-40 sm:h-44 md:h-48 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      <div className="p-card-padding">
        <Typography
          variant="h3"
          color="white"
          font="spaceGrotesk"
          className="mb-gap-sm"
        >
          {project.title}
        </Typography>
        
        <div className="mb-gap-md">
          <div
            className={`overflow-hidden transition-all duration-500 ease-out ${
              isExpandedMobile ? "max-h-44 opacity-100" : collapsedDescriptionClasses
            }`}
          >
            <Typography
              variant="body"
              color="gray"
              font="poppins"
              className="pb-1 leading-relaxed"
            >
              {project.description}
            </Typography>
          </div>
          <button
            type="button"
            onClick={toggleDescription}
            className="mt-2 text-xs font-medium text-brand-primary transition-colors duration-300 hover:text-brand-primary-dark md:hidden"
            aria-expanded={isExpandedMobile}
            aria-label={`${isExpandedMobile ? "Collapse" : "Expand"} description for ${project.title}`}
          >
            {isExpandedMobile ? "Show less" : "Read more"}
          </button>
        </div>

        <div className="flex flex-wrap gap-gap-sm mb-gap-md">
          {project.tech.map((tech, index) => (
            <Badge key={index} variant="tech">
              {tech}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-gap-md text-caption">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary hover:text-brand-primary-dark transition-colors duration-300 flex items-center gap-gap-sm"
            >
              <Icon size="sm">
                <FaExternalLinkAlt />
              </Icon>
              Live Demo
            </a>
          )}
          {project.isPrivate ? (
            <span className="text-gray-500 flex items-center gap-gap-sm">
              <Icon size="sm" color="gray">
                <FaLock />
              </Icon>
              Private
            </span>
          ) : (
            <a
              href={project.githubUrl}
              className="text-brand-primary hover:text-brand-primary-dark transition-colors duration-300 flex items-center gap-gap-sm"
            >
              <Icon size="sm">
                <FaGithub />
              </Icon>
              GitHub
            </a>
          )}
        </div>
      </div>
    </Card>
  );
};
