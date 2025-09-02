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
  const baseClasses = `${poppins.className} inline-flex items-center justify-center rounded-full font-medium`;
  
  const variantClasses = {
    tech: "px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-400/10 text-yellow-400 text-[10px] sm:text-xs border border-yellow-400/30",
    status: "px-2 py-0.5 bg-green-400/10 text-green-400 text-xs border border-green-400/30",
    default: "px-2 py-0.5 bg-gray-400/10 text-gray-400 text-xs border border-gray-400/30",
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};