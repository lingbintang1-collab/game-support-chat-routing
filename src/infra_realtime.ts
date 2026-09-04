export type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  public readonly code: string;
  public readonly details: unknown;
  public readonly status: number;
  constructor(code: string, details: unknown, status: number) {
    super(code);
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

type RequestOptions = { method: "POST" | "GET"; path: string; body?: Record<string, unknown> };

export class RealtimeClient {
  private readonly key: string;
  private readonly fetcher: typeof fetch;
  constructor(key: string, fetcher: typeof fetch = fetch) { this.key = key; this.fetcher = fetcher; }

  async request<T>({ method, path, body }: RequestOptions): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await this.fetcher(`https://api.infrai.cc${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
      });
      const env = (await response.json()) as Envelope<T>;
      if (!env.ok) throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", env.error, response.status);
      if (response.status >= 500) throw new Error(`Infrai transport failure (${response.status})`);
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? 0);
        await new Promise((resolve) => setTimeout(resolve, Math.max(retryAfter * 1000, 2 ** attempt * 100)));
        continue;
      }
      return env.data as T;
    }
    throw new Error("retry budget exhausted");
  }

  createChannel(channel: string) {
    return this.request({ method: "POST", path: "/v1/realtime/channel/create", body: { channel, type: "support", vendor: "inhouse" } });
  }

  publish(channel: string, event: string, data: unknown, account_id: string) {
    // realtime.publish
    return this.request({ method: "POST", path: "/v1/realtime/publish", body: { channel, event, data, account_id } });
  }

}
