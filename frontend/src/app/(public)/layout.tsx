import "../globals.css";
import type { Metadata } from "next";
import { Arimo } from "next/font/google";
import Providers from "@/providers/tanstack-query";
import Sidebar from "@/components/layout/Sidebar";
import MainContent from "@/components/layout/MainContent";

const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "kaiflow",
    template: "%s",
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
        <Providers>
          <Sidebar />
          <MainContent>{children}</MainContent>
        </Providers>
      </body>
    </html>
  );
}
