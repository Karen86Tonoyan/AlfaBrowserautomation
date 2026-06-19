import fs from "fs";
import path from "path";
import { Finding } from "@alfa/shared";

interface PatternRule {
  id: string;
  name: string;
  pattern: string;
  risk: "info" | "low" | "medium" | "high" | "critical";
}

export class PromptInjectionScanner {
  private rules: PatternRule[] = [];

  constructor() {
    this.loadRules();
  }

  private loadRules() {
    try {
      const rulesPath = path.resolve(
        __dirname,
        "../../../../../../data/rules/prompt-injection-patterns.json"
      );
      if (fs.existsSync(rulesPath)) {
        const raw = fs.readFileSync(rulesPath, "utf-8");
        const parsed = JSON.parse(raw);
        this.rules = parsed.rules;
        console.log(`[PromptInjectionScanner] Loaded ${this.rules.length} patterns.`);
      } else {
        console.warn("[PromptInjectionScanner] Rules file not found, loading fallbacks.");
        this.loadFallbacks();
      }
    } catch (e) {
      console.error("[PromptInjectionScanner] Error loading rules, using fallbacks:", e);
      this.loadFallbacks();
    }
  }

  private loadFallbacks() {
    this.rules = [
      {
        id: "inj_ignore_prev",
        name: "Ignore Previous Instructions",
        pattern: "(ignore|override|bypass|disregard)\\s+(previous|prior|all|system)?\\s*(instructions|prompts|directives|messages)",
        risk: "critical"
      },
      {
        id: "inj_sys_prompt",
        name: "System Prompt Revelation",
        pattern: "(reveal|show|output|print|display|tell me|explain)\\s+(your|the)?\\s*(system prompt|developer instructions|hidden configuration|initial instructions)",
        risk: "high"
      }
    ];
  }

  public scan(text: string, elementId?: string, selector?: string): { findings: Finding[]; score: number } {
    const findings: Finding[] = [];
    let score = 0;
    let matchCount = 0;

    for (const rule of this.rules) {
      const regex = new RegExp(rule.pattern, "gi");
      const match = regex.exec(text);

      if (match) {
        matchCount++;
        // Waga ryzyka
        let weight = 0.1;
        if (rule.risk === "medium") weight = 0.3;
        if (rule.risk === "high") weight = 0.7;
        if (rule.risk === "critical") weight = 0.95;
        
        score = Math.max(score, weight);

        findings.push({
          id: `find_pi_${rule.id}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          elementId,
          type: "prompt_injection",
          tag: "prompt_like",
          riskLevel: rule.risk,
          description: `Wykryto wzorzec: ${rule.name}`,
          excerpt: text.length > 200 ? text.substring(match.index, match.index + 200) + "..." : text,
          selector
        });
      }
    }

    // Dodatkowo skalujemy wynik na podstawie liczby dopasowań
    if (matchCount > 1) {
      score = Math.min(0.99, score + 0.1 * (matchCount - 1));
    }

    return { findings, score };
  }
}
export const promptInjectionScanner = new PromptInjectionScanner();
