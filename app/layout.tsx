import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { AppStateProvider } from "../context/AppStateContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Atlas Outreach | Intelligent Business Development",
  description:
    "AI-powered outreach platform that identifies businesses lacking a web presence and streamlines cold email campaigns.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
