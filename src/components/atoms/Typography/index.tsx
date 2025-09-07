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
    h1: "text-display-xl font-bold leading-tight",
    h2: "text-display-lg font-bold",
    h3: "text-heading-lg font-bold",
    h4: "text-heading-md font-semibold",
    body: "text-body-lg",
    caption: "text-caption",
    overline: "text-caption uppercase tracking-wider",
  };

  const colorClasses = {
    white: "text-white",
    gray: "text-gray-300",
    yellow: "text-brand-primary",
    gradient: "bg-gradient-to-r from-brand-primary to-brand-primary-dark bg-clip-text text-transparent",
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