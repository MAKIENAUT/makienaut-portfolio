import React from "react";

interface IconProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "white" | "yellow" | "orange" | "gray" | "black";
  className?: string;
  hover?: boolean;
}

export const Icon: React.FC<IconProps> = ({
  children,
  size = "md",
  color = "white",
  className = "",
  hover = false,
}) => {
  const sizeClasses = {
    sm: "text-caption",
    md: "text-body-lg",
    lg: "text-heading-md",
    xl: "text-display-md",
  };

  const colorClasses = {
    white: "text-white",
    yellow: "text-brand-primary",
    orange: "text-brand-primary-dark",
    gray: "text-gray-400",
    black: "text-black",
  };

  const hoverClasses = hover
    ? "group-hover:text-brand-primary-dark transition-colors duration-300"
    : "";

  return (
    <span
      className={`${sizeClasses[size]} ${colorClasses[color]} ${hoverClasses} ${className}`}
    >
      {children}
    </span>
  );
};