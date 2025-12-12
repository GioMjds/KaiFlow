import "../globals.css";
import type { Metadata } from "next";
import { Arimo } from "next/font/google";
import Providers from "@/providers/tanstack-query";

const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "kaiflow",
    template: "%s | kaiflow",
  },
  description: "Your AI-Powered Code Review, Analyzer, and Context Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${arimo.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
