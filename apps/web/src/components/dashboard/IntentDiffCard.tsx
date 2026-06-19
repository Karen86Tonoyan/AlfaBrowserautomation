import React from "react";

interface IntentDiffCardProps {
  intentPreserved: boolean;
  score: number;
}

export function IntentDiffCard({ intentPreserved, score }: IntentDiffCardProps) {
  return (
    <div className={`bg-surface-container border p-8 ${intentPreserved ? "border-secondary-fixed-dim/20 bg-secondary/5" : "border-error-container bg-error-container/5"}`}>
      <div className="flex items-start gap-6">
        <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${intentPreserved ? "bg-secondary-fixed-dim/10 text-secondary-fixed-dim" : "bg-error-container/10 text-error"}`}>
          <span className="material-symbols-outlined text-[28px]">
            {intentPreserved ? "check_circle" : "warning"}
          </span>
        </div>
        <div className="space-y-2 flex-1">
          <h3 className="font-headline-lg text-lg uppercase">
            {intentPreserved ? "Intent Validation: Preserved" : "Intent Drift Detected"}
          </h3>
          <p className="text-on-surface-variant text-sm font-body-md">
            {intentPreserved 
              ? "Web page content verified. No threat redirection triggers or goal modification signals found." 
              : "Anomalies detected. Page instructions contain redirection attempts designed to shift the agent's initial goal."}
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs font-semibold font-label-caps">
            <span className="text-outline uppercase tracking-wider">PROMPT INJECTION INDEX:</span>
            <span className={`text-[13px] font-bold ${score > 0.5 ? "text-error" : score > 0.2 ? "text-primary" : "text-secondary-fixed-dim"}`}>
              {(score * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default IntentDiffCard;
