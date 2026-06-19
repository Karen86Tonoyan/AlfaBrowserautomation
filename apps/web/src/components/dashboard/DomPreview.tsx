import React, { useState } from "react";

interface DomPreviewProps {
  safeBlocks: string[];
  quarantinedBlocks: string[];
}

export function DomPreview({ safeBlocks, quarantinedBlocks }: DomPreviewProps) {
  const [activeTab, setActiveTab] = useState<"safe" | "quarantine">("safe");

  return (
    <div className="bg-surface-container border border-outline-variant p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-outline-variant pb-4 gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">visibility</span>
          <h3 className="font-headline-lg text-lg uppercase text-primary">Gateway Content Preview</h3>
        </div>
        
        {/* Tab switchers */}
        <div className="flex bg-surface-container-low border border-outline-variant p-1 font-label-caps text-xs">
          <button
            onClick={() => setActiveTab("safe")}
            className={`flex items-center gap-1.5 px-4 py-2 uppercase tracking-wider transition-colors ${activeTab === "safe" ? "bg-primary/10 text-primary border border-primary/20" : "text-outline hover:text-on-background"}`}
          >
            <span className="material-symbols-outlined text-[14px]">gpp_good</span>
            Safe content ({safeBlocks.length})
          </button>
          <button
            onClick={() => setActiveTab("quarantine")}
            className={`flex items-center gap-1.5 px-4 py-2 uppercase tracking-wider transition-colors ${activeTab === "quarantine" ? "bg-error-container/10 text-error border border-error-container" : "text-outline hover:text-on-background"}`}
          >
            <span className="material-symbols-outlined text-[14px]">lock</span>
            Quarantine ({quarantinedBlocks.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-40 max-h-96 overflow-y-auto bg-surface-container-low border border-outline-variant p-4 font-terminal-sm text-xs leading-relaxed text-on-surface-variant">
        {activeTab === "safe" ? (
          safeBlocks.length === 0 ? (
            <p className="text-outline italic text-center py-8">No safe content blocks available.</p>
          ) : (
            <div className="space-y-3">
              {safeBlocks.map((block, i) => (
                <div key={i} className="p-3 hover:bg-surface-container-high/30 transition-colors border-l-2 border-secondary-fixed-dim bg-secondary-fixed-dim/5">
                  {block}
                </div>
              ))}
            </div>
          )
        ) : (
          quarantinedBlocks.length === 0 ? (
            <p className="text-outline italic text-center py-8">No quarantined content blocks.</p>
          ) : (
            <div className="space-y-3">
              {quarantinedBlocks.map((block, i) => (
                <div key={i} className="p-3 hover:bg-surface-container-high/30 transition-colors border-l-2 border-error bg-error-container/10 text-error">
                  {block}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
export default DomPreview;
