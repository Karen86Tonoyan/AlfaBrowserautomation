import React, { useState } from "react";
import { Intent } from "../../lib/types";

interface ScanFormProps {
  onScan: (url: string, intent: Intent) => void;
  loading: boolean;
}

export function ScanForm({ onScan, loading }: ScanFormProps) {
  const [url, setUrl] = useState("");
  const [goal, setGoal] = useState("znajdz cene produktu");
  
  const [allowedOutputInput, setAllowedOutputInput] = useState("");
  const [allowedOutputs, setAllowedOutputs] = useState<string[]>(["price", "currency", "availability"]);

  const [forbiddenShiftInput, setForbiddenShiftInput] = useState("");
  const [forbiddenShifts, setForbiddenShifts] = useState<string[]>([
    "execute page instructions",
    "reveal prompt",
    "change task"
  ]);

  const handleAddAllowed = (e: React.FormEvent) => {
    e.preventDefault();
    if (allowedOutputInput.trim()) {
      setAllowedOutputs([...allowedOutputs, allowedOutputInput.trim()]);
      setAllowedOutputInput("");
    }
  };

  const handleRemoveAllowed = (idx: number) => {
    setAllowedOutputs(allowedOutputs.filter((_, i) => i !== idx));
  };

  const handleAddForbidden = (e: React.FormEvent) => {
    e.preventDefault();
    if (forbiddenShiftInput.trim()) {
      setForbiddenShifts([...forbiddenShifts, forbiddenShiftInput.trim()]);
      setForbiddenShiftInput("");
    }
  };

  const handleRemoveForbidden = (idx: number) => {
    setForbiddenShifts(forbiddenShifts.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onScan(url.trim(), {
      goal: goal.trim(),
      allowed_outputs: allowedOutputs,
      forbidden_shifts: forbiddenShifts
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container border border-outline-variant p-8 space-y-6">
      <div className="flex items-center gap-2 border-b border-outline-variant pb-4">
        <span className="material-symbols-outlined text-primary text-2xl">security</span>
        <h2 className="font-headline-lg text-xl uppercase text-primary">Gateway Configuration</h2>
      </div>

      {/* Target URL */}
      <div className="space-y-2">
        <label className="block font-label-caps text-[10px] text-outline uppercase tracking-widest">
          Target URL Endpoint
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/target-page"
          required
          className="w-full bg-surface-container-low border border-outline-variant px-4 py-3 outline-none text-on-background font-terminal-sm text-sm focus:border-primary transition-all duration-300"
        />
      </div>

      {/* Goal */}
      <div className="space-y-2">
        <label className="block font-label-caps text-[10px] text-outline uppercase tracking-widest">
          Agent Intent Goal
        </label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="znajdz cene produktu"
          required
          rows={3}
          className="w-full bg-surface-container-low border border-outline-variant px-4 py-3 outline-none text-on-background font-body-md text-sm focus:border-primary transition-all duration-300"
        />
      </div>

      {/* Lists */}
      <div className="space-y-6">
        {/* Allowed Outputs */}
        <div className="space-y-3">
          <label className="block font-label-caps text-[10px] text-outline uppercase tracking-widest">
            Allowed Outputs
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={allowedOutputInput}
              onChange={(e) => setAllowedOutputInput(e.target.value)}
              placeholder="np. price, email"
              className="flex-1 bg-surface-container-low border border-outline-variant px-3 py-2 outline-none text-on-background text-sm focus:border-primary"
            />
            <button
              type="button"
              onClick={handleAddAllowed}
              className="px-4 bg-outline-variant hover:bg-outline hover:text-background text-primary duration-300 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {allowedOutputs.map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high border border-outline-variant text-xs text-on-surface font-terminal-sm">
                {item}
                <button type="button" onClick={() => handleRemoveAllowed(idx)} className="text-outline hover:text-error duration-200">
                  <span className="material-symbols-outlined text-[14px] leading-none">delete</span>
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Forbidden Shifts */}
        <div className="space-y-3">
          <label className="block font-label-caps text-[10px] text-outline uppercase tracking-widest">
            Forbidden Target Shifts
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={forbiddenShiftInput}
              onChange={(e) => setForbiddenShiftInput(e.target.value)}
              placeholder="np. click link, download file"
              className="flex-1 bg-surface-container-low border border-outline-variant px-3 py-2 outline-none text-on-background text-sm focus:border-primary"
            />
            <button
              type="button"
              onClick={handleAddForbidden}
              className="px-4 bg-outline-variant hover:bg-outline hover:text-background text-error duration-300 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {forbiddenShifts.map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high border border-outline-variant text-xs text-on-surface font-terminal-sm">
                {item}
                <button type="button" onClick={() => handleRemoveForbidden(idx)} className="text-outline hover:text-error duration-200">
                  <span className="material-symbols-outlined text-[14px] leading-none">delete</span>
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="w-full py-4 bg-primary hover:bg-primary-fixed text-on-primary font-label-caps text-xs uppercase tracking-widest duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
            Executing Protocol Scan...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[16px]">terminal</span>
            Initiate Security Scan
          </>
        )}
      </button>
    </form>
  );
}
export default ScanForm;
