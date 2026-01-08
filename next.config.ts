import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/prappt", destination: "/prappt/", permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/prappt/", destination: "/prappt/index.html" },
      ],
    };
  },
};

export default nextConfig;
