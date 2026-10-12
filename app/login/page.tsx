"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAdminSession } from "@/lib/auth";
import { BACKEND_URL, API_TIMEOUT } from "@/lib/api/constants";
import { toast } from "sonner";
import { SuccessToast, ErrorToast } from "@/components/ui/toasts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { FullPageLoader } from "@/components/ui/Loader";

// ═══════════════════════════════════════════════════════════════════
// ADMIN LOGIN PAGE
//
// Simple email + password login form.
// Works regardless of browser state (no cookies/localStorage dependency).
// Backend validates credentials and issues tokens.
//
// Security: Redirects to dashboard if user is already authenticated.
// ═══════════════════════════════════════════════════════════════════

interface LoginResponse {
  info: string;
  admin: {
    email: string;
    role: string;
  };
  accessToken: string;
  accessTokenExpiry: number;
}

async function loginApi(data: { email: string; password: string }): Promise<LoginResponse> {
  const response = await axios.post<LoginResponse>(
    `${BACKEND_URL}/admin/login`,
    data,
    {
      withCredentials: true,
      timeout: API_TIMEOUT,
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
}

export default function LoginPage() {
  const router = useRouter();
  const { setSession, isAuthenticated, isLoading } = useAdminSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ─────────────────────────────────────────────────────────────────
  // Redirect to dashboard if already authenticated
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const { mutate: login, isPending } = useMutation({
    mutationFn: loginApi,
    retry: 3,
    onSuccess: (data) => {
      toast.custom(() => (
        <SuccessToast 
          title="Welcome back!" 
          description="Redirecting to dashboard..."
        />
      ), { duration: 2000 });
      setSession(data.admin as any, data.accessToken);
      router.replace("/");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.info || "Invalid credentials";
      toast.custom(() => (
        <ErrorToast 
          title="Login failed" 
          description={message}
        />
      ), { duration: 4000 });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    login({ email: email.trim(), password });
  };

  const isFormValid = email.trim() && password.trim();

  // ─────────────────────────────────────────────────────────────────
  // Show loader while checking session or if already authenticated
  // ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return <FullPageLoader text="Checking session..." />;
  }

  if (isAuthenticated) {
    return <FullPageLoader text="Redirecting to dashboard..." />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-muted/30 via-background to-muted/20" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground/5 mb-4">
            <Shield className="h-7 w-7 text-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            KASHIYATRA <span className="text-amber-500">2027</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Admin Panel</p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign in</CardTitle>
            <CardDescription>
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@kashiyatra.org"
                    className="pl-10"
                    disabled={isPending}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    disabled={isPending}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isPending || !isFormValid}
                className="w-full mt-2 gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          © Kashiyatra 2027 · IIT (BHU) Varanasi
        </p>
      </div>
    </div>
  );
}
