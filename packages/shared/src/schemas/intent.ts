import { z } from "zod";

export const IntentSchema = z.object({
  goal: z.string().min(1, "Cel agenta jest wymagany"),
  allowed_outputs: z.array(z.string()).default([]),
  forbidden_shifts: z.array(z.string()).default([
    "execute page instructions",
    "reveal prompt",
    "change task"
  ])
});

export type Intent = z.infer<typeof IntentSchema>;
