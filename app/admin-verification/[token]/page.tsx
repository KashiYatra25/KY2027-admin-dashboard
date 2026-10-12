"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useVerifyAdminCreds } from "@/lib/api";
import { useAdminSession } from "@/lib/auth";
import { Spinner } from "@/components/ui/loader/Spinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, ArrowRight, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Mail } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// ADMIN VERIFICATION PAGE
//
// Route: /admin-verification/[token]
//
// This page is accessed via the email link sent to new admins.
// The token in the URL is verified along with email and password.
// ═══════════════════════════════════════════════════════════════════

export default function AdminVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { setSession } = useAdminSession();

  const {
    verifyCredentials,
    isPending,
    isSuccess,
    isError,
    errorMessage,
    admin,
  } = useVerifyAdminCreds({
    onSuccess: (result) => {
      setSession(result.admin, result.accessToken);
      setIsRedirecting(true);
      router.push("/");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !token) return;
    verifyCredentials({
      email: email.trim(),
      adminPassword: password,
      loginToken: token,
    });
  };

  const isFormValid = email.trim() && password.trim();

  // Show full-page loader when redirecting
  if (isRedirecting || isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-muted/30 via-background to-muted/20" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Success checkmark */}
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>

          {/* Brand */}
          <h1 className="text-2xl font-bold tracking-tight">
            KASHIYATRA <span className="text-amber-500">2027</span>
          </h1>

          {/* Welcome message */}
          <div className="text-center">
            <p className="text-lg font-medium">
              Welcome, {admin?.email?.split("@")[0]}!
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Redirecting to dashboard...
            </p>
          </div>

          {/* Loader */}
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
          <p className="mt-1 text-sm text-muted-foreground">Admin Verification</p>
        </div>

        {/* Verification Card */}
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Verify Your Identity</CardTitle>
            <CardDescription>
              Enter your email and the temporary password sent to complete onboarding.
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
                    autoFocus
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="password">Temporary Password</Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your temporary password"
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

              {/* Error Message */}
              {isError && errorMessage && (
                <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-red-500 text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isPending || !isFormValid}
                className="w-full gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Security note */}
            <div className="mt-6 pt-5 border-t">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  This link expires in{" "}
                  <span className="text-amber-500 font-medium">10 minutes</span>.
                  After verification, you&apos;ll be required to change your password.
                </p>
              </div>
            </div>
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
