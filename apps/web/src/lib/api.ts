import { Intent, ScanResult } from "./types";

const API_BASE_URL = "http://localhost:8080/api";

export async function scanUrl(url: string, intent: Intent): Promise<ScanResult> {
  const response = await fetch(`${API_BASE_URL}/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url, intent })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Wystąpił błąd podczas skanowania.");
  }

  return response.json();
}
