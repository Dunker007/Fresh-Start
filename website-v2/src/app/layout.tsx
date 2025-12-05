import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import CommandPalette from "@/components/CommandPalette";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DLX Studio AI - Your Personal AI Operating System",
  description: "A powerful AI command center with local LLM integration, GPU monitoring, and multi-model orchestration. Built on LuxRig.",
  keywords: ["AI", "LLM", "LM Studio", "Ollama", "Machine Learning", "Local AI"],
};

import { VibeProvider } from "@/components/VibeContext";
import VibeController from "@/components/VibeController";
import VoiceControl from "@/components/VoiceControl";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-grid`}>
        <VibeProvider>
          <Navigation />
          <CommandPalette />
          <main className="pt-16">
            {children}
          </main>
          <VibeController />
          <VoiceControl />
        </VibeProvider>
      </body>
    </html>
  );
}
