import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AdminSessionProvider } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kashiyatra Admin",
  description: "Kashiyatra 2027 Admin Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        <QueryProvider>
          <AdminSessionProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
              {children}
              <Toaster 
                position="top-right" 
                theme="dark"
                toastOptions={{
                  style: {
                    background: "rgb(30 41 59)", // slate-800
                    border: "1px solid rgb(51 65 85)", // slate-700
                    color: "white",
                  },
                }}
              />
            </ThemeProvider>
          </AdminSessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
