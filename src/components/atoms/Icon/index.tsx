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
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
  };

  const colorClasses = {
    white: "text-white",
    yellow: "text-yellow-400",
    orange: "text-orange-500",
    gray: "text-gray-400",
    black: "text-black",
  };

  const hoverClasses = hover
    ? "group-hover:text-orange-500 transition-colors"
    : "";

  return (
    <span
      className={`${sizeClasses[size]} ${colorClasses[color]} ${hoverClasses} ${className}`}
    >
      {children}
    </span>
  );
};