import { Decision, Finding } from "@alfa/shared";

export interface PolicyResult {
  risk_level: "info" | "low" | "medium" | "warn" | "critical";
  prompt_injection_score: number;
  owasp_score: number;
  intent_preserved: boolean;
  decision: Decision;
  findings: Finding[];
}

export class PolicyEngine {
  public evaluate(
    piScore: number,
    owaspScore: number,
    findings: Finding[],
    intentPreserved: boolean
  ): PolicyResult {
    let decision: Decision = "ALLOW";
    let risk_level: "info" | "low" | "medium" | "warn" | "critical" = "info";

    const hasCriticalFinding = findings.some((f) => f.riskLevel === "critical");
    const hasHighFinding = findings.some((f) => f.riskLevel === "high");
    const hasMediumFinding = findings.some((f) => f.riskLevel === "medium");
    const hasOnlyLowFindings =
      findings.length > 0 && findings.every((f) => f.riskLevel === "low");

    const maxScore = Math.max(piScore, owaspScore);

    if (piScore > 0.9 || hasCriticalFinding) {
      risk_level = "critical";
    } else if (maxScore > 0.65 || hasHighFinding || !intentPreserved) {
      risk_level = "warn";
    } else if (maxScore > 0.3 || hasMediumFinding) {
      risk_level = "medium";
    } else if (maxScore > 0.08 || hasOnlyLowFindings) {
      risk_level = "low";
    }

    if (risk_level === "critical") {
      decision = "BLOCK";
    } else if (risk_level === "warn") {
      decision = "HOLD";
    } else if (risk_level === "medium") {
      decision = "SANITIZE";
    } else {
      decision = "ALLOW";
    }

    return {
      risk_level,
      prompt_injection_score: piScore,
      owasp_score: owaspScore,
      intent_preserved: intentPreserved,
      decision,
      findings
    };
  }
}

export const policyEngine = new PolicyEngine();
