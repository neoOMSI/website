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

function isStageList(value: unknown, maxLen = 12): boolean {
  return Array.isArray(value) && value.length <= maxLen && value.every((stage) => {
    if (!stage || typeof stage !== "object" || Array.isArray(stage)) return false;
    const s = stage as Record<string, unknown>;
    return hasOnlyKeys(s, ["stage", "mean_ms_per_frame"])
      && typeof s.stage === "string" && /^[a-zA-Z0-9_. +:-]{1,80}$/.test(s.stage)
      && finiteNumber(s.mean_ms_per_frame, 0, 10_000);
  });
}

function isStageHistList(value: unknown, maxLen = 16): boolean {
  return Array.isArray(value) && value.length <= maxLen && value.every((stage) => {
    if (!stage || typeof stage !== "object" || Array.isArray(stage)) return false;
    const s = stage as Record<string, unknown>;
    return hasOnlyKeys(s, ["stage", "mean_ms", "p95_ms", "max_ms"])
      && typeof s.stage === "string" && /^[a-zA-Z0-9_. +:-]{1,80}$/.test(s.stage)
      && finiteNumber(s.mean_ms, 0, 10_000)
      && finiteNumber(s.p95_ms, 0, 10_000)
      && finiteNumber(s.max_ms, 0, 10_000);
  });
}

function isLimitShare(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const ls = value as Record<string, unknown>;
  const keys = ["gpu", "cpu", "cap", "sim", "mixed"];
  return hasOnlyKeys(ls, keys) && keys.every((k) => finiteNumber(ls[k], 0, 1.05));
}

