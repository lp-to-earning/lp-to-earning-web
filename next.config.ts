import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBaseUrl = (process.env.BOT_API_URL || "").replace(/\/$/, "");
    if (!apiBaseUrl) return [];
    // BOT_API_URL 예: http://host:3001/api → /api/config → .../api/config (이중 /api 방지)
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
