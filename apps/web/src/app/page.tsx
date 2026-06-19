"use client";

import Link from "next/link";
import React, { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Parallax effect for the hero image
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 20;
      const y = (e.clientY / window.innerHeight) * 20;
      const heroImage = document.querySelector('img[alt*="Green Lady"]') as HTMLImageElement;
      if (heroImage) {
        heroImage.style.transform = `scale(1.05) translate(${x}px, ${y}px)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 md:px-20 overflow-hidden">
        <div className="grid md:grid-cols-12 gap-12 max-w-[1440px] relative z-10 w-full">
          {/* Hero text */}
          <div className="md:col-span-7 flex flex-col justify-center space-y-8">
            <div className="space-y-2">
              <span className="font-terminal-sm text-xs text-secondary-fixed-dim tracking-[0.3em] uppercase">
                Status: Gateway Active
              </span>
              <h1 className="font-headline-xl text-4xl md:text-6xl leading-[0.9] uppercase tracking-tighter">
                ALFA BROWSER<br />
                <span className="text-primary">SECURITY GATEWAY</span>
              </h1>
            </div>
            <p className="font-body-lg text-lg text-on-surface-variant max-w-lg">
              Sovereign-grade security gateway for autonomous browser agents. Precision-engineered DOM sanitization, real-time prompt injection shielding, and anti-drift validation.
            </p>
            <div className="flex gap-6">
              <Link 
                href="/scan" 
                className="bg-primary text-on-primary px-8 py-4 font-label-caps text-xs hover:bg-primary-fixed duration-300 uppercase tracking-widest text-center"
              >
                Access Scan Console
              </Link>
              <button 
                className="border border-secondary-fixed-dim text-secondary-fixed-dim px-8 py-4 font-label-caps text-xs hover:bg-secondary/10 duration-300 uppercase tracking-widest"
              >
                View Logs Dossier
              </button>
            </div>
            <div className="pt-8 border-l border-primary/30 pl-6">
              <p className="font-terminal-sm text-xs text-primary/60">GATEWAY_NODE: KT_ALFA_GATE_01</p>
              <p className="font-terminal-sm text-xs text-primary/60">PROTECTION: ACTIVE_SHIELD</p>
            </div>
          </div>

          {/* Hero image and scanline */}
          <div className="md:col-span-5 relative flex items-end">
            <div className="relative w-full aspect-[4/5] bg-surface-container-low border border-outline-variant group overflow-hidden">
              <div className="scanline"></div>
              <img 
                className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700" 
                alt="Green Lady Agent" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbnpUaKuf0d4hb1G2UROMA4IPj15eAHsyRunu00ZQ0rt-BT60GSn3boKGYJj7FP9OKAaOxzX8omWTZC3UVPN7e2XuS5BZ4wQsGhR-TMobzNKc1vVI3daSw_PfeXUjcQXcBrSpISF56LIoKBkxXXU9GB43BevSny1RmbPVh8wQ4cRGVbA9GMZMOGcBRyzpbtZ51yqvSoZ7608cKgeyXrAaSNfECHHtjyXGUvEAn_45AaCupj_ug__rg_z_yv_CQsI6nOLfl-pNICbk"
              />
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur px-3 py-1 border border-primary/30">
                <span className="font-terminal-sm text-xs text-primary">NODE: KT-A01</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Bento Grid */}
      <section className="py-16 px-4 md:px-20 bg-surface-container-lowest">
        <div className="max-w-[1440px] mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-outline-variant pb-8 gap-4">
            <div className="space-y-2">
              <span className="font-terminal-sm text-xs text-primary tracking-widest">01 // SECURITY MODULES</span>
              <h2 className="font-headline-lg text-3xl md:text-4xl uppercase">Gateway Specifications</h2>
            </div>
            <p className="font-body-md text-sm text-on-surface-variant max-w-xs md:text-right">
              Multidisciplinary protection frameworks designed for absolute agent integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Bento Card 1: Console Link */}
            <Link 
              href="/scan" 
              className="md:col-span-2 bg-surface-container border border-outline-variant p-8 relative flex flex-col justify-between group overflow-hidden hover:border-primary transition-colors duration-500"
            >
              <div className="absolute top-0 right-0 p-4 font-terminal-sm text-xs text-outline">REF_001</div>
              <div className="space-y-4">
                <span className="material-symbols-outlined text-secondary-fixed-dim text-4xl">terminal</span>
                <h3 className="font-headline-lg text-2xl text-primary uppercase">Scan Console</h3>
                <p className="font-body-md text-on-surface-variant">
                  Access the live console scanner to intercept URLs, define target goals, and sanitize DOM structural threats.
                </p>
              </div>
              <div className="mt-12 flex items-center gap-4 text-primary font-label-caps text-xs cursor-pointer group-hover:translate-x-2 transition-transform">
                <span>Deploy Scanner</span>
                <span className="material-symbols-outlined">trending_flat</span>
              </div>
            </Link>

            {/* Bento Card 2: Encrypted Comm */}
            <div className="md:col-span-1 bg-surface-container border border-outline-variant p-8 space-y-4 flex flex-col justify-between hover:border-secondary-fixed-dim transition-colors duration-500">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary-fixed-dim text-2xl">shield</span>
                </div>
                <h3 className="font-headline-lg text-lg uppercase">Shield Engine</h3>
              </div>
              <p className="font-terminal-sm text-xs text-on-surface-variant italic">
                Active prompt injection scanning and offscreen content filtration.
              </p>
            </div>

            {/* Bento Card 3: Elite Education */}
            <div className="md:col-span-1 bg-primary border border-primary p-8 flex flex-col justify-between group cursor-pointer">
              <h3 className="font-headline-lg text-2xl text-on-primary uppercase leading-none">Anti-Drift Log</h3>
              <div className="space-y-4">
                <p className="font-body-md text-xs text-on-primary/80">
                  Compares intent state changes to protect model context.
                </p>
                <span className="material-symbols-outlined text-on-primary text-4xl group-hover:translate-x-2 transition-transform">arrow_forward</span>
              </div>
            </div>

            {/* Bento Card 4: Metrics */}
            <div className="md:col-span-1 bg-surface-container border border-outline-variant p-8 flex flex-col justify-between aspect-square md:aspect-auto">
              <span className="font-terminal-sm text-xs text-secondary-fixed-dim">METRICS</span>
              <div className="space-y-1">
                <div className="text-4xl font-headline-lg text-on-surface">100%</div>
                <div className="font-label-caps text-xs text-outline uppercase">Local Privacy</div>
              </div>
            </div>

            {/* Bento Card 5: Image Banner */}
            <div className="md:col-span-3 h-64 relative group overflow-hidden border border-outline-variant">
              <img 
                className="w-full h-full object-cover grayscale opacity-50 group-hover:scale-105 transition-transform duration-1000" 
                alt="Command Center" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuArBXXSC_OsynuR9ZaPk3c6LopARiecEPhrspIg8mV4UyLQGgoWZYs4ntviDjBubM9JoEi-ekolCs-N8ScQd7KcYFUBpI-Z9448sAyABOML2ubUKPJ6warsT7QqCkDnTDsFmD4KuaetiDYDzoCH2x-jpZ9AiyqHd1aw9l74x4eJ0JZSlLyuT4JAGPWlXpco3RKIgC320L1xcDMTsmQRwIU1i6bdVTk9fJTXQZZuzNC7b548BPCqtRFd92mWC-JWur79PnPlkeL_zdE"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest to-transparent flex flex-col justify-center p-12">
                <h4 className="font-headline-lg text-2xl uppercase text-on-surface">Security Hub</h4>
                <p className="font-body-md text-sm text-on-surface-variant max-w-sm">
                  Complete situational awareness of DOM structures and threat patterns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
