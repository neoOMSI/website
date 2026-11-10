export const EXAMPLE_REPORT = {
  schema: 2,
  game_version: "0.4.0-nightly.g5005a6fc",
  platform: {
    arch: "x86_64",
    logical_threads: 16,
    memory_mb: 34264,
    os: "windows",
  },
  gpu: {
    adapter: "NVIDIA GeForce RTX 5070 (Vulkan)",
    backend: "Vulkan",
    driver: "NVIDIA",
    driver_info: "617.42",
    type: "DiscreteGpu",
    vendor: "0x10de",
  },
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
    {
      max_ms: 22.65,
      mean_ms: 7.503,
      p95_ms: 18.953,
      stage: "mirrors",
    },
    {
      max_ms: 34.71,
      mean_ms: 4.01,
      p95_ms: 6.196,
      stage: "traffic.tick",
    },
    {
      max_ms: 27.73,
      mean_ms: 2.938,
      p95_ms: 7.125,
      stage: "humans",
    },
  ],
  waits: [
    {
      max_ms: 104.0,
      mean_ms: 58.163,
      p95_ms: 101.405,
      stage: "acquire",
    },
    {
      max_ms: 0.04,
      mean_ms: 0.005,
      p95_ms: 0.01,
      stage: "present",
    },
    {
      max_ms: 0.43,
      mean_ms: 0.002,
      p95_ms: 0.01,
      stage: "wait submit",
    },
  ],
  hitches: {
    causes: [
      {
        cause: "acquire",
        mean_ms: 86.48,
        share: 0.985,
      },
      {
        cause: "traffic.sync",
        mean_ms: 95.02,
        share: 0.01,
      },
      {
        cause: "traffic.tick",
        mean_ms: 34.71,
        share: 0.005,
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
      "traffic_0_19": 0.034,
      "traffic_20_99": 0.966,
    },
  },
  top_frame_stages: [
    {
      mean_ms_per_frame: 10.253,
      stage: "render",
    },
    {
      mean_ms_per_frame: 7.503,
      stage: "mirrors",
    },
    {
      mean_ms_per_frame: 4.01,
      stage: "traffic.tick",
    },
  ],
  top_gpu_passes: [
    {
      mean_ms: 52.889,
      pass: "(all passes)",
      samples: 5,
    },
    {
      mean_ms: 52.475,
      pass: "(sum of passes)",
      samples: 5,
    },
    {
      mean_ms: 24.591,
      pass: "window capture 2",
      samples: 3,
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
        {
          mean_ms_per_frame: 7.799,
          stage: "render",
        },
      ],
    },
  },
};
