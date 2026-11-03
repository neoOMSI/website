export const EXAMPLE_REPORT = {
  schema: 1,
  game_version: "0.4.0-nightly.example",
  platform: {
    os: "windows",
    arch: "x86_64",
    logical_threads: 12,
    memory_mb: 32768,
  },
  gpu_adapter: "Example GPU model",
  session_seconds: 1800,
  average_fps: 58.8,
  frame: {
    frames: 105840,
    mean_ms: 17,
    p50_ms: 16,
    p95_ms: 28,
    p99_ms: 46,
    max_ms: 121,
  },
  slow_frames_over_33ms: 1200,
  slow_frames_over_50ms: 80,
  top_frame_stages: [
    { stage: "frame.render", mean_ms_per_frame: 6.2 },
    { stage: "traffic.tick", mean_ms_per_frame: 3.1 },
  ],
  top_gpu_passes: [
    { pass: "(all passes)", mean_ms: 8.5, samples: 90000 },
  ],
  segments: {
    driver_traffic_20_99_running: {
      frame: {
        frames: 50000,
        mean_ms: 16.8,
        p50_ms: 16,
        p95_ms: 25,
        p99_ms: 40,
        max_ms: 100,
      },
      top_frame_stages: [
        { stage: "frame.render", mean_ms_per_frame: 6.1 },
        { stage: "traffic.tick", mean_ms_per_frame: 3.4 },
      ],
    },
  },
  graphics_settings: {
    graphics: "high",
    msaa: 4,
    vsync: true,
  },
};
