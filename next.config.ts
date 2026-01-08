import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/prappt", destination: "/prappt/index.html" },
        { source: "/prappt/", destination: "/prappt/index.html" },
      ],
    };
  },
};

export default nextConfig;
