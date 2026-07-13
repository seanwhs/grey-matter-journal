import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Root layout for the (main) route group — wraps public pages in Clerk auth + theme + chrome
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Header />
        <main>{children}</main>
        <Footer />
      </ThemeProvider>
    </ClerkProvider>
  );
}
