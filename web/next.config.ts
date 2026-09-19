import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Next.js to accept Hot Module Replacement requests from your local network IP
  allowedDevOrigins: ["172.18.112.1", "localhost:3000"],
  
  // ... leave any other settings you already have in here alone
};

export default nextConfig;