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

const HISTOGRAM_BUCKETS = ["under_8ms", "8_12ms", "12_17ms", "17_25ms", "25_33ms", "33_50ms", "50_100ms", "over_100ms"];

function isHistogram(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const h = value as Record<string, unknown>;
  return hasOnlyKeys(h, HISTOGRAM_BUCKETS)
    && Object.keys(h).length === HISTOGRAM_BUCKETS.length
    && HISTOGRAM_BUCKETS.every((k) => safeInteger(h[k], 0, 10_000_000));
}

function isDistribution(value: unknown, schema = 2): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const d = value as Record<string, unknown>;
  const baseKeys = ["frames", "mean_ms", "p50_ms", "p95_ms", "p99_ms", "max_ms"];
  if (schema === 2) {
    return hasOnlyKeys(d, baseKeys)
      && safeInteger(d.frames, 0, 10_000_000)
      && finiteNumber(d.mean_ms, 0, 10_000) && finiteNumber(d.p50_ms, 0, 10_000)
      && finiteNumber(d.p95_ms, 0, 10_000) && finiteNumber(d.p99_ms, 0, 10_000)
      && finiteNumber(d.max_ms, 0, 10_000);
  }
  const allowedKeys3 = [...baseKeys, "p99_9_ms", "low_1pct_fps", "low_01pct_fps", "histogram"];
  if (!hasOnlyKeys(d, allowedKeys3)) return false;
  if (!safeInteger(d.frames, 0, 10_000_000)
    || !finiteNumber(d.mean_ms, 0, 10_000) || !finiteNumber(d.p50_ms, 0, 10_000)
    || !finiteNumber(d.p95_ms, 0, 10_000) || !finiteNumber(d.p99_ms, 0, 10_000)
    || !finiteNumber(d.max_ms, 0, 10_000)) return false;
  if (d.p99_9_ms !== undefined && !finiteNumber(d.p99_9_ms, 0, 10_000)) return false;
  if (d.low_1pct_fps !== undefined && !finiteNumber(d.low_1pct_fps, 0, 100_000)) return false;
  if (d.low_01pct_fps !== undefined && !finiteNumber(d.low_01pct_fps, 0, 100_000)) return false;
  if (d.histogram !== undefined && !isHistogram(d.histogram)) return false;
  return true;
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

