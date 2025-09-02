import React from "react";
import { Icon, Typography } from "@/components/atoms";

interface ContactInfoProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  className?: string;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({
  icon,
  label,
  value,
  href,
  className = "",
}) => {
  const content = (
    <>
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
        <Icon color="black">{icon}</Icon>
      </div>
      <div className="text-left">
        <Typography variant="caption" color="gray">
          {label}
        </Typography>
        <Typography
          variant="body"
          color={href ? "yellow" : "white"}
          className={href ? "hover:underline break-all" : ""}
        >
          {value}
        </Typography>
      </div>
    </>
  );

  const baseClasses = `flex items-center gap-3 sm:gap-4 ${className}`;

  return href ? (
    <a href={href} className={baseClasses}>
      {content}
    </a>
  ) : (
    <div className={baseClasses}>
      {content}
    </div>
  );
};