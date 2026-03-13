import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "caremall-web.s3.ap-south-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;