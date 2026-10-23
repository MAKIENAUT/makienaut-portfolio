import React from "react";
import { Typography } from "@/components/atoms";

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <footer
      className={`py-gap-md text-center border-t border-gray-800 px-section-x ${className}`}
    >
      <Typography variant="caption" color="gray" font="poppins">
        © {new Date().getFullYear()} Mc Ray Escoto. Built with Next.js and focused on clean web delivery.
      </Typography>
    </footer>
  );
};
