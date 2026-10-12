"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { SidebarProvider } from "@/hooks";
import { AuthGuard } from "@/components/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useAdminSession } from "@/lib/auth";
import { useChangePassword } from "@/lib/api/hooks";
import { THEMES } from "@/components/layout/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ErrorToast } from "@/components/ui/toasts";
import {
  User,
  Mail,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Loader2,
  CheckCircle2,
  KeyRound,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// Theme Option Component
// ─────────────────────────────────────────────────────────────────

interface ThemeOptionProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  isSelected: boolean;
  onClick: () => void;
}

function ThemeOption({ label, description, icon, accentColor, isSelected, onClick }: ThemeOptionProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
        hover:scale-[1.02] active:scale-[0.98]
        ${isSelected
          ? "shadow-md"
          : "border-border hover:border-muted-foreground/30 bg-card/50 hover:bg-card"
        }
      `}
      style={isSelected ? {
        borderColor: accentColor,
        backgroundColor: `${accentColor}10`,
      } : undefined}
    >
      {/* Selection dot */}
      {isSelected && (
        <div 
          className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
      )}
      
      <div 
        className={`p-2.5 rounded-lg ${!isSelected && "bg-muted/50"}`}
        style={isSelected ? { backgroundColor: `${accentColor}20` } : undefined}
      >
        <div style={isSelected ? { color: accentColor } : undefined}>
          {icon}
        </div>
      </div>
      <div className="text-center">
        <p 
          className={`text-xs font-medium ${!isSelected && "text-foreground"}`}
          style={isSelected ? { color: accentColor } : undefined}
        >
          {label}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// Password Requirements
// ─────────────────────────────────────────────────────────────────

function PasswordRequirements({ password }: { password: string }) {
  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /\d/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {requirements.map((req, idx) => (
        <div key={idx} className="flex items-center gap-2 text-xs">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${req.met ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
          <span className={req.met ? "text-emerald-500" : "text-muted-foreground"}>{req.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { session } = useAdminSession();
  const { theme, setTheme } = useTheme();
  const { changePassword, isPending: isChangingPassword, isSuccess: isPasswordChanged, reset: resetPasswordState } = useChangePassword();

  const [mounted, setMounted] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isPasswordChanged) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      const timer = setTimeout(() => resetPasswordState(), 3000);
      return () => clearTimeout(timer);
    }
  }, [isPasswordChanged, resetPasswordState]);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.custom(() => <ErrorToast title="Missing fields" description="Please fill in all password fields" />, { duration: 4000 });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.custom(() => <ErrorToast title="Passwords don't match" description="New password and confirmation must match" />, { duration: 4000 });
      return;
    }

    if (newPassword.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      toast.custom(() => <ErrorToast title="Invalid password" description="Password must meet all requirements" />, { duration: 4000 });
      return;
    }

    changePassword({ currentPassword, newPassword });
  };

  const isPasswordFormValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword) &&
    newPassword === confirmPassword;

  const roleDisplay = session?.role?.replace("_", " ") ?? "Unknown";

  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col ml-0 md:ml-16 lg:ml-60 min-w-0">
            <Topbar />
            
            {/* Centered Content Container */}
            <main className="flex-1 flex justify-center p-4 md:p-6 lg:p-8">
              <div className="w-full max-w-xl">
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                  <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
                </div>

                <div className="space-y-6">
                  {/* ═══════════════════════════════════════════════════════════ */}
                  {/* PROFILE SECTION */}
                  {/* ═══════════════════════════════════════════════════════════ */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <CardTitle className="text-base">Profile</CardTitle>
                      </div>
                      <CardDescription className="text-xs">Your admin account information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm font-medium truncate">{session?.email ?? "Loading..."}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Role</p>
                          <p className="text-sm font-medium">{roleDisplay}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* ═══════════════════════════════════════════════════════════ */}
                  {/* APPEARANCE SECTION */}
                  {/* ═══════════════════════════════════════════════════════════ */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-muted-foreground" />
                        <CardTitle className="text-base">Appearance</CardTitle>
                      </div>
                      <CardDescription className="text-xs">Customize how the dashboard looks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2">
                        {mounted ? (
                          THEMES.map((themeOption) => {
                            const Icon = themeOption.icon;
                            return (
                              <ThemeOption
                                key={themeOption.id}
                                label={themeOption.label}
                                description={themeOption.description}
                                icon={<Icon className="w-4 h-4" />}
                                accentColor={themeOption.accentColor}
                                isSelected={theme === themeOption.id}
                                onClick={() => setTheme(themeOption.id)}
                              />
                            );
                          })
                        ) : (
                          <>
                            {Array.from({ length: 9 }).map((_, i) => (
                              <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse" />
                            ))}
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-4">
                        Your preference is saved automatically in your browser
                      </p>
                    </CardContent>
                  </Card>

                  {/* ═══════════════════════════════════════════════════════════ */}
                  {/* SECURITY SECTION */}
                  {/* ═══════════════════════════════════════════════════════════ */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <CardTitle className="text-base">Security</CardTitle>
                      </div>
                      <CardDescription className="text-xs">Update your password to keep your account secure</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        {/* Current Password */}
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-xs">Current Password</Label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <KeyRound className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input
                              id="currentPassword"
                              type={showCurrentPassword ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Enter current password"
                              className="pl-10 pr-10 h-10"
                              disabled={isChangingPassword}
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                              tabIndex={-1}
                            >
                              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-xs">New Password</Label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter new password"
                              className="pl-10 pr-10 h-10"
                              disabled={isChangingPassword}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                              tabIndex={-1}
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <PasswordRequirements password={newPassword} />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-xs">Confirm New Password</Label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input
                              id="confirmPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirm new password"
                              className="pl-10 h-10"
                              disabled={isChangingPassword}
                            />
                          </div>
                          {confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-xs text-red-500">Passwords don't match</p>
                          )}
                          {confirmPassword && newPassword === confirmPassword && newPassword.length >= 8 && (
                            <p className="text-xs text-emerald-500 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Passwords match
                            </p>
                          )}
                        </div>

                        <Separator className="my-4" />

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <a
                            href="/forgot-password"
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Forgot your password?
                          </a>
                          <Button
                            type="submit"
                            size="sm"
                            disabled={isChangingPassword || !isPasswordFormValid}
                            className="gap-2"
                          >
                            {isChangingPassword ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Changing...
                              </>
                            ) : (
                              "Change Password"
                            )}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
