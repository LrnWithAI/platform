import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SidebarProvider } from "@/components/ui/sidebar"
import NavHeader from "@/components/nav-header";
import { AppSidebar } from "@/components/app-sidebar"

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
              <NavHeader />
              {children}
            </main>
          </SidebarProvider>
        </body>
      </ThemeProvider>
    </html >
  );
}
