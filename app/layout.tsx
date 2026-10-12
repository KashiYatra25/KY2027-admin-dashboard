import type { Metadata } from "next";
import { 
  Geist, 
  Geist_Mono,
  Inter,
  Space_Grotesk,
  JetBrains_Mono,
  Outfit,
  Sora,
  Plus_Jakarta_Sans,
  Crimson_Pro,
} from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AdminSessionProvider } from "@/lib/auth";
import RouteProgressBar from "@/components/ui/RouteProgressBar";
import "./globals.css";

// Default fonts
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Theme-specific fonts
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"] });
const plusJakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const crimsonPro = Crimson_Pro({ variable: "--font-crimson", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kashiyatra Admin",
  description: "Kashiyatra 2027 Admin Dashboard",
};

const fontVariables = [
  geistSans.variable,
  geistMono.variable,
  inter.variable,
  spaceGrotesk.variable,
  jetbrainsMono.variable,
  outfit.variable,
  sora.variable,
  plusJakarta.variable,
  crimsonPro.variable,
].join(" ");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body>
        <QueryProvider>
          <AdminSessionProvider>
            <ThemeProvider 
              attribute="class" 
              defaultTheme="dark" 
              enableSystem={true}
              themes={["light", "dark", "midnight", "sunset", "forest", "lavender", "ocean", "rose", "system"]}
              disableTransitionOnChange={false}
            >
              <RouteProgressBar />
              {children}
              <Toaster 
                position="top-right" 
                toastOptions={{
                  classNames: {
                    toast: "bg-popover border-border text-foreground",
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
