import { Poppins, Space_Grotesk, Inter } from "next/font/google";

export const poppins = Poppins({
  weight: ["200", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const spaceGrotesk = Space_Grotesk({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const inter = Inter({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});