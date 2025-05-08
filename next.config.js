/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  async rewrites() {
    return [
      {
        source: "/users/",
        destination: "/users", // treat both the same without redirect
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.skycards.oldapes.com",
      },
      {
        protocol: "https",
        hostname: "yq6gb3kpv5.ufs.sh",
      },
    ],
  },
};

export default config;
