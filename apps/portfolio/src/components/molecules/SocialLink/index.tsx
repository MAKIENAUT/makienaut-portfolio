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
  const isExternalLink = /^https?:\/\//.test(href);

  return (
    <a
      href={href}
      target={isExternalLink ? "_blank" : undefined}
      rel={isExternalLink ? "noopener noreferrer" : undefined}
      aria-label={isExternalLink ? `${label} (opens in a new tab)` : label}
      className={`group inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-gray-700 bg-gray-900/50 px-4 py-2 text-caption font-medium text-white backdrop-blur-sm transition-all duration-300 ease-out hover:border-brand-primary hover:bg-brand-primary hover:text-black focus-visible:border-brand-primary focus-visible:bg-brand-primary focus-visible:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black ${className}`}
    >
      <span aria-hidden="true">
        <Icon className="transition-colors duration-300 ease-out group-hover:text-black group-focus-visible:text-black">
          {icon}
        </Icon>
      </span>
      <span>{label}</span>
    </a>
  );
};
