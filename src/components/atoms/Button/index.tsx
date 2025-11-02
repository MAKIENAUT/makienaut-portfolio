import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  icon,
}) => {
  const baseClasses = "font-semibold rounded-button transition-all duration-300 flex items-center justify-center gap-gap-sm";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-brand-primary to-brand-primary-dark text-black hover:scale-hover-md",
    secondary: "bg-gray-800 text-white hover:bg-gray-700",
    outline: "border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-black",
  };
  
  const sizeClasses = {
    sm: "px-4 py-2 text-caption",
    md: "px-5 sm:px-6 py-2.5 sm:py-3 text-body-md",
    lg: "px-6 py-3 text-body-lg",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {icon && <span className="text-sm sm:text-base">{icon}</span>}
      {children}
    </button>
  );
};