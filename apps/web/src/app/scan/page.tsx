"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ScanForm } from "../../components/dashboard/ScanForm";
import { FindingsTable } from "../../components/dashboard/FindingsTable";
import { IntentDiffCard } from "../../components/dashboard/IntentDiffCard";
import { DomPreview } from "../../components/dashboard/DomPreview";
import { RiskBadge } from "../../components/dashboard/RiskBadge";
import { scanUrl } from "../../lib/api";
import { ScanResult, Intent } from "../../lib/types";

export default function ScanPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [targetUrl, setTargetUrl] = useState("");

  const handleScan = async (url: string, intent: Intent) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setTargetUrl(url);

    try {
      const data = await scanUrl(url, intent);
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Błąd połączenia z API skanera.");
    } finally {
      setLoading(false);
    }
  };

  const getDecisionStyles = (decision: string) => {
    switch (decision) {
      case "ALLOW":
        return {
          bg: "border-secondary-fixed-dim/30 bg-secondary-fixed-dim/5 text-secondary-fixed-dim neon-glow-emerald",
          icon: "gpp_good",
          text: "VERDICT: ALLOW ACCESS"
        };
      case "SANITIZE":
        return {
          bg: "border-primary-fixed-dim/30 bg-primary-fixed-dim/5 text-primary-fixed-dim",
          icon: "cleaning_services",
          text: "VERDICT: SANITIZE DOM"
        };
      case "HOLD":
        return {
          bg: "border-primary/30 bg-primary/5 text-primary neon-glow-amber",
          icon: "rule",
          text: "VERDICT: ESCALATION HOLD"
        };
      default:
        return {
          bg: "border-error-container bg-error-container/5 text-error neon-glow-red",
          icon: "gpp_bad",
          text: "VERDICT: BLOCK CONNECTION"
        };
    }
  };

  return (
    <div className="space-y-8 px-4 md:px-20 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-outline-variant pb-6">
        <Link 
          href="/" 
          className="p-2 border border-outline-variant bg-surface-container hover:bg-surface-container-high text-outline hover:text-primary transition-colors duration-200"
        >
          <span className="material-symbols-outlined text-[18px] leading-none">arrow_back</span>
        </Link>
        <div>
          <span className="font-terminal-sm text-xs text-primary/60 tracking-widest uppercase">
            SECURE PORTAL CONSOLE
          </span>
          <h1 className="font-headline-lg text-2xl uppercase">Security Scanner Console</h1>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Scan Form */}
        <div className="lg:col-span-5">
          <ScanForm onScan={handleScan} loading={loading} />
        </div>

        {/* Right Side: Results */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 bg-error-container/10 border border-error-container text-error text-xs font-terminal-sm">
              <span className="material-symbols-outlined text-[14px] mr-1.5">error</span>
              SYSTEM ERROR: {error}
            </div>
          )}

          {loading && (
            <div className="bg-surface-container border border-outline-variant p-12 text-center text-outline space-y-4 relative overflow-hidden">
              <div className="scanline"></div>
              <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-terminal-sm text-xs uppercase tracking-wider">
                Scanning DOM structure & running prompt signature tests...
              </p>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="bg-surface-container border border-outline-variant p-12 text-center text-outline space-y-3">
              <span className="material-symbols-outlined text-4xl opacity-30">shield</span>
              <p className="font-body-md text-sm">
                Enter target URL parameters and goals on the left to initiate security scans.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Decision Panel */}
              {(() => {
                const decisionObj = getDecisionStyles(result.decision);
                return (
                  <div className={`p-6 border flex flex-col sm:flex-row sm:items-center gap-4 ${decisionObj.bg}`}>
                    <span className="material-symbols-outlined text-[36px] shrink-0">
                      {decisionObj.icon}
                    </span>
                    <div className="space-y-1">
                      <span className="font-label-caps text-[10px] uppercase tracking-wider block opacity-70">
                        GATEWAY DECISION WERDYKT
                      </span>
                      <span className="font-headline-lg text-xl tracking-tight block">{decisionObj.text}</span>
                    </div>
                    <div className="sm:ml-auto flex items-center gap-2">
                      <RiskBadge level={result.risk_level} />
                    </div>
                  </div>
                );
              })()}

              {/* Intent Diff */}
              <IntentDiffCard
                intentPreserved={result.intent_preserved}
                score={result.prompt_injection_score}
              />

              {/* Findings */}
              <FindingsTable findings={result.findings} />

              {/* DOM content preview */}
              <DomPreview
                safeBlocks={result.safe_blocks}
                quarantinedBlocks={result.quarantined_blocks}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
