import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    // @ts-expect-error - turbopack.rootは型定義にまだ含まれていないが、Next.js 16でサポートされている
    turbopack: {
      root: path.resolve(__dirname),
    },
  },
};

export default nextConfig;
