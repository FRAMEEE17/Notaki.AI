import type { Metadata } from "next";
import React from 'react'
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, ClerkLoaded } from "@clerk/nextjs";
import { ThemeProvider } from "@/app/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NISAGO",
  description: "Note App powered by AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ClerkLoaded>
        <html lang="en">
          <body className={inter.className}>
            <ThemeProvider attribute="class">{children}</ThemeProvider>
          </body>
        </html>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
