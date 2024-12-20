import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ 
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

// Similarly for viewport
export async function generateViewport(): Promise<Viewport> {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#ffffff' },
      { media: '(prefers-color-scheme: dark)', color: '#000000' },
    ],
  };
}
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: "NOTAKI",
      template: "%s | NOTAKI"
    },
    description: "Intelligent note-taking application powered by AI",
    keywords: ["notes", "AI", "productivity", "organization"],
    authors: [{ name: "NOTAKI Team" }],
    robots: "index, follow",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://notaki.app",
      title: "NOTAKI",
      description: "Note App powered by AI",
      siteName: "NOTAKI"
    }
  };
}


interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} min-h-screen bg-background antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}