import React from "react";
import Image from "next/image";
import { Card, Typography, Badge, Icon } from "@/components/atoms";
import { FaExternalLinkAlt, FaLock, FaGithub } from "react-icons/fa";
import { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  className?: string;
  featured?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  className = "",
  featured = false,
}) => {
  const projectNumber = String(project.id).padStart(2, "0");
  const externalLinkClasses =
    "inline-flex min-h-11 items-center justify-center gap-gap-sm rounded-button border border-brand-primary bg-brand-primary px-4 py-2 text-caption font-semibold text-black transition-colors duration-300 hover:border-brand-primary-dark hover:bg-brand-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900";
  const sourceLinkClasses =
    "inline-flex min-h-11 items-center justify-center gap-gap-sm rounded-button border border-brand-primary/50 px-4 py-2 text-caption font-semibold text-brand-primary transition-colors duration-300 hover:border-brand-primary hover:bg-brand-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900";

  return (
    <article className={`h-full ${className}`}>
      <Card
        hover={false}
        className={`group h-full overflow-hidden shadow-elevation-medium hover:border-brand-primary/50 ${
          featured
            ? "flex flex-col lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
            : "flex flex-col"
        }`}
      >
        <div
          className={`relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 ${
            featured
              ? "aspect-[16/10] lg:aspect-auto lg:min-h-[26rem]"
              : "aspect-[16/10]"
          }`}
        >
          <Image
            src={project.image}
            alt={`${project.title} project interface preview`}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
            sizes="(max-width: 1023px) calc(100vw - 2rem), 576px"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
            aria-hidden="true"
          />
        </div>

        <div className="flex flex-1 flex-col p-card-padding">
          <div className="mb-gap-sm flex flex-wrap items-center justify-between gap-gap-sm">
            <Typography variant="overline" color="yellow">
              Project {projectNumber}
            </Typography>
            {featured && (
              <span className="rounded-element border border-brand-primary/40 bg-brand-primary/10 px-2.5 py-1 text-caption font-medium text-brand-primary">
                Featured project
              </span>
            )}
          </div>

          <Typography
            variant="h3"
            color="white"
            font="spaceGrotesk"
            className={`mb-gap-sm ${featured ? "lg:text-display-md" : ""}`}
          >
            {project.title}
          </Typography>

          <Typography
            variant="body"
            color="gray"
            font="poppins"
            className="mb-gap-md text-body-md leading-relaxed"
          >
            {project.description}
          </Typography>

          <ul
            className="mb-gap-lg flex flex-wrap gap-gap-sm"
            aria-label={`Technologies used for ${project.title}`}
          >
            {project.tech.map((tech) => (
              <li key={tech}>
                <Badge variant="tech">{tech}</Badge>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-wrap items-center gap-gap-sm border-t border-gray-800 pt-gap-md">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={externalLinkClasses}
              >
                View live project
                <span className="sr-only"> for {project.title}</span>
                <Icon size="sm" color="black">
                  <FaExternalLinkAlt aria-hidden="true" />
                </Icon>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}

            {project.isPrivate ? (
              <span className="inline-flex min-h-11 items-center gap-gap-sm rounded-button border border-gray-700 px-3 py-2 text-caption text-gray-300">
                <Icon size="sm" color="gray">
                  <FaLock aria-hidden="true" />
                </Icon>
                Source code private
              </span>
            ) : (
              project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={sourceLinkClasses}
                >
                  <Icon size="sm">
                    <FaGithub aria-hidden="true" />
                  </Icon>
                  View source
                  <span className="sr-only"> for {project.title}</span>
                  <FaExternalLinkAlt
                    className="text-[0.65rem]"
                    aria-hidden="true"
                  />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )
            )}
          </div>
        </div>
      </Card>
    </article>
  );
};
