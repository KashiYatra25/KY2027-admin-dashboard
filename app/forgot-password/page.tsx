"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL, API_TIMEOUT } from "@/lib/api/constants";
import { toast } from "sonner";
import { SuccessToast, ErrorToast } from "@/components/ui/toasts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail, Shield, CheckCircle2 } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// FORGOT PASSWORD PAGE
//
// User enters email to request password reset link.
// Shows success state regardless of whether email exists (security).
// ═══════════════════════════════════════════════════════════════════

async function forgotPasswordApi(email: string): Promise<{ info: string }> {
  const response = await axios.post<{ info: string }>(
    `${BACKEND_URL}/admin/forgot-password`,
    { email },
    {
      timeout: API_TIMEOUT,
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { mutate: sendResetLink, isPending } = useMutation({
    mutationFn: forgotPasswordApi,
    onSuccess: () => {
      setIsSubmitted(true);
      toast.custom(() => (
        <SuccessToast 
          title="Email sent" 
          description="Check your inbox for the reset link"
        />
      ), { duration: 4000 });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.info || "Something went wrong. Please try again.";
      toast.custom(() => (
        <ErrorToast 
          title="Request failed" 
          description={message}
        />
      ), { duration: 4000 });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    sendResetLink(email.trim());
  };

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

        {/* Card */}
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              {isSubmitted ? "Check your email" : "Forgot password?"}
            </CardTitle>
            <CardDescription>
              {isSubmitted 
                ? "We've sent you a password reset link"
                : "Enter your email to receive a reset link"
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isSubmitted ? (
              // Success State
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center py-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    If <strong className="text-foreground">{email}</strong> is registered, you'll receive an email with instructions to reset your password.
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    The link will expire in 10 minutes.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail("");
                    }}
                  >
                    Try a different email
                  </Button>
                  <Link href="/login" className="block">
                    <Button variant="ghost" className="w-full gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back to login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              // Form State
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div className="flex flex-col gap-3">
                  <Label htmlFor="email">Email address</Label>
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isPending || !email.trim()}
                  className="w-full gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>

                {/* Back to login */}
                <Link href="/login" className="block">
                  <Button type="button" variant="ghost" className="w-full gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </Button>
                </Link>
              </form>
            )}
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
