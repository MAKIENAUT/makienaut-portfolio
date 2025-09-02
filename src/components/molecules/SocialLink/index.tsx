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
      className={`w-10 h-10 sm:w-12 sm:h-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-500 hover:text-black hover:scale-110 transition-all duration-300 text-sm sm:text-base ${className}`}
    >
      <Icon>{icon}</Icon>
    </a>
  );
};