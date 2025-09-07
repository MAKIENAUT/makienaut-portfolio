import React from "react";
import { poppins } from "@/styles/fonts";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "tech" | "status" | "default";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
}) => {
  const baseClasses = `${poppins.className} inline-flex items-center justify-center rounded-element font-medium transition-all duration-300`;
  
  const variantClasses = {
    tech: "px-2 sm:px-3 py-0.5 sm:py-1 bg-brand-primary/10 text-brand-primary text-caption border border-brand-primary/30 hover:bg-brand-primary/20",
    status: "px-2 py-0.5 bg-green-400/10 text-green-400 text-caption border border-green-400/30 hover:bg-green-400/20",
    default: "px-2 py-0.5 bg-gray-400/10 text-gray-400 text-caption border border-gray-400/30 hover:bg-gray-400/20",
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};