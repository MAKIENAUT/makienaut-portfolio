import { Project, Experience, SocialLink } from "@/types";

export const projects: Project[] = [
  {
    id: 1,
    title: "West Migration Agency",
    description:
      "Led the delivery of a capstone-grade migration platform using Next.js, TypeScript, Express.js, PostgreSQL, and Docker while coordinating product requirements and operations support.",
    image: "/wma.png",
    tech: ["Next.js", "TypeScript", "Express.js", "PostgreSQL", "Docker"],
    liveUrl: "https://westmigrationagency.com",
    isPrivate: true,
  },
  {
    id: 2,
    title: "Athena Travel & Tours",
    description:
      "Designed and shipped a custom full-stack travel website for a Pangasinan-based agency, handling planning, interface design, and end-to-end implementation.",
    image: "/athena.png",
    tech: ["HTML", "CSS", "JavaScript", "PHP", "Figma"],
    liveUrl: "https://athenatraveltours.com",
    isPrivate: true,
  },
  {
    id: 3,
    title: "PHINMA-UPang Voting System",
    description:
      "Built an online voting platform for student council elections with real-time tallying, directory support, and a workflow suited for campus-wide usage.",
    image: "/upang.png",
    tech: ["JavaScript", "PHP", "MySQL", "Chart.js"],
    isPrivate: true,
  },
];

export const experiences: Experience[] = [
  {
    id: 1,
    date: "June 2024 - Present",
    title: "Mid-Level Full Stack Developer",
    company: "NTT Limited Philippines Branch",
    description:
      "Developing enterprise web solutions with React.js, Next.js, and Laravel while collaborating with cross-functional teams on scalable delivery and code quality.",
  },
  {
    id: 2,
    date: "June 2024 - October 2024",
    title: "UI/UX Manager | QA",
    company: "Upwork",
    description:
      "Managed design and QA workflows for client projects, including a WordPress revamp and a Next.js portfolio delivery deployed on Vercel.",
  },
  {
    id: 3,
    date: "December 2023 - March 2024",
    title: "Middleware / Front-End Developer Intern",
    company: "Boom Technologies Inc.",
    description:
      "Built middleware and front-end integrations for SwiftForm, an AI-powered form builder using Next.js, TypeScript, Python/Flask, and OpenAI services.",
  },
  {
    id: 4,
    date: "June 2022 - February 2025",
    title: "Project Manager / Full-Stack Developer",
    company: "West Migration Agency",
    description:
      "Led platform development and project operations across engineering, documentation, content, and workflow management using Notion and Monday.com.",
  },
  {
    id: 5,
    date: "August 2023 - September 2023",
    title: "Project Manager / Full-Stack Developer",
    company: "Athena Travels and Tours Agency",
    description:
      "Handled project planning, client communication, design, and development for a custom full-stack travel website built with HTML, CSS, JavaScript, and PHP.",
  },
];

// Skills will be defined in the component where icons are needed

// Social links will be defined in the component where icons are needed
