import React from "react";
import { Icon, Typography } from "@/components/atoms";
import { SocialLink } from "@/components/molecules";
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaGithub,
  FaLinkedinIn,
  FaFacebookMessenger,
} from "react-icons/fa";
import { SocialLink as SocialLinkType } from "@/types";

interface ContactSectionProps {
  className?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  className = "",
}) => {
  const socialLinks: SocialLinkType[] = [
    {
      icon: <FaEnvelope />,
      href: "mailto:mcrayescoto@gmail.com",
      label: "Email",
    },
    { icon: <FaGithub />, href: "https://github.com/makienaut", label: "GitHub" },
    { icon: <FaLinkedinIn />, href: "https://linkedin.com/in/makienaut", label: "LinkedIn" },
    {
      icon: <FaFacebookMessenger />,
      href: "https://m.me/mcray.escoto",
      label: "Messenger",
    },
  ];

  return (
    <section
      id="contact"
      className={`py-section-y px-section-x bg-black/50 ${className}`}
    >
      <div className="max-w-5xl mx-auto text-center">
        <div className="mb-gap-lg">
          <Typography variant="overline" color="yellow" className="mb-2">
            05. What&apos;s Next?
          </Typography>
          <Typography
            variant="h2"
            color="white"
            font="spaceGrotesk"
            className="mb-gap-md"
          >
            Get In Touch
          </Typography>
          <Typography
            variant="body"
            color="gray"
            font="poppins"
            className="max-w-2xl mx-auto"
          >
            If you need a developer who can handle implementation, communicate clearly,
            and move a project forward without much friction, send me a message.
            I&apos;m open to full-time roles, part-time roles, contract work, and freelance builds.
          </Typography>
        </div>

        <div className="mx-auto mb-8 flex w-full max-w-4xl flex-wrap items-center justify-center gap-4 sm:mb-10 md:mb-12">
          <div className="flex items-center justify-center gap-3 rounded-full border border-gray-800 bg-gray-900/45 px-3 py-2 backdrop-blur-sm sm:gap-4">
            {socialLinks.map((social, index) => (
              <SocialLink
                key={index}
                href={social.href}
                icon={social.icon}
                label={social.label}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-full border border-gray-800 bg-gray-900/45 px-4 py-2 backdrop-blur-sm">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-brand-primary to-brand-primary-dark sm:h-12 sm:w-12">
              <Icon color="black">
                <FaMapMarkerAlt />
              </Icon>
            </div>
            <div className="text-left">
              <Typography variant="caption" color="gray">
                Location
              </Typography>
              <Typography variant="body" color="white" className="sm:whitespace-nowrap">
                Pasig City, Metro Manila
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
