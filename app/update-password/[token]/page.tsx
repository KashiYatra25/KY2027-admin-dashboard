"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Loader2, ArrowLeft, Mail, Lock, Eye, EyeOff, Shield, CheckCircle2 } from "lucide-react";

interface ResetPasswordPayload {
  token: string;
  email: string;
  newPassword: string;
}

async function resetPasswordApi(data: ResetPasswordPayload): Promise<{ info: string }> {
  const response = await axios.post<{ info: string }>(
    `${BACKEND_URL}/admin/reset-password`,
    data,
    { timeout: API_TIMEOUT, headers: { "Content-Type": "application/json" } }
  );
  return response.data;
}

export default function UpdatePasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: resetPassword, isPending } = useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: () => {
      setIsSuccess(true);
      toast.custom(() => (
        <SuccessToast title="Password reset!" description="You can now login with your new password" />
      ), { duration: 4000 });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.info || "Failed to reset password";
      toast.custom(() => (
        <ErrorToast title="Reset failed" description={message} />
      ), { duration: 4000 });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      toast.custom(() => (
        <ErrorToast title="Passwords don't match" description="Please make sure both passwords are the same" />
      ), { duration: 4000 });
      return;
    }
    if (newPassword.length < 8) {
      toast.custom(() => (
        <ErrorToast title="Password too short" description="Password must be at least 8 characters" />
      ), { duration: 4000 });
      return;
    }
    resetPassword({ token, email: email.trim(), newPassword });
  };

  const isFormValid = email.trim() && newPassword.length >= 8 && newPassword === confirmPassword;

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-muted/30 via-background to-muted/20" />
        <div className="relative z-10 w-full max-w-sm">
          <div className="mb-10 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground/5 mb-4">
              <Shield className="h-7 w-7 text-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">KASHIYATRA <span className="text-amber-500">2027</span></h1>
          </div>
          <Card className="border-border/50 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center py-4">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <h2 className="text-lg font-semibold mb-2">Password Reset Successful!</h2>
                <p className="text-sm text-muted-foreground mb-6">You can now login with your new password.</p>
                <Button onClick={() => router.push("/login")} className="w-full">Go to Login</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-muted/30 via-background to-muted/20" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground/5 mb-4">
            <Shield className="h-7 w-7 text-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">KASHIYATRA <span className="text-amber-500">2027</span></h1>
          <p className="mt-1 text-sm text-muted-foreground">Admin Panel</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Reset Password</CardTitle>
            <CardDescription>Enter your email and choose a new password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-3">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@kashiyatra.org" className="pl-10" disabled={isPending} autoComplete="email" autoFocus />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input id="newPassword" type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="pl-10 pr-10" disabled={isPending} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Min 8 characters with uppercase, lowercase, and number</p>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input id="confirmPassword" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="pl-10" disabled={isPending} />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500">Passwords don't match</p>
                )}
              </div>

              <Button type="submit" disabled={isPending || !isFormValid} className="w-full gap-2">
                {isPending ? (<><Loader2 className="h-4 w-4 animate-spin" />Resetting...</>) : "Reset Password"}
              </Button>

              <Link href="/login"><Button type="button" variant="ghost" className="w-full gap-2"><ArrowLeft className="h-4 w-4" />Back to login</Button></Link>
            </form>
          </CardContent>
        </Card>
        <p className="mt-8 text-center text-xs text-muted-foreground">© Kashiyatra 2027 · IIT (BHU) Varanasi</p>
      </div>
    </div>
  );
}
