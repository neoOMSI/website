# Performance report service

The game posts one bounded, anonymous performance summary to `https://telemetry.neoomsi.com/v1/report` after a player session. Reports include frame-time percentiles and hitches from gameplay redraws; hidden idle redraws are skipped, while slow acquisition hitches are retained. They also include selected CPU work stages, grouped summaries by camera view/traffic/pause state, selected graphics settings, and GPU adapter plus render-pass timings where timestamp queries are supported. CPU stage values subtract directly nested child timings from parents and omit known waits and broad aggregate scopes. This Worker validates a strict schema, applies a per-IP request limit, stores reports in D1, and removes records older than 30 days. It does not write IP addresses to D1. Cloudflare still processes request connection metadata; see `/privacy/telemetry/` on the project site.

## First deployment

From `website/`:

```sh
npx wrangler d1 create neoomsi-performance-reports
```

Replace the example database ID in `telemetry/wrangler.jsonc` with the returned ID, then:

```sh
npx wrangler d1 migrations apply neoomsi-performance-reports --remote --config telemetry/wrangler.jsonc
npx wrangler deploy --config telemetry/wrangler.jsonc
```

Run the endpoint validation and retention tests with `npm run test:telemetry` (Node 24+).
The website GitHub Actions workflow runs these tests and a Worker dry run on pull requests, then deploys the Worker with the main site after a push to `main`.

Configure `telemetry.neoomsi.com` in the Cloudflare account before enabling reports in a public game release. The D1 database and Worker are on Cloudflare’s free tiers but share account quotas and can stop accepting reports if a limit is reached. The rate limit is approximately 30 requests per minute per source IP in each Cloudflare location; the binding uses the IP transiently and the application stores no IP.

## Reviewing and removing reports

Only maintainers with access to the Cloudflare account should query the D1 database. For example:

```sh
npx wrangler d1 execute neoomsi-performance-reports --remote --config telemetry/wrangler.jsonc --command "SELECT game_version, report_json FROM reports ORDER BY created_at DESC LIMIT 100"
```

Useful starting queries for bottleneck work:

```sql
SELECT game_version, count(*) AS sessions,
       round(avg(json_extract(report_json, '$.frame.p95_ms')), 1) AS avg_p95_ms,
       sum(json_extract(report_json, '$.slow_frames_over_50ms')) AS hitches_over_50ms
FROM reports
GROUP BY game_version
ORDER BY sessions DESC;

SELECT json_extract(stage.value, '$.stage') AS stage,
       round(avg(json_extract(stage.value, '$.mean_ms_per_frame')), 2) AS avg_ms_per_frame,
       count(*) AS sessions
FROM reports, json_each(report_json, '$.top_frame_stages') AS stage
GROUP BY 1
ORDER BY avg_ms_per_frame DESC
LIMIT 20;

SELECT segment.key AS situation,
       json_extract(stage.value, '$.stage') AS stage,
       round(avg(json_extract(stage.value, '$.mean_ms_per_frame')), 2) AS avg_ms_per_frame,
       count(*) AS sessions
FROM reports,
     json_each(report_json, '$.segments') AS segment,
     json_each(segment.value, '$.top_frame_stages') AS stage
GROUP BY 1, 2
ORDER BY avg_ms_per_frame DESC
LIMIT 40;

SELECT segment.key AS situation,
       round(avg(json_extract(segment.value, '$.frame.p95_ms')), 1) AS avg_p95_ms,
       count(*) AS sessions
FROM reports, json_each(report_json, '$.segments') AS segment
GROUP BY 1
ORDER BY avg_p95_ms DESC;

SELECT json_extract(pass.value, '$.pass') AS pass,
       round(avg(json_extract(pass.value, '$.mean_ms')), 2) AS avg_gpu_ms,
       count(*) AS sessions
FROM reports, json_each(report_json, '$.top_gpu_passes') AS pass
GROUP BY 1
ORDER BY avg_gpu_ms DESC
LIMIT 20;
```

Daily scheduled cleanup deletes reports after 30 days. To remove all reports manually, run `DELETE FROM reports;` through `wrangler d1 execute`. Reports intentionally have no per-player identifier, so individual reports cannot be located or deleted on request.

The endpoint accepts schema versions 2 and 3, rejects unknown fields and payloads over 32 KiB, and returns no report data to callers. Do not add raw logs, paths, maps, vehicle names, account IDs, or device identifiers to the schema.
