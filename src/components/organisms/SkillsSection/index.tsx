import React from "react";
import { Card, Typography, Badge } from "@/components/atoms";
import {
  FaAws,
  FaDatabase,
  FaFigma,
  FaGitAlt,
  FaReact,
  FaWordpress,
  FaLaravel,
  FaDocker,
  FaPhp,
} from "react-icons/fa";
import {
  SiCloudflare,
  SiExpress,
  SiGo,
  SiJavascript,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNotion,
  SiPostgresql,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from "react-icons/si";

interface SkillsSectionProps {
  className?: string;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  className = "",
}) => {
  const skillGroups = [
    {
      title: "Front End",
      description: "Production UI work with modern React-based stacks.",
      items: [
        { name: "React.js", icon: <FaReact /> },
        { name: "Next.js", icon: <SiNextdotjs /> },
        { name: "TypeScript", icon: <SiTypescript /> },
        { name: "JavaScript", icon: <SiJavascript /> },
        { name: "Tailwind CSS", icon: <SiTailwindcss /> },
      ],
    },
    {
      title: "Back End",
      description: "Practical APIs, business logic, and full-stack application support.",
      items: [
        { name: "Laravel", icon: <FaLaravel /> },
        { name: "Express.js", icon: <SiExpress /> },
        { name: "PHP", icon: <FaPhp /> },
        { name: "SQL", icon: <FaDatabase /> },
        { name: "Go", icon: <SiGo /> },
      ],
    },
    {
      title: "Data and Delivery",
      description: "Deployment-aware workflow across infrastructure and databases.",
      items: [
        { name: "MySQL", icon: <SiMysql /> },
        { name: "PostgreSQL", icon: <SiPostgresql /> },
        { name: "MongoDB", icon: <SiMongodb /> },
        { name: "Docker", icon: <FaDocker /> },
        { name: "Vercel", icon: <SiVercel /> },
        { name: "AWS", icon: <FaAws /> },
        { name: "Cloudflare", icon: <SiCloudflare /> },
        { name: "Git", icon: <FaGitAlt /> },
      ],
    },
    {
      title: "Design and Ops",
      description: "Tools I use to keep delivery organized and client-ready.",
      items: [
        { name: "Figma", icon: <FaFigma /> },
        { name: "WordPress", icon: <FaWordpress /> },
        { name: "Notion", icon: <SiNotion /> },
        { name: "Monday.com", icon: <FaDatabase /> },
      ],
    },
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
          <Typography
            variant="body"
            color="gray"
            font="poppins"
            className="mx-auto mt-4 max-w-2xl leading-relaxed"
          >
            These are the technologies and workflows I use most often across enterprise delivery,
            freelance builds, and full-stack product work.
          </Typography>
        </div>

        <div className="grid gap-gap-md lg:grid-cols-2">
          {skillGroups.map((group) => (
            <Card key={group.title} className="p-card-padding">
              <Typography variant="h3" color="white" font="spaceGrotesk" className="mb-2">
                {group.title}
              </Typography>
              <Typography
                variant="caption"
                color="gray"
                font="poppins"
                className="mb-4 block leading-relaxed"
              >
                {group.description}
              </Typography>
              <div className="flex flex-wrap gap-3">
                {group.items.map((item) => (
                  <Badge
                    key={item.name}
                    variant="tech"
                    className="gap-2 px-3 py-2 text-body-sm bg-white/5 text-gray-100 border-white/10 hover:bg-white/10"
                  >
                    <span className="text-brand-primary">{item.icon}</span>
                    {item.name}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
