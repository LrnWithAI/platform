import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SidebarProvider } from "@/components/ui/sidebar";
import NavHeader from "@/components/nav-header";
import { AppSidebar } from "@/components/app-sidebar";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { createClient } from "@/utils/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LrnWithAI",
  description: "Make learning fun & easier with AI",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {user ?
            <SidebarProvider>
              <AppSidebar />
              <main className="w-full">
                <NavHeader />
                {children}
              </main>
            </SidebarProvider>
            :
            <SidebarProvider>
              <main className="w-full">
                <NavHeader />
                {children}
              </main>
            </SidebarProvider>
          }
        </ThemeProvider>
      </body>
    </html>
  );
}
