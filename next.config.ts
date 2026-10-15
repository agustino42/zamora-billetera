import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      // Dependencias opcionales de @coinbase/cdp-sdk usadas por thirdweb.
      // No usamos x402 payments, así que las neutralizamos para el bundle.
      "@x402": false,
    };
    return config;
  },
};

export default nextConfig;
