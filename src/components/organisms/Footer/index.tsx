import React from "react";
import { Typography } from "@/components/atoms";

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <footer
      className={`py-6 sm:py-8 text-center border-t border-gray-800 px-4 ${className}`}
    >
      <Typography variant="caption" color="gray" font="poppins">
        © {new Date().getFullYear()} Built with 💛 by{" "}
        <span className="text-yellow-400">Mc Ray Escoto</span> | Orb-Weaver
      </Typography>
    </footer>
  );
};