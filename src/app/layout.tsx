import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";

// Load Inter with Latin subset for consistent typography
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GreyMatter Journal",
  description: "Personal tech blog by Sean Whalen",
};

// Absolute root layout — sets <html> and <body> with font + global CSS
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
