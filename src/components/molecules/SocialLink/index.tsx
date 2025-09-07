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
      className={`w-10 h-10 sm:w-12 sm:h-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gradient-to-r hover:from-brand-primary hover:to-brand-primary-dark hover:text-black hover:scale-hover-lg transition-all duration-300 text-caption ${className}`}
    >
      <Icon>{icon}</Icon>
    </a>
  );
};