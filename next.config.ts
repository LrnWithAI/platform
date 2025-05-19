import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.resolve.extensions.push(".mjs");
    return config;
  },
  images: {
    domains: [
      "jqzyiqnsulcfvylzxrbp.supabase.co",
      "images.unsplash.com",
    ],
  },
};

export default nextConfig;