const SCHEMA_2_KEYS = [
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

const SCHEMA_3_KEYS = [
  ...SCHEMA_2_KEYS,
  "build",
  "low_1pct_fps",
  "low_01pct_fps",
  "warmup",
  "memory",
  "limiter",
];

const HITCH_SIZE_BUCKETS = ["33_50ms", "50_100ms", "100_250ms", "over_250ms"];

function validReport(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const r = value as Record<string, unknown>;

  if (r.schema !== 2 && r.schema !== 3) return false;
  const schema = r.schema;

  if (!hasOnlyKeys(r, schema === 3 ? SCHEMA_3_KEYS : SCHEMA_2_KEYS)) return false;
  if (typeof r.game_version !== "string" || r.game_version.length > 64) return false;
  if (!safeInteger(r.session_seconds, 0, 7 * 24 * 3600)) return false;
  if (!finiteNumber(r.average_fps, 0, 100_000)) return false;
  if (schema === 3) {
    if (!finiteNumber(r.low_1pct_fps, 0, 100_000) || !finiteNumber(r.low_01pct_fps, 0, 100_000)) return false;
  }
  if (!safeInteger(r.slow_frames_over_33ms, 0, 10_000_000)) return false;
  if (!safeInteger(r.slow_frames_over_50ms, 0, 10_000_000)) return false;
  if (!isDistribution(r.frame, schema)) return false;
  if (schema === 3) {
    const f = r.frame as Record<string, unknown>;
    if (f.p99_9_ms === undefined || f.low_1pct_fps === undefined || f.low_01pct_fps === undefined || f.histogram === undefined) return false;
  }
  if (!isLimitShare(r.limit_share)) return false;

  // build (schema 3 only)
  if (schema === 3) {
    const b = r.build as Record<string, unknown> | null;
    if (!b || typeof b !== "object" || Array.isArray(b) || !hasOnlyKeys(b, ["commit", "profile", "features"])) return false;
    if (typeof b.commit !== "string" || !/^[0-9a-fA-F]{1,40}$/.test(b.commit)) return false;
    if (typeof b.profile !== "string" || !/^[a-zA-Z0-9_-]{1,16}$/.test(b.profile)) return false;
    if (!Array.isArray(b.features) || b.features.length > 8
      || !b.features.every((feat) => typeof feat === "string" && /^[a-zA-Z0-9_-]{1,32}$/.test(feat))) return false;
  }

  // platform
  const p = r.platform as Record<string, unknown> | null;
  if (!p || typeof p !== "object" || Array.isArray(p)) return false;
  const platformKeys = schema === 3
    ? ["os", "os_version", "arch", "cpu", "logical_threads", "physical_cores", "memory_mb"]
    : ["os", "arch", "logical_threads", "memory_mb"];
  if (!hasOnlyKeys(p, platformKeys)) return false;
  if (!(["windows", "macos", "linux", "freebsd", "unknown"] as unknown[]).includes(p.os)
    || typeof p.arch !== "string" || !/^[a-zA-Z0-9_]{1,24}$/.test(p.arch)
    || !safeInteger(p.logical_threads, 0, 1024)
    || (p.memory_mb !== null && !safeInteger(p.memory_mb, 0, 10_000_000))) return false;
  if (schema === 3) {
    if (p.os_version !== null && (typeof p.os_version !== "string" || p.os_version.length > 64)) return false;
    if (p.cpu !== null && (typeof p.cpu !== "string" || p.cpu.length > 64)) return false;
    if (p.physical_cores !== null && !safeInteger(p.physical_cores, 0, 1024)) return false;
  }

  // gpu
  if (r.gpu !== null) {
    if (typeof r.gpu !== "object" || Array.isArray(r.gpu)) return false;
    const g = r.gpu as Record<string, unknown>;
    const gpuKeys = schema === 3
      ? ["adapter", "backend", "type", "vendor", "driver", "driver_info", "vram_mb"]
      : ["adapter", "backend", "type", "vendor", "driver", "driver_info"];
    if (!hasOnlyKeys(g, gpuKeys)) return false;
    if (typeof g.adapter !== "string" || g.adapter.length > 160) return false;
    if (typeof g.backend !== "string" || g.backend.length > 16) return false;
    if (typeof g.type !== "string" || g.type.length > 24) return false;
    if (typeof g.vendor !== "string" || !/^[a-zA-Z0-9_#x]{1,16}$/.test(g.vendor)) return false;
    if (typeof g.driver !== "string" || g.driver.length > 64) return false;
    if (typeof g.driver_info !== "string" || g.driver_info.length > 64) return false;
    if (schema === 3 && g.vram_mb !== undefined && g.vram_mb !== null && !safeInteger(g.vram_mb, 0, 1_000_000)) return false;
  }

  // display
  if (!r.display || typeof r.display !== "object" || Array.isArray(r.display)) return false;
  const disp = r.display as Record<string, unknown>;
  const displayKeys = schema === 3
    ? ["resolution_class", "vsync", "window_mode", "refresh_rate_hz", "render_resolution", "output_resolution", "hdr"]
    : ["resolution_class", "vsync"];
  if (!hasOnlyKeys(disp, displayKeys)) return false;
  if (disp.resolution_class !== null && !(["below_720p", "720p", "1080p", "1440p", "2160p", "above_2160p"] as unknown[]).includes(disp.resolution_class)) return false;
  if (disp.vsync !== null && typeof disp.vsync !== "boolean") return false;
  if (schema === 3) {
    if (disp.window_mode !== null && (typeof disp.window_mode !== "string" || !["fullscreen", "borderless", "windowed"].includes(disp.window_mode))) return false;
    if (disp.refresh_rate_hz !== null && !safeInteger(disp.refresh_rate_hz, 0, 1000)) return false;
    const isResPair = (val: unknown) => val === null || (Array.isArray(val) && val.length === 2 && safeInteger(val[0], 1, 32768) && safeInteger(val[1], 1, 32768));
    if (!isResPair(disp.render_resolution) || !isResPair(disp.output_resolution)) return false;
    if (typeof disp.hdr !== "boolean") return false;
  }

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

  // warmup (schema 3 only)
  if (schema === 3) {
    const w = r.warmup as Record<string, unknown> | null;
    if (!w || typeof w !== "object" || Array.isArray(w) || !hasOnlyKeys(w, ["seconds_excluded", "stats_exclude_warmup", "first_30s_frame"])) return false;
    if (!safeInteger(w.seconds_excluded, 0, 10_000)) return false;
    if (typeof w.stats_exclude_warmup !== "boolean") return false;
    if (w.first_30s_frame !== null && !isDistribution(w.first_30s_frame, 3)) return false;
  }

  // memory (schema 3 only)
  if (schema === 3) {
    const m = r.memory as Record<string, unknown> | null;
    if (!m || typeof m !== "object" || Array.isArray(m) || !hasOnlyKeys(m, ["peak_process_ram_mb"])) return false;
    if (m.peak_process_ram_mb !== null && !safeInteger(m.peak_process_ram_mb, 0, 10_000_000)) return false;
  }

  // limiter (schema 3 only)
  if (schema === 3) {
    const lim = r.limiter as Record<string, unknown> | null;
    if (!lim || typeof lim !== "object" || Array.isArray(lim) || !hasOnlyKeys(lim, ["active", "paced_frame_share"])) return false;
    if (typeof lim.active !== "boolean") return false;
    if (!finiteNumber(lim.paced_frame_share, 0, 1.05)) return false;
  }

  // hitches
  const h = r.hitches as Record<string, unknown> | null;
  if (!h || typeof h !== "object" || Array.isArray(h)) return false;
  const hitchKeys = schema === 3
    ? ["count", "per_minute", "mean_ms", "limit_share", "causes", "size_buckets", "slowest"]
    : ["count", "per_minute", "mean_ms", "limit_share", "causes"];
  if (!hasOnlyKeys(h, hitchKeys)) return false;
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
  if (schema === 3) {
    const sb = h.size_buckets as Record<string, unknown> | null;
    if (!sb || typeof sb !== "object" || Array.isArray(sb)) return false;
    if (!hasOnlyKeys(sb, HITCH_SIZE_BUCKETS) || Object.keys(sb).length !== HITCH_SIZE_BUCKETS.length || !HITCH_SIZE_BUCKETS.every((k) => safeInteger(sb[k], 0, 10_000_000))) return false;
    if (!Array.isArray(h.slowest) || h.slowest.length > 3 || !h.slowest.every((s) => {
      if (!s || typeof s !== "object" || Array.isArray(s)) return false;
      const slow = s as Record<string, unknown>;
      return hasOnlyKeys(slow, ["cause", "ms"])
        && typeof slow.cause === "string" && /^[a-zA-Z0-9_. +:() -]{1,80}$/.test(slow.cause)
        && finiteNumber(slow.ms, 0, 100_000);
    })) return false;
  }

  // scene
  const sc = r.scene as Record<string, unknown> | null;
  if (!sc || typeof sc !== "object" || Array.isArray(sc)) return false;
  const sceneKeys = schema === 3
    ? ["instances", "traffic", "people", "vehicles_avg", "vehicles_max", "people_avg", "people_max", "time_of_day", "rain"]
    : ["instances", "traffic", "people"];
  if (!hasOnlyKeys(sc, sceneKeys)) return false;
  for (const name of ["instances", "traffic", "people"]) {
    const group = sc[name] as Record<string, unknown> | null;
    if (!group || typeof group !== "object" || Array.isArray(group)) return false;
    for (const [k, v] of Object.entries(group)) {
      if (typeof k !== "string" || k.length > 32 || !finiteNumber(v, 0, 1.05)) return false;
    }
  }
  if (schema === 3) {
    if (!finiteNumber(sc.vehicles_avg, 0, 100_000)) return false;
    if (!safeInteger(sc.vehicles_max, 0, 100_000)) return false;
    if (!finiteNumber(sc.people_avg, 0, 100_000)) return false;
    if (!safeInteger(sc.people_max, 0, 100_000)) return false;
    if (sc.time_of_day !== undefined && (typeof sc.time_of_day !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(sc.time_of_day))) return false;
    if (typeof sc.rain !== "boolean") return false;
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
    if (!hasOnlyKeys(segment, ["frame", "top_frame_stages"]) || !isDistribution(segment.frame, schema) || !isStageList(segment.top_frame_stages, 12)) return false;
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
