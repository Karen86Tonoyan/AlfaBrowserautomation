export interface Intent {
  goal: string;
  allowed_outputs: string[];
  forbidden_shifts: string[];
}

export interface Finding {
  id: string;
  elementId?: string;
  type: string;
  tag: "important" | "noise" | "instructional" | "prompt_like" | "suspicious" | "discard";
  riskLevel: "info" | "low" | "medium" | "high" | "critical";
  description: string;
  excerpt?: string;
  selector?: string;
}

export interface ScanResult {
  risk_level: "info" | "low" | "medium" | "warn" | "critical";
  prompt_injection_score: number;
  owasp_score: number;
  intent_preserved: boolean;
  decision: "ALLOW" | "SANITIZE" | "HOLD" | "BLOCK";
  findings: Finding[];
  safe_blocks: string[];
  quarantined_blocks: string[];
}
