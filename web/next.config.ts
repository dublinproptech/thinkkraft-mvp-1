import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@prisma/client", "pg"],
  allowedDevOrigins: ["192.168.1.2"],
};

export default nextConfig;