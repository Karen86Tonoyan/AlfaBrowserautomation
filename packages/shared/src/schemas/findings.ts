import { z } from "zod";

export const RiskLevelSchema = z.enum(["info", "low", "medium", "high", "critical"]);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export const DomTagSchema = z.enum([
  "important",
  "noise",
  "instructional",
  "prompt_like",
  "suspicious",
  "discard"
]);
export type DomTag = z.infer<typeof DomTagSchema>;

export const FindingSchema = z.object({
  id: z.string(),
  elementId: z.string().optional(),
  type: z.string(), // np. "prompt_injection", "hidden_element", "iframe"
  tag: DomTagSchema,
  riskLevel: RiskLevelSchema,
  description: z.string(),
  excerpt: z.string().optional(),
  selector: z.string().optional()
});

export type Finding = z.infer<typeof FindingSchema>;
