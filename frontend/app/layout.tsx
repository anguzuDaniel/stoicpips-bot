import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { TrialGate } from "@/components/TrialGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dunam Ai | Zero Emotion. Total Execution.",
  description: "Dunam Ai is an emotionless, high-precision trading bot for Synthetic Indices.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dunam Ai",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <NotificationProvider>
            <TrialGate>
              {children}
            </TrialGate>
          </NotificationProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
