import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { neobrutalism } from "@clerk/themes";
import { Toaster } from "@/components/ui/sonner";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata = {
  title: "Served | AI Recipe Platform & Smart Kitchen Assistant",
  description:
    "Transform your fridge and pantry leftovers into delicious chef-quality recipes with AI ingredient recognition and instant meal generation.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={{ baseTheme: neobrutalism }}>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${jakartaSans.variable} ${playfair.variable}`}
      >
        <body className={jakartaSans.className}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors position="bottom-right" />
          <footer className="bg-[var(--brand-green-950)] text-white">
            <div className="section-container py-12">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <p className="font-display text-xl font-semibold text-white/90 mb-1">
                    Served.
                  </p>
                  <p className="text-white/50 text-sm">
                    Turn ingredients into masterpieces.
                  </p>
                </div>
                <p className="text-white/40 text-sm">
                  Made with{" "}
                  <span className="text-[var(--terracotta-400)]">♥</span> by
                  Arya Desai &mdash; {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}