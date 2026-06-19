import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const apiBaseUrl = process.env.ALFA_API_URL ?? "http://127.0.0.1:8080";

type ScanRequest = {
  url: string;
  intent: {
    goal: string;
    allowedOutputs: string[];
    forbiddenShifts: string[];
  };
};

async function callJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, init);

  if (!response.ok) {
    throw new Error(`API ${path} failed with HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

const server = new McpServer({
  name: "alfa-browser-automation-mcp",
  version: "1.0.0"
});

server.registerTool(
  "health",
  {
    title: "ALFA Health",
    description: "Checks whether the local AlfaBrowserautomation API is reachable."
  },
  async () => {
    const result = await callJson<{ status: string; service: string }>("/health");

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }
);

server.registerTool(
  "scan_url",
  {
    title: "Scan URL",
    description:
      "Runs the ALFA safe-browsing scan for a URL with explicit agent intent and returns the gateway verdict.",
    inputSchema: {
      url: z.string().url().describe("Target URL to scan before an agent enters the page."),
      goal: z.string().min(1).describe("Declared agent intent before entering the page."),
      allowedOutputs: z
        .array(z.string())
        .optional()
        .describe("Outputs the agent is allowed to extract from the page."),
      forbiddenShifts: z
        .array(z.string())
        .optional()
        .describe("Task shifts that must never be accepted from page content.")
    }
  },
  async ({ url, goal, allowedOutputs, forbiddenShifts }) => {
    const payload: ScanRequest = {
      url,
      intent: {
        goal,
        allowedOutputs: allowedOutputs ?? [],
        forbiddenShifts: forbiddenShifts ?? []
      }
    };

    const result = await callJson<unknown>("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
