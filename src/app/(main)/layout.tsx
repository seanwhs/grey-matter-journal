import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/app/globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      {/* 
        1. suppressHydrationWarning is required because next-themes 
           will inject the 'dark' or 'light' class here.
      */}
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="system" 
            enableSystem
          >
            <Header />
            <main>{children}</main>
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}