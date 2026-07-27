import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://orb-weaver.xyz"),
  title: {
    default: "VroomBroom | Independent Helmet Cleaning",
    template: "%s | VroomBroom",
  },
  description:
    "Book careful, appointment-based helmet cleaning with VroomBroom.",
  alternates: {
    canonical: "https://orb-weaver.xyz/vroombroom",
  },
  openGraph: {
    title: "VroomBroom | Independent Helmet Cleaning",
    description:
      "A simple, care-first helmet cleaning service for everyday riders.",
    url: "https://orb-weaver.xyz/vroombroom",
    siteName: "VroomBroom",
    type: "website",
    images: [
      {
        url: "/vroombroom-og.jpg",
        width: 1024,
        height: 1024,
        alt: "VroomBroom rider logo",
      },
    ],
  },
};

export default function OrbWeaverLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
