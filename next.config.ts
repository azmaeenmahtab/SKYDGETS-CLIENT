import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**", // Matches any domain or subdomain
      },
      {
        protocol: "https",
        hostname: "**", // Matches any domain or subdomain
      },
    ],
  },
};

export default nextConfig;