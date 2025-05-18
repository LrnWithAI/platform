import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Avoid canvas native module
      config.externals.push({
        canvas: "commonjs canvas",
      });
    }
    return config;
  },
  images: {
    domains: [
      "jqzyiqnsulcfvylzxrbp.supabase.co",
      "images.unsplash.com",
      // Add any other external domains you use
    ],
  },
};

export default nextConfig;
