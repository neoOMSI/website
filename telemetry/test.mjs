import assert from "node:assert/strict";
import { test } from "node:test";
import { EXAMPLE_REPORT } from "./example-report.ts";
import worker from "./src/index.ts";

function report() {
  return JSON.parse(JSON.stringify(EXAMPLE_REPORT));
}

function schema2Report() {
  return {
    schema: 2,
    game_version: "0.4.0-nightly.g5005a6fc",
    platform: {
      arch: "x86_64",
      logical_threads: 16,
      memory_mb: 34264,
      os: "windows",
    },
    gpu: null,
    display: {
      resolution_class: "1080p",
      vsync: false,
    },
    preset: "custom",
    graphics_settings: {
      max_fps: 1000,
      msaa: 8,
      post_aa: "fxaa",
      reflections: true,
      render_scale: 0.0,
      shadows: true,
      ssao: true,
      upscaler: "off",
      vsync: false,
    },
    session_seconds: 106,
    average_fps: 10.27,
    frame: {
      frames: 1061,
      max_ms: 1213.44,
      mean_ms: 97.38,
      p50_ms: 88.0,
      p95_ms: 136.5,
      p99_ms: 146.0,
    },
    slow_frames_over_33ms: 1055,
    slow_frames_over_50ms: 1047,
    limit_share: {
      cap: 0.0,
      cpu: 0.068,
      gpu: 0.932,
      mixed: 0.0,
      sim: 0.0,
    },
    frame_split_ms: {
      gap: 0.2,
      outside: 1.42,
      wait: 58.17,
      work: 37.61,
    },
    stages: [
      {
        max_ms: 21.92,
        mean_ms: 10.253,
        p95_ms: 16.481,
        stage: "render",
      },
    ],
    waits: [
      {
        max_ms: 104.0,
        mean_ms: 58.163,
        p95_ms: 101.405,
        stage: "acquire",
      },
    ],
    hitches: {
      causes: [
        {
          cause: "acquire",
          mean_ms: 86.48,
          share: 0.985,
        },
      ],
      count: 194,
      limit_share: {
        cap: 0.0,
        cpu: 0.015,
        gpu: 0.985,
        mixed: 0.0,
        sim: 0.0,
      },
      mean_ms: 132.62,
      per_minute: 109.69,
    },
    scene: {
      instances: {
        "100k_300k": 0.8,
        "10k_30k": 0.037,
        "30k_100k": 0.163,
      },
      people: {
        "200_plus": 1.0,
      },
      traffic: {
        traffic_0_19: 0.034,
        traffic_20_99: 0.966,
      },
    },
    top_frame_stages: [
      {
        mean_ms_per_frame: 10.253,
        stage: "render",
      },
    ],
    top_gpu_passes: [
      {
        mean_ms: 52.889,
        pass: "(all passes)",
        samples: 5,
      },
    ],
    segments: {
      driver_traffic_0_19_running: {
        frame: {
          frames: 36,
          max_ms: 1213.44,
          mean_ms: 110.59,
          p50_ms: 82.5,
          p95_ms: 90.5,
          p99_ms: 250.0,
        },
        top_frame_stages: [
          {
            mean_ms_per_frame: 8.273,
            stage: "streaming",
          },
        ],
      },
    },
  };
}

function harness({ limited = false } = {}) {
  const inserted = [];
  const statements = [];
  const bound = [];
  const env = {
    RATE_LIMITER: { limit: async ({ key }) => ({ success: !limited && key === "203.0.113.4" }) },
    REPORTS: {
      prepare(sql) {
        statements.push(sql);
        return {
          bind(...values) {
            bound.push({ sql, values });
            return {
              run: async () => {
                if (sql.startsWith("INSERT")) inserted.push(values);
              },
            };
          },
        };
      },
    },
  };
  return { env, inserted, statements, bound };
}

