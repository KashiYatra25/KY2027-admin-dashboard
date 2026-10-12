import { RefreshTokenStrategy } from "wire-axon/auth";
import {
  adminTokenStorage,
  refreshAdminAccessToken,
} from "@/lib/auth/AdminSessionProvider";

// ═══════════════════════════════════════════════════════════════════
// BASE CONFIG
// ═══════════════════════════════════════════════════════════════════

// Base URL includes the API version prefix
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
export const BACKEND_URL = `${BASE_URL}/api/v1`;

// API timeout in milliseconds (7 seconds)
export const API_TIMEOUT = 7000;

// ═══════════════════════════════════════════════════════════════════
// ADMIN AUTH STRATEGY (RefreshTokenStrategy from wire-axon)
//
// This strategy:
// 1. Gets access token from localStorage and attaches to every request
// 2. On 401 (ADMIN_TOKEN_EXPIRED), automatically calls refresh endpoint
// 3. Queues concurrent requests during refresh
// 4. On refresh failure, clears tokens and redirects to login
// ═══════════════════════════════════════════════════════════════════

export const adminAuthStrategy = new RefreshTokenStrategy({
  // Get access token from localStorage
  getAccessToken: () => adminTokenStorage.getAccessToken(),

  // Refresh function - calls backend /admin/refresh-token
  // Uses HttpOnly cookie for refresh token
  refreshAccessTokenFunc: refreshAdminAccessToken,

  // On refresh failure - clear tokens and redirect to login
  onRefreshFailure: () => {
    adminTokenStorage.clearAccessToken();
    // Only redirect if in browser
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  // Token header configuration (defaults)
  tokenHeaderKey: "Authorization",
  tokenPrefix: "Bearer",
});

// ═══════════════════════════════════════════════════════════════════
// SHARED FEATURE CONFIG FOR wire-axon HOOKS
//
// Use this in useApiQuery, useApiMutation, etc.
// Example:
//   useApiQuery({
//     queryKey: ['admin-users'],
//     url: '/admin/users',
//     baseURL: BACKEND_URL,
//     featureConfig: sharedFeatureConfig,
//   })
// ═══════════════════════════════════════════════════════════════════

export const sharedFeatureConfig = {
  withCredentials: true, // Send HttpOnly refresh token cookie
  auth: adminAuthStrategy,
  timeout: API_TIMEOUT, // 7 second timeout for all requests
};
