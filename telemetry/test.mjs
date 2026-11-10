import assert from "node:assert/strict";
import { test } from "node:test";
import { EXAMPLE_REPORT } from "./example-report.ts";
import worker from "./src/index.ts";

function report() {
  return JSON.parse(JSON.stringify(EXAMPLE_REPORT));
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

test("stores a valid Schema 2 summary without storing the caller IP", async () => {
  const h = harness();
  const response = await worker.fetch(request(report()), h.env);

  assert.equal(response.status, 204);
  assert.equal(h.inserted.length, 1);
  assert.equal(h.inserted[0][1], "0.4.0-nightly.g5005a6fc");
  const stored = JSON.parse(h.inserted[0][2]);
  assert.equal(stored.schema, 2);
  assert.equal(stored.frame.p95_ms, 136.5);
  assert.equal(h.inserted[0].length, 3);
});

test("privacy-page example matches the accepted Schema 2 report schema", async () => {
  const h = harness();
  const response = await worker.fetch(request(EXAMPLE_REPORT), h.env);

  assert.equal(response.status, 204);
  assert.equal(h.inserted.length, 1);
  assert.equal(JSON.parse(h.inserted[0][2]).game_version, EXAMPLE_REPORT.game_version);
});

test("accepts a report with full gpu details", async () => {
  const h = harness();
  const reportWithGpu = {
    ...report(),
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

test("rejects unknown fields and oversized requests", async () => {
  const h = harness();
  const invalid = { ...report(), player_id: "must-not-be-accepted" };
  assert.equal((await worker.fetch(request(invalid), h.env)).status, 400);
  assert.equal((await worker.fetch(request("x".repeat(32 * 1024 + 1)), h.env)).status, 413);
  assert.equal(h.inserted.length, 0);
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
