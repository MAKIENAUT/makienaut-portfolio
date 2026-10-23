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
  const emailAddress = "mcrayescoto@gmail.com";
  const socialLinks: SocialLinkType[] = [
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

        <div className="mx-auto mb-6 flex w-full max-w-xl flex-col items-center rounded-card-lg border border-brand-primary/20 bg-gradient-to-b from-gray-900/70 to-black/40 p-5 shadow-glow-primary sm:mb-8 sm:p-6">
          <Typography variant="caption" color="gray" font="poppins">
            The quickest way to reach me
          </Typography>
          <a
            href={`mailto:${emailAddress}`}
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-button bg-gradient-to-r from-brand-primary to-brand-primary-dark px-6 py-3 font-semibold text-black transition-transform duration-300 hover:scale-hover-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black sm:w-auto"
          >
            <FaEnvelope aria-hidden="true" />
            <span>Email Mc Ray</span>
          </a>
          <a
            href={`mailto:${emailAddress}`}
            className="mt-2 inline-flex min-h-11 max-w-full select-all items-center px-2 text-body-md text-gray-300 underline decoration-gray-600 underline-offset-4 transition-colors hover:text-brand-primary focus-visible:rounded-element focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            {emailAddress}
          </a>
        </div>

        <div className="mx-auto mb-8 flex w-full max-w-4xl flex-col items-stretch justify-center gap-4 sm:mb-10 sm:flex-row sm:flex-wrap md:mb-12">
          <div className="rounded-card-lg border border-gray-800 bg-gray-900/45 p-4 backdrop-blur-sm">
            <Typography variant="caption" color="gray" className="mb-3">
              Find me online
            </Typography>
            <nav
              className="flex flex-wrap items-center justify-center gap-3"
              aria-label="Social profiles"
            >
              {socialLinks.map((social) => (
                <SocialLink
                  key={social.label}
                  href={social.href}
                  icon={social.icon}
                  label={social.label}
                />
              ))}
            </nav>
          </div>
          <div className="flex min-h-11 items-center gap-3 rounded-card-lg border border-gray-800 bg-gray-900/45 px-4 py-3 backdrop-blur-sm">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-brand-primary to-brand-primary-dark sm:h-12 sm:w-12">
              <Icon color="black">
                <FaMapMarkerAlt aria-hidden="true" />
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
