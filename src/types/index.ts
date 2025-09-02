export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  tech: string[];
  liveUrl?: string;
  githubUrl?: string;
  isPrivate?: boolean;
}

export interface Experience {
  id: number;
  date: string;
  title: string;
  company: string;
  description: string;
}

export interface Skill {
  id: number;
  name: string;
  icon: JSX.Element;
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
}

export interface SocialLink {
  icon: JSX.Element;
  href: string;
  label: string;
}