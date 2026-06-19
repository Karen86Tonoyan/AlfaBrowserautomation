import React from "react";

interface RiskBadgeProps {
  level: "info" | "low" | "medium" | "warn" | "critical";
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const getStyles = () => {
    switch (level) {
      case "critical":
        return "border-error-container bg-error-container/10 text-error neon-glow-red";
      case "warn":
        return "border-primary/30 bg-primary/10 text-primary neon-glow-amber";
      case "medium":
        return "border-primary-fixed-dim/30 bg-primary-fixed-dim/10 text-primary-fixed-dim";
      case "low":
        return "border-secondary-fixed-dim/30 bg-secondary-fixed-dim/10 text-secondary-fixed-dim";
      default:
        return "border-outline bg-surface-container-high text-on-surface-variant";
    }
  };

  const getLabel = () => {
    switch (level) {
      case "critical": return "CRITICAL THREAT";
      case "warn": return "WARNING DRIFT";
      case "medium": return "MEDIUM RISK";
      case "low": return "LOW RISK";
      default: return "SECURE INFO";
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded border font-label-caps text-[11px] tracking-widest uppercase ${getStyles()}`}>
      <span className="material-symbols-outlined text-[14px] mr-1">gpp_maybe</span>
      {getLabel()}
    </span>
  );
}
export default RiskBadge;
