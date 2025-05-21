import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from "react-toastify";

import { SidebarProvider } from "@/components/ui/sidebar";
import { NavHeaderLoggedIn, NavHeaderLoggedOut } from "@/components/nav-header";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { createClient } from "@/utils/supabase/server";
import ClientProvider from "./ClientProvider";

import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {user ? (
            <ClientProvider user={user}>
              <SidebarProvider>
                <AppSidebar />
                <main className="w-full">
                  <NavHeaderLoggedIn />
                  {children}
                </main>
              </SidebarProvider>
            </ClientProvider>
          ) : (
            <SidebarProvider className="flex w-full justify-center">
              <main className="w-full">
                <NavHeaderLoggedOut />
                {children}
              </main>
            </SidebarProvider>
          )}
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
