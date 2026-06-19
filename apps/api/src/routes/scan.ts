import { Router, Request, Response } from "express";
import { IntentSchema } from "@alfa/shared";
import { pageFetcher } from "../services/fetch/pageFetcher";
import { promptInjectionScanner } from "../services/scan/promptInjectionScanner";
import { owaspSignalScanner } from "../services/scan/owaspSignalScanner";
import { intentDiff } from "../services/scan/intentDiff";
import { policyEngine } from "../services/scan/policyEngine";

const router = Router();

router.post("/scan", async (req: Request, res: Response) => {
  try {
    const { url, intent } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Parametr 'url' jest wymagany." });
    }

    const parsedIntent = IntentSchema.safeParse(intent);
    if (!parsedIntent.success) {
      return res.status(400).json({
        error: "Niepoprawny format intencji.",
        details: parsedIntent.error.format()
      });
    }

    const fetchResult = await pageFetcher.fetchUrl(url);
    const piResult = promptInjectionScanner.scan(fetchResult.text);
    const owaspResult = owaspSignalScanner.scan(fetchResult.elements);
    const driftResult = intentDiff.calculateDrift(parsedIntent.data, fetchResult.text);

    const allFindings = [...piResult.findings, ...owaspResult.findings];
    const policyResult = policyEngine.evaluate(
      piResult.score,
      owaspResult.score,
      allFindings,
      driftResult.intentPreserved
    );

    const safe_blocks: string[] = [];
    const quarantined_blocks: string[] = [];

    if (policyResult.decision === "ALLOW") {
      safe_blocks.push(fetchResult.text);
    } else if (policyResult.decision === "SANITIZE") {
      const sentences = fetchResult.text.split(/[.!?]+/);
      for (const sentence of sentences) {
        const cleanSentence = sentence.trim();
        if (!cleanSentence) continue;

        const isSuspicious = allFindings.some((f) =>
          f.excerpt
            ? cleanSentence.toLowerCase().includes(f.excerpt.toLowerCase().slice(0, 40))
            : false
        );

        if (isSuspicious) {
          quarantined_blocks.push(cleanSentence);
        } else {
          safe_blocks.push(cleanSentence);
        }
      }
    } else if (policyResult.decision === "HOLD") {
      safe_blocks.push(fetchResult.text);
      quarantined_blocks.push(
        JSON.stringify(
          {
            reason: "Manual review required before agent execution.",
            findings: allFindings.map((f) => ({
              type: f.type,
              riskLevel: f.riskLevel,
              selector: f.selector
            }))
          },
          null,
          2
        )
      );
    } else {
      quarantined_blocks.push(fetchResult.text);
    }

    return res.json({
      ...policyResult,
      safe_blocks,
      quarantined_blocks
    });
  } catch (e: any) {
    return res.status(500).json({ error: `Blad skanowania: ${e.message}` });
  }
});

export default router;
