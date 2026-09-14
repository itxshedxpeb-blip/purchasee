import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GlassNavbar from "@/components/layout/GlassNavbar";
import MouseFollowEffect from "@/components/common/MouseFollowEffect";
import { ToastProvider } from "@/components/common/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Purchase Management System",
  description: "A simple and efficient purchase register application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="premium-bg" />
        <MouseFollowEffect />
        <ToastProvider>
          <div className="min-h-screen flex flex-col relative">
            <GlassNavbar />
            <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 page-transition">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
