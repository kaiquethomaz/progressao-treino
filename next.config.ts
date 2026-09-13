import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera um build "standalone" (auto-contido) — ideal para imagens Docker enxutas.
  output: "standalone",
};

export default nextConfig;
