import React from "react";
import { poppins, spaceGrotesk } from "@/styles/fonts";

interface TypographyProps {
  children: React.ReactNode;
  variant?: "h1" | "h2" | "h3" | "h4" | "body" | "caption" | "overline";
  color?: "white" | "gray" | "yellow" | "gradient";
  className?: string;
  font?: "poppins" | "spaceGrotesk" | "inherit";
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = "body",
  color = "white",
  className = "",
  font = "inherit",
}) => {
  const fontClasses = {
    poppins: poppins.className,
    spaceGrotesk: spaceGrotesk.className,
    inherit: "",
  };

  const variantClasses = {
    h1: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight",
    h2: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold",
    h3: "text-lg sm:text-xl md:text-2xl font-bold",
    h4: "text-base sm:text-lg font-semibold",
    body: "text-sm sm:text-base",
    caption: "text-xs sm:text-sm",
    overline: "text-xs sm:text-sm uppercase tracking-wider",
  };

  const colorClasses = {
    white: "text-white",
    gray: "text-gray-300",
    yellow: "text-yellow-400",
    gradient: "bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent",
  };

  const Component = variant.startsWith("h") ? variant : "p";

  return React.createElement(
    Component,
    {
      className: `${fontClasses[font]} ${variantClasses[variant]} ${colorClasses[color]} ${className}`,
    },
    children
  );
};