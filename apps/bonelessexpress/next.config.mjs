/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/bonelessexpress",
        destination: "/",
      },
      {
        source: "/vroombroom/backoffice/bonelessexpress",
        destination: "/",
      },
      {
        source: "/vroombroom/backoffice/bangus",
        destination: "/",
      },
      {
        source: "/bangus",
        destination: "/",
      },
    ];
  },
};

export default nextConfig;
