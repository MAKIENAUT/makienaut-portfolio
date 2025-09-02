import { Project, Experience, SocialLink } from "@/types";

export const projects: Project[] = [
  {
    id: 1,
    title: "West Migration Agency",
    description:
      "A modern website renovation for a US-based migration agency, featuring improved aesthetics and enhanced user experience for international job opportunities.",
    image: "/wma.png",
    tech: ["JavaScript", "PHP", "MySQL", "HTML/CSS"],
    liveUrl: "https://westmigrationagency.com",
    githubUrl: "#",
  },
  {
    id: 2,
    title: "Athena Travel & Tours",
    description:
      "Comprehensive travel agency website for booking flights and exploring Pangasinan's local scenery, with integrated booking system.",
    image: "/athena.png",
    tech: ["JavaScript", "PHP", "MySQL", "Bootstrap"],
    liveUrl: "https://athenatraveltours.com",
    githubUrl: "#",
  },
  {
    id: 3,
    title: "PHINMA-UPang Voting System",
    description:
      "Online voting platform commissioned by APEC for SSG and SSC council elections, featuring real-time tallying and student directory.",
    image: "/upang.png",
    tech: ["JavaScript", "PHP", "MySQL", "Chart.js"],
    isPrivate: true,
  },
];

export const experiences: Experience[] = [
  {
    id: 1,
    date: "August 2022 - Present",
    title: "Project Manager / Backend Developer",
    company: "West Migration Agency",
    description:
      "Led development team in creating and maintaining a comprehensive migration agency platform. Implemented backend solutions and managed project timelines.",
  },
  {
    id: 2,
    date: "September 2023 - October 2023",
    title: "Full Stack Developer",
    company: "Athena Travel & Tours",
    description:
      "Developed complete travel booking system with integrated payment processing and real-time availability checking.",
  },
  {
    id: 3,
    date: "2023 - Present",
    title: "Founder & Lead Developer",
    company: "Orb-Weaver",
    description:
      "Founded a start-up focused on helping emerging developers build their digital presence. Managing multiple client projects and mentoring junior developers.",
  },
];

// Skills will be defined in the component where icons are needed

// Social links will be defined in the component where icons are needed