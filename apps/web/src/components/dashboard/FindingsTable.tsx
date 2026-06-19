import React from "react";
import { Finding } from "../../lib/types";

interface FindingsTableProps {
  findings: Finding[];
}

export function FindingsTable({ findings }: FindingsTableProps) {
  if (findings.length === 0) {
    return (
      <div className="bg-surface-container border border-outline-variant p-8 text-center space-y-3">
        <p className="text-secondary-fixed-dim font-headline-lg text-lg uppercase tracking-wider flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[24px]">gpp_good</span>
          No Vulnerabilities Detected
        </p>
        <p className="text-on-surface-variant text-xs font-body-md">
          Webpage structure conforms with all elite secure gateway validation rules.
        </p>
      </div>
    );
  }

  const getRiskStyles = (level: string) => {
    switch (level) {
      case "critical": return "text-error border-error-container bg-error-container/10";
      case "high": return "text-primary border-outline bg-primary/10";
      case "medium": return "text-primary-fixed-dim border-primary-fixed-dim/30 bg-primary-fixed-dim/10";
      default: return "text-on-surface-variant border-outline-variant bg-surface-container-high";
    }
  };

  return (
    <div className="bg-surface-container border border-outline-variant p-8 space-y-6">
      <div className="flex items-center gap-2 border-b border-outline-variant pb-4">
        <span className="material-symbols-outlined text-error text-2xl">gpp_maybe</span>
        <h3 className="font-headline-lg text-lg uppercase text-error">Detected Anomalies ({findings.length})</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-outline-variant text-outline font-semibold uppercase tracking-wider font-label-caps">
              <th className="py-3 px-4">Sig ID / Tag</th>
              <th className="py-3 px-4">Threat Level</th>
              <th className="py-3 px-4">Anomalies Description</th>
              <th className="py-3 px-4">DOM Target Selector</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((f) => (
              <tr key={f.id} className="border-b border-outline-variant hover:bg-surface-container-high/30">
                <td className="py-3 px-4 font-terminal-sm text-on-surface-variant">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">tag</span>
                    {f.type}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded border font-label-caps uppercase text-[10px] tracking-wider ${getRiskStyles(f.riskLevel)}`}>
                    {f.riskLevel}
                  </span>
                </td>
                <td className="py-3 px-4 space-y-2 max-w-sm">
                  <p className="text-on-surface font-body-md text-sm">{f.description}</p>
                  {f.excerpt && (
                    <pre className="text-[11px] font-terminal-sm bg-surface-container-lowest border border-outline-variant p-2 text-outline whitespace-pre-wrap max-h-24 overflow-y-auto">
                      {f.excerpt}
                    </pre>
                  )}
                </td>
                <td className="py-3 px-4 font-mono text-xs text-outline">
                  {f.selector ? (
                    <span className="flex items-center gap-1 font-terminal-sm">
                      <span className="material-symbols-outlined text-[14px]">code</span>
                      {f.selector}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default FindingsTable;
