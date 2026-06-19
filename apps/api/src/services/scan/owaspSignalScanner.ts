import { Finding, RiskLevel } from "@alfa/shared";

export interface DomElementData {
  id: string;
  tagName: string;
  type?: string;
  text?: string;
  cssSelector?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  attributes?: Record<string, string>;
  isPopup?: boolean;
}

export class OwaspSignalScanner {
  public scan(elements: DomElementData[]): { findings: Finding[]; score: number } {
    const findings: Finding[] = [];
    let score = 0;

    for (const el of elements) {
      const tag = el.tagName.toLowerCase();

      if (tag === "iframe" || tag === "object" || tag === "embed") {
        const src = el.attributes?.src ?? "";
        const riskLevel = this.classifyFrameRisk(src);
        score += riskLevel === "medium" ? 0.12 : 0.04;
        findings.push({
          id: `find_owasp_iframe_${Date.now()}_${el.id}`,
          elementId: el.id,
          type: "hidden_frame",
          tag: "suspicious",
          riskLevel,
          description:
            riskLevel === "medium"
              ? "Wykryto osadzona ramke z niezweryfikowanego zrodla."
              : "Wykryto osadzona ramke z typowego zrodla zewnetrznego.",
          selector: el.cssSelector
        });
      }

      const w = el.width ?? 0;
      const h = el.height ?? 0;
      const x = el.x ?? 0;
      const y = el.y ?? 0;
      const isOffscreen = x < -100 || y < -100 || (w > 0 && h > 0 && w < 2 && h < 2);

      if (isOffscreen && el.text && el.text.trim().length > 0) {
        score += 0.35;
        findings.push({
          id: `find_owasp_offscreen_${Date.now()}_${el.id}`,
          elementId: el.id,
          type: "offscreen_content",
          tag: "suspicious",
          riskLevel: "high",
          description:
            "Wykryto tresc umieszczona poza widocznym ekranem - ryzyko ukrytej manipulacji.",
          excerpt: el.text,
          selector: el.cssSelector
        });
      }

      const href = el.attributes?.href ?? "";
      if (href.startsWith("javascript:")) {
        score += 0.4;
        findings.push({
          id: `find_owasp_js_link_${Date.now()}_${el.id}`,
          elementId: el.id,
          type: "javascript_link",
          tag: "suspicious",
          riskLevel: "high",
          description: "Wykryto link wykonujacy kod JavaScript bezposrednio z atrybutu href.",
          excerpt: href,
          selector: el.cssSelector
        });
      }

      const inputType = el.attributes?.type ?? "";
      if (tag === "input" && inputType === "hidden" && el.attributes?.value) {
        const val = el.attributes.value.toLowerCase();
        if (val.includes("ignore") || val.includes("instruction") || val.includes("system")) {
          score += 0.8;
          findings.push({
            id: `find_owasp_hidden_input_${Date.now()}_${el.id}`,
            elementId: el.id,
            type: "suspicious_hidden_input",
            tag: "prompt_like",
            riskLevel: "critical",
            description:
              "Wykryto podejrzany ukryty input zawierajacy slownictwo podobne do prompt injection.",
            excerpt: `value: ${el.attributes.value}`,
            selector: el.cssSelector
          });
        }
      }
    }

    return { findings, score: Math.min(0.95, score) };
  }

  private classifyFrameRisk(src: string): RiskLevel {
    if (!src) return "medium";

    try {
      const url = new URL(src);
      const host = url.hostname.toLowerCase();
      const trustedHosts = new Set([
        "www.youtube.com",
        "youtube.com",
        "youtu.be",
        "player.vimeo.com",
        "vimeo.com"
      ]);

      return trustedHosts.has(host) ? "low" : "medium";
    } catch {
      return "medium";
    }
  }
}

export const owaspSignalScanner = new OwaspSignalScanner();
