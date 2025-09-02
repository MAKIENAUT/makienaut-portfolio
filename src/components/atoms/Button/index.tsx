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
  const baseClasses = "font-semibold rounded-full transition-all duration-300 flex items-center justify-center gap-2";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-105",
    secondary: "bg-gray-800 text-white hover:bg-gray-700",
    outline: "border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black",
  };
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base",
    lg: "px-6 py-3 text-base",
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