import React from "react";
import { Typography } from "@/components/atoms";
import { ContactInfo, SocialLink } from "@/components/molecules";
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
    { icon: <FaGithub />, href: "https://github.com", label: "GitHub" },
    { icon: <FaLinkedinIn />, href: "https://linkedin.com", label: "LinkedIn" },
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
      <div className="max-w-4xl mx-auto text-center">
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
            I&apos;m always seeking new opportunities and exciting projects!
            Whether you have a question or just want to say hello, I&apos;ll do
            my best to get back to you!
          </Typography>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8 mb-8 sm:mb-10 md:mb-12">
          <ContactInfo
            icon={<FaEnvelope />}
            label="Email"
            value="mcrayescoto@gmail.com"
            href="mailto:mcrayescoto@gmail.com"
          />
          <ContactInfo
            icon={<FaMapMarkerAlt />}
            label="Location"
            value="Pangasinan, Philippines"
          />
        </div>

        <div className="flex justify-center gap-3 sm:gap-4">
          {socialLinks.map((social, index) => (
            <SocialLink
              key={index}
              href={social.href}
              icon={social.icon}
              label={social.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
};