/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep development artifacts separate from production builds. This prevents
  // an active `next dev` process from reading a partially rewritten `.next`
  // directory when `next build` runs in another terminal.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

export default nextConfig;