function validReport(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const r = value as Record<string, unknown>;
  const allowedKeys = [
    "schema",
    "game_version",
    "platform",
    "gpu",
    "display",
    "preset",
    "graphics_settings",
    "session_seconds",
    "average_fps",
    "frame",
    "slow_frames_over_33ms",
    "slow_frames_over_50ms",
    "limit_share",
    "frame_split_ms",
    "stages",
    "waits",
    "hitches",
    "scene",
    "top_frame_stages",
    "top_gpu_passes",
    "segments",
  ];
  if (!hasOnlyKeys(r, allowedKeys)) return false;

  // Schema 2 only (Schema 1 is rejected)
  if (r.schema !== 2 || typeof r.game_version !== "string" || r.game_version.length > 64) return false;
  if (!safeInteger(r.session_seconds, 0, 7 * 24 * 3600)) return false;
  if (!finiteNumber(r.average_fps, 0, 100_000)) return false;
  if (!safeInteger(r.slow_frames_over_33ms, 0, 10_000_000)) return false;
  if (!safeInteger(r.slow_frames_over_50ms, 0, 10_000_000)) return false;
  if (!isDistribution(r.frame)) return false;
  if (!isLimitShare(r.limit_share)) return false;

  // platform
  const p = r.platform as Record<string, unknown> | null;
  if (!p || typeof p !== "object" || Array.isArray(p) || !hasOnlyKeys(p, ["os", "arch", "logical_threads", "memory_mb"])) return false;
  if (!(["windows", "macos", "linux", "freebsd", "unknown"] as unknown[]).includes(p.os)
    || typeof p.arch !== "string" || !/^[a-zA-Z0-9_]{1,24}$/.test(p.arch)
    || !safeInteger(p.logical_threads, 0, 1024)
    || (p.memory_mb !== null && !safeInteger(p.memory_mb, 0, 10_000_000))) return false;

  // gpu
  if (r.gpu !== null) {
    if (typeof r.gpu !== "object" || Array.isArray(r.gpu)) return false;
    const g = r.gpu as Record<string, unknown>;
    if (!hasOnlyKeys(g, ["adapter", "backend", "type", "vendor", "driver", "driver_info"])) return false;
    if (typeof g.adapter !== "string" || g.adapter.length > 160) return false;
    if (typeof g.backend !== "string" || g.backend.length > 16) return false;
    if (typeof g.type !== "string" || g.type.length > 24) return false;
    if (typeof g.vendor !== "string" || !/^[a-zA-Z0-9_#x]{1,16}$/.test(g.vendor)) return false;
    if (typeof g.driver !== "string" || g.driver.length > 64) return false;
    if (typeof g.driver_info !== "string" || g.driver_info.length > 64) return false;
  }

  // display
  if (!r.display || typeof r.display !== "object" || Array.isArray(r.display)) return false;
  const disp = r.display as Record<string, unknown>;
  if (!hasOnlyKeys(disp, ["resolution_class", "vsync"])) return false;
  if (disp.resolution_class !== null && !(["below_720p", "720p", "1080p", "1440p", "2160p", "above_2160p"] as unknown[]).includes(disp.resolution_class)) return false;
  if (disp.vsync !== null && typeof disp.vsync !== "boolean") return false;

  // preset
  if (typeof r.preset !== "string" || !["custom", "low", "medium", "high", "ultra"].includes(r.preset)) return false;

  // graphics_settings
  const settings = r.graphics_settings as Record<string, unknown> | null;
  if (!settings || typeof settings !== "object" || Array.isArray(settings) || Object.keys(settings).length > 10) return false;
  const allowedSettings = ["graphics", "msaa", "post_aa", "upscaler", "render_scale", "shadows", "ssao", "reflections", "vsync", "max_fps"];
  if (!Object.entries(settings).every(([key, setting]) => allowedSettings.includes(key)
    && ((typeof setting === "string" && setting.length <= 32)
      || typeof setting === "boolean"
      || (typeof setting === "number" && Number.isFinite(setting) && Math.abs(setting) <= 10_000)))) return false;

  // frame_split_ms
  const split = r.frame_split_ms as Record<string, unknown> | null;
  if (!split || typeof split !== "object" || Array.isArray(split)) return false;
  const splitKeys = ["work", "wait", "gap", "outside"];
  if (!hasOnlyKeys(split, splitKeys) || !splitKeys.every((k) => finiteNumber(split[k], 0, 10_000))) return false;

  // stages & waits
  if (!isStageHistList(r.stages, 16) || !isStageHistList(r.waits, 16)) return false;

  // hitches
  const h = r.hitches as Record<string, unknown> | null;
  if (!h || typeof h !== "object" || Array.isArray(h)) return false;
  if (!hasOnlyKeys(h, ["count", "per_minute", "mean_ms", "limit_share", "causes"])) return false;
  if (!safeInteger(h.count, 0, 10_000_000) || !finiteNumber(h.per_minute, 0, 10_000) || !finiteNumber(h.mean_ms, 0, 10_000)) return false;
  if (!isLimitShare(h.limit_share)) return false;
  if (!Array.isArray(h.causes) || h.causes.length > 8 || !h.causes.every((c) => {
    if (!c || typeof c !== "object" || Array.isArray(c)) return false;
    const cause = c as Record<string, unknown>;
    return hasOnlyKeys(cause, ["cause", "share", "mean_ms"])
      && typeof cause.cause === "string" && /^[a-zA-Z0-9_. +:() -]{1,80}$/.test(cause.cause)
      && finiteNumber(cause.share, 0, 1.05)
      && finiteNumber(cause.mean_ms, 0, 10_000);
  })) return false;

  // scene
  const sc = r.scene as Record<string, unknown> | null;
  if (!sc || typeof sc !== "object" || Array.isArray(sc)) return false;
  if (!hasOnlyKeys(sc, ["instances", "traffic", "people"])) return false;
  for (const group of Object.values(sc)) {
    if (!group || typeof group !== "object" || Array.isArray(group)) return false;
    for (const [k, v] of Object.entries(group)) {
      if (typeof k !== "string" || k.length > 32 || !finiteNumber(v, 0, 1.05)) return false;
    }
  }

  // top_frame_stages
  if (!isStageList(r.top_frame_stages, 12)) return false;

  // top_gpu_passes
  if (!Array.isArray(r.top_gpu_passes) || r.top_gpu_passes.length > 16 || !r.top_gpu_passes.every((pass) => {
    if (!pass || typeof pass !== "object" || Array.isArray(pass)) return false;
    const p2 = pass as Record<string, unknown>;
    return hasOnlyKeys(p2, ["pass", "mean_ms", "samples"]) && typeof p2.pass === "string"
      && (p2.pass === "(all passes)" || p2.pass === "(sum of passes)" || /^[a-zA-Z0-9_. +:()-]{1,80}$/.test(p2.pass))
      && finiteNumber(p2.mean_ms, 0, 10_000)
      && safeInteger(p2.samples, 0, 10_000_000);
  })) return false;

  // segments
  const segments = r.segments as Record<string, unknown> | null;
  if (!segments || typeof segments !== "object" || Array.isArray(segments) || Object.keys(segments).length > 24) return false;
  for (const [key, raw] of Object.entries(segments)) {
    if (!/^[a-zA-Z0-9_]{1,64}$/.test(key) || !raw || typeof raw !== "object" || Array.isArray(raw)) return false;
    const segment = raw as Record<string, unknown>;
    if (!hasOnlyKeys(segment, ["frame", "top_frame_stages"]) || !isDistribution(segment.frame) || !isStageList(segment.top_frame_stages, 12)) return false;
  }

  return true;
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
