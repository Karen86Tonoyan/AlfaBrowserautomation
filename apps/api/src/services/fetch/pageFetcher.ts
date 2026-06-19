import { DomElementData } from "../scan/owaspSignalScanner";

export class PageFetcher {
  public async fetchUrl(url: string): Promise<{ html: string; text: string; elements: DomElementData[] }> {
    try {
      console.log(`[PageFetcher] Fetching: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AlfaBrowserautomation/1.0"
        }
      });

      if (!response.ok) {
        throw new Error(`Błąd pobierania strony: HTTP ${response.status}`);
      }

      const html = await response.text();
      
      // Proste parsowanie tekstu i elementów DOM w środowisku Node.js (bez zewnętrznych ciężkich bibliotek typu jsdom dla zachowania szybkości v1)
      const text = this.extractText(html);
      const elements = this.extractMockElements(html);

      return { html, text, elements };
    } catch (e: any) {
      throw new Error(`PageFetcher failed: ${e.message}`);
    }
  }

  private extractText(html: string): string {
    // Usunięcie tagów script, style, i HTML
    let text = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
    text = text.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");
    text = text.replace(/<[^>]+>/g, " ");
    text = text.replace(/\s+/g, " ").trim();
    return text;
  }

  private extractMockElements(html: string): DomElementData[] {
    const elements: DomElementData[] = [];
    
    // Detekcja iframe za pomocą prostego regexa
    const iframeRegex = /<iframe[^>]*src=["']([^"']*)["'][^>]*>/gi;
    let match;
    let idCounter = 0;
    while ((match = iframeRegex.exec(html)) !== null) {
      elements.push({
        id: `el_${idCounter++}`,
        tagName: "iframe",
        cssSelector: `iframe[src="${match[1]}"]`,
        attributes: { src: match[1] }
      });
    }

    // Detekcja linków javascript:
    const jsLinkRegex = /<a[^>]*href=["'](javascript:[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
    while ((match = jsLinkRegex.exec(html)) !== null) {
      elements.push({
        id: `el_${idCounter++}`,
        tagName: "a",
        text: match[2].replace(/<[^>]+>/g, "").trim(),
        cssSelector: "a",
        attributes: { href: match[1] }
      });
    }

    // Detekcja ukrytych inputów
    const hiddenInputRegex = /<input[^>]*type=["']hidden["'][^>]*value=["']([^"']*)["'][^>]*>/gi;
    while ((match = hiddenInputRegex.exec(html)) !== null) {
      elements.push({
        id: `el_${idCounter++}`,
        tagName: "input",
        type: "hidden",
        cssSelector: "input[type='hidden']",
        attributes: { type: "hidden", value: match[1] }
      });
    }

    return elements;
  }
}

export const pageFetcher = new PageFetcher();
