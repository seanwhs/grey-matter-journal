import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Allow Next.js Image component to serve Sanity CDN images
      { protocol: "https", hostname: "cdn.sanity.io" },
      // Allow Clerk user avatar images
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
};

export default nextConfig;
