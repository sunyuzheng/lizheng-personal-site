/** Public Ask Lizheng contract. Credentials and source validation stay upstream. */
export type AskIntent = "understand" | "apply" | "find";
export type AskSource = {
  id: string;
  title: string;
  url: string;
  date?: string;
  excerpt?: string;
  author?: string;
  attribution_note?: string;
  public_copy_url?: string;
  reason?: string;
};
export type AskResult = {
  status: "answered" | "clarify" | "unsupported" | "sources-only";
  summary: string;
  sections: {
    heading: string;
    body: string;
    source_ids: string[];
    kind: "source" | "synthesis" | "application";
  }[];
  sources: AskSource[];
  followups: string[];
  clarifying_questions: string[];
  limitations: string;
};
export type AskEvent =
  | { type: "progress"; value: { stage: string; message: string } }
  | { type: "sources"; value: { sources: AskSource[] } }
  | { type: "result"; value: AskResult };

export class AskError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly status?: number
  ) {
    super(message);
  }
}

export function parseAskFrame(frame: string): AskEvent | null {
  let event = "";
  const lines: string[] = [];
  for (const line of frame.split(/\r?\n/)) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    if (line.startsWith("data:")) lines.push(line.slice(5).trimStart());
  }
  if (!lines.length) return null;
  const value = JSON.parse(lines.join("\n"));
  if (event === "error")
    throw new AskError(
      value.message || "The answer did not finish.",
      value.code
    );
  if (event === "progress" || event === "sources" || event === "result")
    return { type: event, value } as AskEvent;
  return null;
}

export async function askLizheng(
  payload: {
    question: string;
    context: string;
    intent: AskIntent;
    history: { question: string; summary: string }[];
  },
  signal: AbortSignal,
  onEvent: (event: AskEvent) => void
): Promise<void> {
  const response = await fetch("/api/ask-lizheng/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
    credentials: "omit",
    cache: "no-store",
  });
  if (!response.ok) {
    let message = "";
    try {
      message = (await response.json()).message || "";
    } catch {
      /* Upstream may be unavailable. */
    }
    throw new AskError(
      message || `HTTP ${response.status}`,
      undefined,
      response.status
    );
  }
  if (
    !response.body ||
    !response.headers.get("content-type")?.includes("text/event-stream")
  )
    throw new Error("The answer stream is unavailable.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    const process = (frame: string) => {
      const event = parseAskFrame(frame);
      if (!event) return false;
      onEvent(event);
      return event.type === "result";
    };
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      if (buffer.length > 512_000)
        throw new Error("The answer stream exceeded its limit.");
      let boundary;
      while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
        const frame = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary[0].length);
        if (process(frame)) return;
      }
      if (done) {
        if (buffer.trim() && process(buffer)) return;
        throw new Error(
          "The connection ended before a complete answer arrived."
        );
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export function publicSourceUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}
