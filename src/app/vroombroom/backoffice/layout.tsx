import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Back-office",
  description: "Private business administration dashboard.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function OrbWeaverBackofficeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
