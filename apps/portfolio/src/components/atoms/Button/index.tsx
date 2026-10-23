import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  href,
  target,
  rel,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  icon,
}) => {
  const baseClasses = "inline-flex min-h-11 items-center justify-center gap-gap-sm rounded-button font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black";
  
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

  const content = (
    <>
      {icon && <span aria-hidden="true" className="text-sm sm:text-base">{icon}</span>}
      {children}
    </>
  );

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {content}
    </button>
  );
};
