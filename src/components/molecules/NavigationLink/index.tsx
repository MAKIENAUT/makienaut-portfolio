import React from "react";
import { Typography } from "@/components/atoms";
import { poppins } from "@/styles/fonts";

interface NavigationLinkProps {
  href: string;
  label: string;
  isActive: boolean;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
  className?: string;
}

export const NavigationLink: React.FC<NavigationLinkProps> = ({
  href,
  label,
  isActive,
  onClick,
  className = "",
}) => {
  return (
    <a
      href={href}
      onClick={(e) => onClick(e, href)}
      className={`${poppins.className} relative font-medium transition-colors duration-300 ${
        isActive ? "text-yellow-400" : "text-white hover:text-yellow-400"
      } ${className}`}
    >
      {label}
      {isActive && (
        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500" />
      )}
    </a>
  );
};