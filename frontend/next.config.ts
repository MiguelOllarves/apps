import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import path from "path";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: any = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  webpack: (config: any) => {
    config.watchOptions = {
      ignored: ['**/node_modules', '**/System Volume Information'],
    };
    return config;
  },
  allowedDevOrigins: ['10.100.5.199', 'localhost', '127.0.0.1'],
};

export default withPWA(nextConfig);
