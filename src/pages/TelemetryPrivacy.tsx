import { useTitle } from "../lib/hooks";

export function TelemetryPrivacy() {
  useTitle("Performance report privacy");
  return (
    <article className="wrap max-w-3xl py-28">
      <h1 className="text-4xl font-bold">Performance report privacy</h1>
      <p className="mt-6 text-muted">Optional performance reports help the neoOMSI team find slow frames and identify which parts of the game need attention. Sharing is off by default and can be turned off in the game’s Privacy and diagnostics options.</p>
      <h2 className="mt-10 text-2xl font-semibold">What a report contains</h2>
      <p className="mt-3 text-muted">A report contains the game version; operating system, processor architecture, logical thread count and approximate memory; GPU adapter model; session duration; average FPS, frame time percentiles, worst frame time and hitch counts; the slowest measured frame stages; GPU render-pass timings when supported; performance summaries grouped by camera view, traffic amount and pause state; and selected graphics settings. Frame-stage timings can include renderer or frame-pacing waits.</p>
      <p className="mt-3 text-muted">GPU timing may begin after the next game launch if you opt in while the game is already running.</p>
      <p className="mt-3 text-muted">Reports do not contain logs, account or device identifiers, map or vehicle names, file paths, command-line arguments, or raw frame-by-frame traces. Reports are sent once when a gameplay session ends. If sending fails, the game discards the report and does not retry.</p>
      <h2 className="mt-10 text-2xl font-semibold">Who receives it and retention</h2>
      <p className="mt-3 text-muted">Reports are sent to neoOMSI’s performance collection service, hosted by Cloudflare, and stored in a database accessible to project maintainers with the receipt time. Reports are automatically deleted after 30 days. The collection service does not store the sender’s IP address in its report database. Cloudflare processes the network request and may process connection data, including IP addresses, under its own policies.</p>
      <h2 className="mt-10 text-2xl font-semibold">Your choice</h2>
      <p className="mt-3 text-muted">Sharing is voluntary. Turn off “Share anonymous performance reports” at any time to stop future collection and sending. Reports have no player identifier, so maintainers cannot look up or delete one person’s report.</p>
    </article>
  );
}
