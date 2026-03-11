import React from "react";
import { Icon } from "@/components/atoms";

interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export const SocialLink: React.FC<SocialLinkProps> = ({
  href,
  icon,
  label,
  className = "",
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`group flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 bg-gray-900/50 text-white backdrop-blur-sm transition-all duration-500 ease-out hover:scale-hover-lg hover:bg-gradient-to-r hover:from-brand-primary hover:to-brand-primary-dark sm:h-12 sm:w-12 text-caption ${className}`}
    >
      <Icon className="transition-colors duration-500 ease-out group-hover:text-black">
        {icon}
      </Icon>
    </a>
  );
};
