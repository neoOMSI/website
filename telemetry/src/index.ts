interface Env {
  REPORTS: D1Database;
  RATE_LIMITER: RateLimit;
}

interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

const MAX_BODY_BYTES = 32 * 1024;
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };

function reply(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), { status, headers: JSON_HEADERS });
}

function finiteNumber(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function safeInteger(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= min && value <= max;
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function isDistribution(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const d = value as Record<string, unknown>;
  return hasOnlyKeys(d, ["frames", "mean_ms", "p50_ms", "p95_ms", "p99_ms", "max_ms"])
    && safeInteger(d.frames, 0, 10_000_000)
    && finiteNumber(d.mean_ms, 0, 10_000) && finiteNumber(d.p50_ms, 0, 10_000)
    && finiteNumber(d.p95_ms, 0, 10_000) && finiteNumber(d.p99_ms, 0, 10_000)
    && finiteNumber(d.max_ms, 0, 10_000);
}

function isStageList(value: unknown): boolean {
  return Array.isArray(value) && value.length <= 12 && value.every((stage) => {
    if (!stage || typeof stage !== "object" || Array.isArray(stage)) return false;
    const s = stage as Record<string, unknown>;
    return hasOnlyKeys(s, ["stage", "mean_ms_per_frame"])
      && typeof s.stage === "string" && /^[a-zA-Z0-9_. +:-]{1,80}$/.test(s.stage)
      && finiteNumber(s.mean_ms_per_frame, 0, 10_000);
  });
}

function validReport(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const r = value as Record<string, unknown>;
  if (!hasOnlyKeys(r, ["schema", "game_version", "platform", "gpu_adapter", "session_seconds", "average_fps", "frame", "slow_frames_over_33ms", "slow_frames_over_50ms", "top_frame_stages", "top_gpu_passes", "segments", "graphics_settings"])) return false;
  if (r.schema !== 1 || typeof r.game_version !== "string" || r.game_version.length > 64
    || !safeInteger(r.session_seconds, 0, 7 * 24 * 3600)
    || !finiteNumber(r.average_fps, 0, 100_000)
    || !safeInteger(r.slow_frames_over_33ms, 0, 10_000_000)
    || !safeInteger(r.slow_frames_over_50ms, 0, 10_000_000)
    || !isDistribution(r.frame) || !isStageList(r.top_frame_stages)) return false;
  if (!Array.isArray(r.top_gpu_passes) || r.top_gpu_passes.length > 16 || !r.top_gpu_passes.every((pass) => {
    if (!pass || typeof pass !== "object" || Array.isArray(pass)) return false;
    const p = pass as Record<string, unknown>;
    return hasOnlyKeys(p, ["pass", "mean_ms", "samples"]) && typeof p.pass === "string"
      && (p.pass === "(all passes)" || /^[a-zA-Z0-9_. +:-]{1,80}$/.test(p.pass))
      && finiteNumber(p.mean_ms, 0, 10_000)
      && safeInteger(p.samples, 0, 10_000_000);
  })) return false;
  if (r.gpu_adapter !== null && (typeof r.gpu_adapter !== "string" || r.gpu_adapter.length > 160)) return false;
  const p = r.platform as Record<string, unknown> | null;
  if (!p || typeof p !== "object" || Array.isArray(p) || !hasOnlyKeys(p, ["os", "arch", "logical_threads", "memory_mb"])) return false;
  if (!(["windows", "macos", "linux", "freebsd", "unknown"] as unknown[]).includes(p.os)
    || typeof p.arch !== "string" || !/^[a-zA-Z0-9_]{1,24}$/.test(p.arch)
    || !safeInteger(p.logical_threads, 0, 1024)
    || (p.memory_mb !== null && !safeInteger(p.memory_mb, 0, 10_000_000))) return false;
  const segments = r.segments as Record<string, unknown> | null;
  if (!segments || typeof segments !== "object" || Array.isArray(segments) || Object.keys(segments).length > 24) return false;
  for (const [key, raw] of Object.entries(segments)) {
    if (!/^(driver|passenger|on_foot|external)_traffic_(0_19|20_99|100_plus)_(paused|running)$/.test(key)
      || !raw || typeof raw !== "object" || Array.isArray(raw)) return false;
    const segment = raw as Record<string, unknown>;
    if (!hasOnlyKeys(segment, ["frame", "top_frame_stages"]) || !isDistribution(segment.frame) || !isStageList(segment.top_frame_stages)) return false;
  }
  const settings = r.graphics_settings as Record<string, unknown> | null;
  if (!settings || typeof settings !== "object" || Array.isArray(settings) || Object.keys(settings).length > 10) return false;
  const allowedSettings = ["graphics", "msaa", "post_aa", "upscaler", "render_scale", "shadows", "ssao", "reflections", "vsync", "max_fps"];
  return Object.entries(settings).every(([key, setting]) => allowedSettings.includes(key)
    && ((typeof setting === "string" && setting.length <= 32)
      || typeof setting === "boolean"
      || (typeof setting === "number" && Number.isFinite(setting) && Math.abs(setting) <= 10_000)));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST" || new URL(request.url).pathname !== "/v1/report") return reply(404, "not found");
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return reply(415, "expected JSON");
    const length = Number(request.headers.get("content-length") ?? 0);
    if (length > MAX_BODY_BYTES) return reply(413, "report too large");
    const ip = request.headers.get("CF-Connecting-IP");
    if (!ip) return reply(400, "missing client address");
    const { success } = await env.RATE_LIMITER.limit({ key: ip });
    if (!success) return reply(429, "rate limited");
    const reader = request.body?.getReader();
    if (!reader) return reply(400, "missing body");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return reply(413, "report too large");
      }
      chunks.push(value);
    }
    const bodyBytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bodyBytes.set(chunk, offset); offset += chunk.byteLength; }
    const body = new TextDecoder().decode(bodyBytes);
    let report: unknown;
    try { report = JSON.parse(body); } catch { return reply(400, "invalid JSON"); }
    if (!validReport(report)) return reply(400, "invalid report");
    await env.REPORTS.prepare("INSERT INTO reports (created_at, game_version, report_json) VALUES (?, ?, ?)")
      .bind(new Date().toISOString(), report.game_version, JSON.stringify(report)).run();
    return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
  },

  async scheduled(_event: ScheduledController, env: Env): Promise<void> {
    await env.REPORTS.prepare("DELETE FROM reports WHERE created_at < ?")
      .bind(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()).run();
  },
} satisfies ExportedHandler<Env>;
