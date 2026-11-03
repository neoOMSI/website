import assert from "node:assert/strict";
import { test } from "node:test";
import { EXAMPLE_REPORT } from "./example-report.ts";
import worker from "./src/index.ts";

const distribution = {
  frames: 60,
  mean_ms: 20,
  p50_ms: 16,
  p95_ms: 33,
  p99_ms: 50,
  max_ms: 100,
};

function report() {
  return {
    schema: 1,
    game_version: "0.3.0",
    platform: { os: "linux", arch: "x86_64", logical_threads: 8, memory_mb: 8192 },
    gpu_adapter: null,
    session_seconds: 60,
    average_fps: 50,
    frame: distribution,
    slow_frames_over_33ms: 2,
    slow_frames_over_50ms: 1,
    top_frame_stages: [{ stage: "render", mean_ms_per_frame: 8 }],
    top_gpu_passes: [{ pass: "(all passes)", mean_ms: 1.25, samples: 60 }],
    segments: {
      driver_traffic_20_99_running: {
        frame: distribution,
        top_frame_stages: [{ stage: "render", mean_ms_per_frame: 8 }],
      },
    },
    graphics_settings: { graphics: "enhanced", msaa: 4 },
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

test("stores a valid summary without storing the caller IP", async () => {
  const h = harness();
  const response = await worker.fetch(request(report()), h.env);

  assert.equal(response.status, 204);
  assert.equal(h.inserted.length, 1);
  assert.equal(h.inserted[0][1], "0.3.0");
  assert.equal(JSON.parse(h.inserted[0][2]).frame.p95_ms, 33);
  assert.equal(h.inserted[0].length, 3);
});

test("privacy-page example matches the accepted report schema", async () => {
  const h = harness();
  const response = await worker.fetch(request(EXAMPLE_REPORT), h.env);

  assert.equal(response.status, 204);
  assert.equal(h.inserted.length, 1);
  assert.equal(JSON.parse(h.inserted[0][2]).game_version, EXAMPLE_REPORT.game_version);
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
