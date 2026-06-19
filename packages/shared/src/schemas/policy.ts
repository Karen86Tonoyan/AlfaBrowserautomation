import { z } from "zod";

export const DecisionSchema = z.enum(["ALLOW", "SANITIZE", "HOLD", "BLOCK"]);
export type Decision = z.infer<typeof DecisionSchema>;

export const PolicySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  rules: z.array(
    z.object({
      trigger: z.string(), // np. "prompt_injection_score > 0.7", "owasp_finding"
      action: DecisionSchema
    })
  )
});

export type Policy = z.infer<typeof PolicySchema>;
