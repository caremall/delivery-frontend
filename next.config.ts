import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",   // 👈 REQUIRED for S3 static hosting

  images: {
    unoptimized: true,   // 👈 required when using static export
    remotePatterns: [
      {
        protocol: "https",
        hostname: "caremall-web.s3.ap-south-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;