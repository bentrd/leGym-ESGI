import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { UserProvider } from "@/contexts/user-context";
import { cn } from "@/lib/utils";

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
  title: "leGym | Réseau de salles de sport en franchise",
  description:
    "Accès client à toutes les salles du réseau leGym et défis exclusifs dans chaque club.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "bg-background text-foreground antialiased",
        )}
      >
        <UserProvider>
          <div className="bg-background text-foreground flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">{children}</div>
            </main>
            <Footer />
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
