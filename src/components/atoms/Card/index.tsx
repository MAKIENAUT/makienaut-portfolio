import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hover = true,
  gradient = false,
}) => {
  const baseClasses = "rounded-lg sm:rounded-xl border transition-all duration-300";
  const backgroundClasses = gradient
    ? "bg-gradient-to-br from-gray-800 to-gray-900"
    : "bg-gray-900/50 backdrop-blur-sm";
  const borderClasses = "border-gray-800";
  const hoverClasses = hover
    ? "hover:scale-[1.02] hover:border-yellow-400/50"
    : "";

  return (
    <div
      className={`${baseClasses} ${backgroundClasses} ${borderClasses} ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
};