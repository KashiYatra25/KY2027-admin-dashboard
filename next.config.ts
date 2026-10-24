import type { NextConfig } from "next";

// ═══════════════════════════════════════════════════════════════════
// KASHIYATRA ADMIN DASHBOARD - NEXT.JS CONFIG (VERCEL PRODUCTION)
// ═══════════════════════════════════════════════════════════════════

const nextConfig: NextConfig = {
  // ── Build & Output ────────────────────────────────────────────────
  // Standalone output for optimized Vercel deployment (smaller bundle)
  output: "standalone",

  // Strict mode for catching React issues early
  reactStrictMode: true,

  // ── Performance ───────────────────────────────────────────────────
  // Enable experimental optimizations
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "sonner",
    ],
  },

  // ── Images ────────────────────────────────────────────────────────
  images: {
    // Allow images from ImageKit CDN (used in map picker)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/bi3ktgt58/**",
      },
    ],
    // Modern formats for better compression
    formats: ["image/avif", "image/webp"],
  },

  // ── Security Headers ──────────────────────────────────────────────
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Control referrer information
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions policy - restrict browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // ── Redirects ─────────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirect /dashboard to root (main dashboard)
      {
        source: "/dashboard",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // ── TypeScript ────────────────────────────────────────────────────
  // In production builds, type errors should fail the build
  typescript: {
    // Set to true only if you want to skip type checking during build
    // (not recommended for production)
    ignoreBuildErrors: false,
  },

  // ── Logging ───────────────────────────────────────────────────────
  logging: {
    fetches: {
      // Log fetch requests in development for debugging
      fullUrl: process.env.NODE_ENV === "development",
    },
  },

  // ── Environment Variables ─────────────────────────────────────────
  // Expose specific env vars to the browser (NEXT_PUBLIC_ prefix)
  // These are validated at build time
  env: {
    // Build timestamp for cache busting / debugging
    BUILD_TIME: new Date().toISOString(),
  },
};

export default nextConfig;