function request(body) {
  return new Request("https://telemetry.neoomsi.com/v1/report", {
    method: "POST",
    headers: { "content-type": "application/json", "CF-Connecting-IP": "203.0.113.4" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("stores a valid Schema 3 summary without storing the caller IP", async () => {
  const h = harness();
  const response = await worker.fetch(request(report()), h.env);

  assert.equal(response.status, 204);
  assert.equal(h.inserted.length, 1);
  assert.equal(h.inserted[0][1], "0.4.0-nightly.g5005a6fc");
  const stored = JSON.parse(h.inserted[0][2]);
  assert.equal(stored.schema, 3);
  assert.equal(stored.frame.p95_ms, 19.5);
  assert.equal(stored.build.profile, "release");
  assert.equal(stored.platform.cpu, "AMD Ryzen 7 7800X3D 8-Core Processor");
  assert.equal(stored.gpu.vram_mb, 12288);
  assert.equal(stored.display.window_mode, "fullscreen");
  assert.equal(stored.hitches.size_buckets["33_50ms"], 2);
  assert.equal(stored.scene.vehicles_avg, 18.2);
  assert.equal(h.inserted[0].length, 3);
});

test("privacy-page example matches the accepted Schema 3 report schema", async () => {
  const h = harness();
  const response = await worker.fetch(request(EXAMPLE_REPORT), h.env);

  assert.equal(response.status, 204);
  assert.equal(h.inserted.length, 1);
  assert.equal(JSON.parse(h.inserted[0][2]).game_version, EXAMPLE_REPORT.game_version);
});

test("accepts a valid Schema 2 report", async () => {
  const h = harness();
  const response = await worker.fetch(request(schema2Report()), h.env);

  assert.equal(response.status, 204);
  assert.equal(h.inserted.length, 1);
  const stored = JSON.parse(h.inserted[0][2]);
  assert.equal(stored.schema, 2);
  assert.equal(stored.frame.p95_ms, 136.5);
});

test("accepts a Schema 3 report with nullable fields omitted or null", async () => {
  const h = harness();
  const minimalScene = { ...report().scene };
  delete minimalScene.time_of_day;
  const nullableReport = {
    ...report(),
    gpu: null,
    platform: {
      ...report().platform,
      cpu: null,
      os_version: null,
      physical_cores: null,
    },
    display: {
      ...report().display,
      window_mode: null,
      refresh_rate_hz: null,
      render_resolution: null,
      output_resolution: null,
    },
    warmup: {
      seconds_excluded: 0,
      stats_exclude_warmup: false,
      first_30s_frame: null,
    },
    memory: {
      peak_process_ram_mb: null,
    },
    scene: minimalScene,
  };
  const response = await worker.fetch(request(nullableReport), h.env);
  assert.equal(response.status, 204);
  assert.equal(h.inserted.length, 1);
});

test("accepts a Schema 2 report with full gpu details", async () => {
  const h = harness();
  const reportWithGpu = {
    ...schema2Report(),
    gpu: {
      adapter: "NVIDIA GeForce RTX 5070 (Vulkan)",
      backend: "Vulkan",
      driver: "NVIDIA",
      driver_info: "617.42",
      type: "DiscreteGpu",
      vendor: "0x10de",
    },
  };
  const response = await worker.fetch(request(reportWithGpu), h.env);

  assert.equal(response.status, 204);
  assert.equal(h.inserted.length, 1);
  const stored = JSON.parse(h.inserted[0][2]);
  assert.equal(stored.gpu.adapter, "NVIDIA GeForce RTX 5070 (Vulkan)");
});

test("rejects Schema 2 reports carrying Schema 3 keys", async () => {
  const cases = [
    { ...schema2Report(), build: { commit: "5005a6fc", profile: "release", features: [] } },
    { ...schema2Report(), low_1pct_fps: 45.12 },
    { ...schema2Report(), low_01pct_fps: 31.25 },
    { ...schema2Report(), warmup: { seconds_excluded: 0, stats_exclude_warmup: false, first_30s_frame: null } },
    { ...schema2Report(), memory: { peak_process_ram_mb: 2450 } },
    { ...schema2Report(), limiter: { active: false, paced_frame_share: 0.02 } },
    { ...schema2Report(), gpu: { adapter: "GPU", backend: "Vulkan", driver: "d", driver_info: "di", type: "t", vendor: "v", vram_mb: 8192 } },
    { ...schema2Report(), platform: { ...schema2Report().platform, cpu: "AMD Ryzen" } },
    { ...schema2Report(), platform: { ...schema2Report().platform, os_version: "Windows 11" } },
    { ...schema2Report(), platform: { ...schema2Report().platform, physical_cores: 8 } },
    { ...schema2Report(), display: { ...schema2Report().display, window_mode: "fullscreen" } },
    { ...schema2Report(), display: { ...schema2Report().display, hdr: false } },
    { ...schema2Report(), display: { ...schema2Report().display, refresh_rate_hz: 144 } },
    { ...schema2Report(), display: { ...schema2Report().display, render_resolution: [1920, 1080] } },
    { ...schema2Report(), display: { ...schema2Report().display, output_resolution: [1920, 1080] } },
    { ...schema2Report(), frame: { ...schema2Report().frame, p99_9_ms: 32.0 } },
    { ...schema2Report(), frame: { ...schema2Report().frame, histogram: report().frame.histogram } },
    { ...schema2Report(), hitches: { ...schema2Report().hitches, size_buckets: report().hitches.size_buckets } },
    { ...schema2Report(), hitches: { ...schema2Report().hitches, slowest: [{ cause: "traffic.tick", ms: 120 }] } },
    { ...schema2Report(), scene: { ...schema2Report().scene, rain: false } },
    { ...schema2Report(), scene: { ...schema2Report().scene, time_of_day: "14:30" } },
    { ...schema2Report(), scene: { ...schema2Report().scene, vehicles_avg: 18.2 } },
  ];

  for (const c of cases) {
    const h = harness();
    const response = await worker.fetch(request(c), h.env);
    assert.equal(response.status, 400);
    assert.equal(h.inserted.length, 0);
  }
});

test("rejects Schema 1 reports", async () => {
  const h = harness();
  const schema1Report = {
    schema: 1,
    game_version: "0.3.0",
    platform: { os: "linux", arch: "x86_64", logical_threads: 8, memory_mb: 8192 },
    gpu_adapter: null,
    session_seconds: 60,
    average_fps: 50,
    frame: { frames: 60, mean_ms: 20, p50_ms: 16, p95_ms: 33, p99_ms: 50, max_ms: 100 },
    slow_frames_over_33ms: 2,
    slow_frames_over_50ms: 1,
    top_frame_stages: [{ stage: "render", mean_ms_per_frame: 8 }],
    top_gpu_passes: [{ pass: "(all passes)", mean_ms: 1.25, samples: 60 }],
    segments: {},
    graphics_settings: { graphics: "enhanced" },
  };
  const response = await worker.fetch(request(schema1Report), h.env);
  assert.equal(response.status, 400);
  assert.equal(h.inserted.length, 0);
});

test("rejects unknown keys and oversized requests", async () => {
  const h = harness();
  assert.equal((await worker.fetch(request({ ...report(), player_id: "must-not-be-accepted" }), h.env)).status, 400);
  assert.equal((await worker.fetch(request({ ...schema2Report(), player_id: "must-not-be-accepted" }), h.env)).status, 400);
  assert.equal((await worker.fetch(request({ ...report(), build: { ...report().build, extra: "no" } }), h.env)).status, 400);
  assert.equal((await worker.fetch(request({ ...report(), platform: { ...report().platform, extra: "no" } }), h.env)).status, 400);
  assert.equal((await worker.fetch(request({ ...report(), display: { ...report().display, extra: "no" } }), h.env)).status, 400);
  assert.equal((await worker.fetch(request({ ...report(), hitches: { ...report().hitches, extra: "no" } }), h.env)).status, 400);
  assert.equal((await worker.fetch(request({ ...report(), scene: { ...report().scene, extra: "no" } }), h.env)).status, 400);
  assert.equal((await worker.fetch(request({ ...report(), warmup: { ...report().warmup, extra: "no" } }), h.env)).status, 400);
  assert.equal((await worker.fetch(request({ ...report(), limiter: { ...report().limiter, extra: "no" } }), h.env)).status, 400);
  assert.equal((await worker.fetch(request("x".repeat(32 * 1024 + 1)), h.env)).status, 413);
  assert.equal(h.inserted.length, 0);
});

test("rejects bad types and oversized strings", async () => {
  const badCases = [
    // commit caps / format
    { ...report(), build: { ...report().build, commit: "not-hex!" } },
    { ...report(), build: { ...report().build, commit: "a".repeat(41) } },
    // cpu caps
    { ...report(), platform: { ...report().platform, cpu: "x".repeat(65) } },
    // os_version caps
    { ...report(), platform: { ...report().platform, os_version: "x".repeat(65) } },
    // profile caps
    { ...report(), build: { ...report().build, profile: "x".repeat(17) } },
    // features count cap
    { ...report(), build: { ...report().build, features: Array(9).fill("feat") } },
    // time_of_day format
    { ...report(), scene: { ...report().scene, time_of_day: "25:00" } },
    { ...report(), scene: { ...report().scene, time_of_day: "noon" } },
    // slowest count cap
    { ...report(), hitches: { ...report().hitches, slowest: Array(4).fill({ cause: "traffic.tick", ms: 100 }) } },
    // histogram missing bucket
    { ...report(), frame: { ...report().frame, histogram: { under_8ms: 1 } } },
    // schema 3 frame missing schema 3 fields
    (() => { const f = { ...report().frame }; delete f.histogram; return { ...report(), frame: f }; })(),
    (() => { const f = { ...report().frame }; delete f.p99_9_ms; return { ...report(), frame: f }; })(),
    (() => { const f = { ...report().frame }; delete f.low_1pct_fps; return { ...report(), frame: f }; })(),
    (() => { const f = { ...report().frame }; delete f.low_01pct_fps; return { ...report(), frame: f }; })(),
    // size_buckets missing bucket
    { ...report(), hitches: { ...report().hitches, size_buckets: { "33_50ms": 1 } } },
    // window_mode invalid
    { ...report(), display: { ...report().display, window_mode: "invalid_mode" } },
    // vram_mb negative
    { ...report(), gpu: { ...report().gpu, vram_mb: -10 } },
    // physical_cores negative
    { ...report(), platform: { ...report().platform, physical_cores: -1 } },
  ];

  for (const c of badCases) {
    const h = harness();
    const response = await worker.fetch(request(c), h.env);
    assert.equal(response.status, 400);
    assert.equal(h.inserted.length, 0);
  }
});

test("applies the rate limit before writing", async () => {
  const h = harness({ limited: true });
  assert.equal((await worker.fetch(request(report()), h.env)).status, 429);
  assert.equal(h.inserted.length, 0);
});

test("scheduled cleanup deletes reports older than thirty days", async () => {
  const h = harness();
  await worker.scheduled({}, h.env);

  assert.equal(h.statements[0], "DELETE FROM reports WHERE created_at < ?");
  const cutoff = Date.parse(h.bound[0].values[0]);
  assert.ok(Date.now() - cutoff >= 30 * 24 * 60 * 60 * 1000 - 1000);
  assert.ok(Date.now() - cutoff <= 30 * 24 * 60 * 60 * 1000 + 1000);
  assert.equal(h.inserted.length, 0);
});
