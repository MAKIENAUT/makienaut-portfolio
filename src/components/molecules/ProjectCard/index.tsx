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

      <div className="p-4 sm:p-5 md:p-6">
        <Typography
          variant="h3"
          color="white"
          font="spaceGrotesk"
          className="mb-2 sm:mb-3"
        >
          {project.title}
        </Typography>
        
        <Typography
          variant="body"
          color="gray"
          font="poppins"
          className="mb-3 sm:mb-4 line-clamp-3"
        >
          {project.description}
        </Typography>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {project.tech.map((tech, index) => (
            <Badge key={index} variant="tech">
              {tech}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-orange-500 transition-colors flex items-center gap-1.5"
            >
              <Icon size="sm">
                <FaExternalLinkAlt />
              </Icon>
              Live Demo
            </a>
          )}
          {project.isPrivate ? (
            <span className="text-gray-500 flex items-center gap-1.5">
              <Icon size="sm" color="gray">
                <FaLock />
              </Icon>
              Private
            </span>
          ) : (
            <a
              href={project.githubUrl}
              className="text-yellow-400 hover:text-orange-500 transition-colors flex items-center gap-1.5"
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