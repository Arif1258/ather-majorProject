import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { MeshBackground } from "@/components/ui/MeshBackground";
import { Navbar } from "@/components/ui/Navbar";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export const metadata: Metadata = {
  title: "AetherMonitor | Liquid Glass Infrastructure",
  description: "Immersive Uptime and Infrastructure Monitoring platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased text-foreground bg-background selection:bg-brand-cyan/30 selection:text-brand-cyan`}>
        <MeshBackground />
        <CustomCursor />
        <Navbar />
        <main className="relative z-10 pt-32 pb-16 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
