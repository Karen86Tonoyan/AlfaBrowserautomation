import "./globals.css";
import React from "react";

export const metadata = {
  title: "KAREN TONOYAN | ELITE SECURITY PROTOCOLS",
  description: "Sovereign-grade security protocols for high-net-worth entities. Precision-engineered protection and encrypted data integrity.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-background text-on-background font-body-md selection:bg-primary selection:text-on-primary overflow-x-hidden">
        {/* TopNavBar */}
        <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 md:px-20 h-20 bg-background/80 backdrop-blur-md border-b border-primary/20">
          <div className="flex items-center gap-4">
            <img 
              className="w-10 h-10 object-contain" 
              alt="Crest Seal" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKQ-cGDLUjsrgt6tJF9PccX6YCuzyTDeZ92QgJk5WOoyQMVQocOHq2_L0rEOn1_gQqgHyxJzT5HEs4SzIWZbDP1pSQLdIdOViuZz9IfWBlYpmMif08TmKYqwMMAcDz45FfAnTWIjmHrvQ13ogfsoVuMdCKa92VzcJxqpDA-v0tVDyOFoU0MSqTYiYMN9iswcgzUtn__8IOZt01lYN6vW8rlXIFQcGSIzMW9Bxa9vS514_2ONqLg4sT1K2O5jHlUh1p08ao-nOVOeg"
            />
            <span className="font-headline-lg text-primary tracking-tighter text-xl md:text-2xl">KAREN TONOYAN</span>
          </div>
          <div className="hidden md:flex gap-12">
            <a className="text-primary border-b-2 border-primary pb-1 font-label-caps text-xs tracking-wider" href="/">ALFA</a>
            <a className="text-on-surface-variant font-label-caps text-xs tracking-wider hover:text-primary transition-colors duration-300" href="/scan">SECURITY</a>
            <a className="text-on-surface-variant font-label-caps text-xs tracking-wider hover:text-primary transition-colors duration-300" href="#">EDUCATION</a>
            <a className="text-on-surface-variant font-label-caps text-xs tracking-wider hover:text-primary transition-colors duration-300" href="#">CONTACT</a>
          </div>
          <button className="bg-primary text-on-primary font-label-caps text-xs px-6 py-2 active:scale-95 duration-200 uppercase tracking-widest">
            Access Portal
          </button>
        </nav>

        {/* Page Content */}
        <main className="pt-24 min-h-[calc(100vh-140px)]">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full py-12 px-8 md:px-20 flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-lowest border-t border-outline-variant">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-headline-lg text-primary text-lg">KAREN TONOYAN</span>
            <p className="font-terminal-sm text-[11px] text-on-surface-variant uppercase tracking-tighter">© 2026 KAREN TONOYAN. SECURED ACCESS ONLY.</p>
          </div>
          <div className="flex gap-8 text-xs font-terminal-sm text-on-surface-variant">
            <a className="hover:text-secondary transition-all" href="#">PRIVACY</a>
            <a className="hover:text-secondary transition-all" href="#">TERMS</a>
            <a className="hover:text-secondary transition-all" href="#">ENCRYPTION PROTOCOLS</a>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 flex items-center justify-center border border-outline-variant hover:border-primary transition-colors cursor-pointer text-outline hover:text-primary">
              <span className="material-symbols-outlined text-sm">terminal</span>
            </div>
            <div className="w-8 h-8 flex items-center justify-center border border-outline-variant hover:border-primary transition-colors cursor-pointer text-outline hover:text-primary">
              <span className="material-symbols-outlined text-sm">shield</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
