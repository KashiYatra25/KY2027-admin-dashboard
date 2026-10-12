"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import axios from "axios";
import { BACKEND_URL, API_TIMEOUT } from "@/lib/api/constants";

// ═══════════════════════════════════════════════════════════════════
// ADMIN SESSION PROVIDER
//
// Hybrid approach:
// - Access token stored in localStorage (for Authorization header)
// - Refresh token in HttpOnly cookie (secure, auto-sent)
// - Uses wire-axon RefreshTokenStrategy for auto-refresh on 401
//
// Flow:
// 1. On mount: Check if we have a valid session from backend
// 2. On login: Store access token in localStorage
// 3. On API calls: wire-axon attaches token from localStorage
// 4. On 401: wire-axon auto-refreshes using cookie
// 5. On refresh success: Update localStorage with new token
// 6. On refresh failure: Clear localStorage, redirect to login
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const ACCESS_TOKEN_KEY = "admin_access_token";

// ═══════════════════════════════════════════════════════════════════
// TOKEN STORAGE UTILITIES
// ═══════════════════════════════════════════════════════════════════

export const adminTokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  clearAccessToken: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};

// ═══════════════════════════════════════════════════════════════════
// REFRESH TOKEN FUNCTION (for wire-axon)
// ═══════════════════════════════════════════════════════════════════

export async function refreshAdminAccessToken(): Promise<{ accessToken: string }> {
  const response = await axios.post<{
    info: string;
    accessToken: string;
    accessTokenExpiry: number;
  }>(
    `${BACKEND_URL}/admin/refresh-token`,
    {},
    {
      withCredentials: true, // Send HttpOnly refresh token cookie
      timeout: API_TIMEOUT,
    }
  );

  const { accessToken } = response.data;

  // Store new access token in localStorage
  adminTokenStorage.setAccessToken(accessToken);

  return { accessToken };
}

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export type RoleLevel = "MASTER_ADMIN" | "MANAGER" | "OPERATOR";

export interface AdminSession {
  email: string;
  role: RoleLevel;
  firstName?: string | null;
  googleAvatarUrl?: string | null;
}

type SessionStatus = "loading" | "authenticated" | "expired" | "no-access";

interface AdminSessionContextType {
  /** Current session data (null if not authenticated or expired) */
  session: AdminSession | null;
  /** Whether user exists (had JWT before) */
  userExists: boolean;
  /** Session status for UI rendering */
  status: SessionStatus;
  /** Convenience booleans */
  isAuthenticated: boolean;
  isLoading: boolean;
  isExpired: boolean;
  hasNoAccess: boolean;
  /** Manually refresh session from server */
  refreshSession: () => Promise<void>;
  /** Clear session (for logout) */
  clearSession: () => void;
  /** Set session after successful login (stores access token) */
  setSession: (session: AdminSession, accessToken: string) => void;
}

// ═══════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════

const AdminSessionContext = createContext<AdminSessionContextType | undefined>(
  undefined
);

// ═══════════════════════════════════════════════════════════════════
// API RESPONSE TYPE
// ═══════════════════════════════════════════════════════════════════

interface SessionResponse {
  info: string;
  session: AdminSession | null;
  userExists: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// API FUNCTION
// ═══════════════════════════════════════════════════════════════════

async function fetchSession(): Promise<{
  session: AdminSession | null;
  userExists: boolean;
}> {
  try {
    const response = await axios.get<SessionResponse>(
      `${BACKEND_URL}/admin/get-session`,
      {
        withCredentials: true, // Send HttpOnly cookie
        timeout: API_TIMEOUT,
      }
    );
    return {
      session: response.data.session,
      userExists: response.data.userExists,
    };
  } catch {
    // Network error or server error - treat as no access
    return { session: null, userExists: false };
  }
}

// ═══════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════

interface AdminSessionProviderProps {
  children: ReactNode;
}

export function AdminSessionProvider({ children }: AdminSessionProviderProps) {
  const [session, setSessionState] = useState<AdminSession | null>(null);
  const [userExists, setUserExists] = useState<boolean>(false);
  const [status, setStatus] = useState<SessionStatus>("loading");
  
  // Guard to prevent double initialization (React 18 Strict Mode / dev double-render)
  const isInitialized = useRef(false);

  // ─────────────────────────────────────────────────────────────────
  // Fetch session from server
  // ─────────────────────────────────────────────────────────────────
  const refreshSession = useCallback(async () => {
    setStatus("loading");
    const result = await fetchSession();

    setSessionState(result.session);
    setUserExists(result.userExists);

    if (result.session) {
      // Valid session
      setStatus("authenticated");
    } else if (result.userExists) {
      // User exists but session expired
      setStatus("expired");
    } else {
      // No JWT ever existed or user is not admin
      setStatus("no-access");
      // Clear any stale access token
      adminTokenStorage.clearAccessToken();
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // Clear session (for logout)
  // ─────────────────────────────────────────────────────────────────
  const clearSession = useCallback(() => {
    setSessionState(null);
    setUserExists(false);
    setStatus("no-access");
    adminTokenStorage.clearAccessToken();
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // Set session (after login - stores access token in localStorage)
  // ─────────────────────────────────────────────────────────────────
  const setSession = useCallback(
    (newSession: AdminSession, accessToken: string) => {
      // Store access token in localStorage
      adminTokenStorage.setAccessToken(accessToken);

      setSessionState(newSession);
      setUserExists(true);
      setStatus("authenticated");
    },
    []
  );

  // ─────────────────────────────────────────────────────────────────
  // On mount: Fetch session from server (with initialization guard)
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Skip if already initialized (prevents double request in Strict Mode)
    if (isInitialized.current) {
      return;
    }
    isInitialized.current = true;
    
    refreshSession();
  }, [refreshSession]);

  return (
    <AdminSessionContext.Provider
      value={{
        session,
        userExists,
        status,
        isAuthenticated: status === "authenticated",
        isLoading: status === "loading",
        isExpired: status === "expired",
        hasNoAccess: status === "no-access",
        refreshSession,
        clearSession,
        setSession,
      }}
    >
      {children}
    </AdminSessionContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════

export function useAdminSession() {
  const context = useContext(AdminSessionContext);
  if (context === undefined) {
    throw new Error(
      "useAdminSession must be used within an AdminSessionProvider"
    );
  }
  return context;
}
