import { useState, type ReactNode } from "react";
import { PageHead, Tag } from "../components/ui";
import { PLATFORMS, SERVERS, visitorBuild, type Build } from "../content/data";
import {
  date,
  megabytes,
  releases,
  version,
  type Release,
} from "../lib/github";
import { useAsync } from "../lib/hooks";
import { docPath, url } from "../lib/routes";
import { Icon, PlatformIcon } from "../components/icons";

const INSTALL: Record<string, ReactNode> = {
  Windows: (
    <>
      Extract the zip archive into any folder (for example, <code>C:\Games\neoOMSI</code>) and launch{" "}
      <code>neoomsi.exe</code>. On first run, Windows may show a standard "Windows protected your PC"
      prompt for unsigned community software: click <b>More info</b> and then <b>Run anyway</b>.
      When the launcher opens, point it to your Steam OMSI 2 folder.
    </>
  ),
  macOS: (
    <>
      Extract the archive and open <code>neoOMSI.app</code>. If macOS shows an unnotarized app prompt
      on first launch, open <b>System Settings &rarr; Privacy &amp; Security</b> and click{" "}
      <b>Open Anyway</b>. Point the launcher to your OMSI 2 directory.
    </>
  ),
  Linux: (
    <>
      Extract the archive and run <code>./neoomsi</code> (ensure the binary is executable with{" "}
      <code>chmod +x neoomsi</code>). A modern graphics driver supporting Vulkan 1.2+ is required
      (such as Mesa on Debian/Ubuntu/Fedora or Arch).
    </>
  ),
};

const TABS = Object.keys(INSTALL);
const DOWNLOAD_PLATFORMS = PLATFORMS;

const asset = (release: Release | null | undefined, build: Build) => {
  const file =
    release && `neoOMSI-${version(release)}-${build.key}.${build.ext || "zip"}`;
  return release?.assets.find((a) => a.name === file);
};

const CHANNELS = [
  { key: "stable", name: "Stable", icon: "check_circle" },
  { key: "rc", name: "Release candidate", icon: "flag" },
  { key: "nightly", name: "Nightly", icon: "nights_stay" },
] as const;

type Channel = (typeof CHANNELS)[number]["key"];

const releaseChannel = (release: Release): Channel | undefined => {
  if (!release.prerelease) return "stable";
  if (/-nightly\./i.test(release.tag_name)) return "nightly";
  if (/-rc\.\d+$/i.test(release.tag_name)) return "rc";
};

const newestRelease = (list: Release[], channel: Channel) => {
  const matching =
    list
      .filter((release) => releaseChannel(release) === channel)
      .sort(
        (a, b) => Date.parse(b.published_at) - Date.parse(a.published_at),
      )[0] ?? null;

  if (channel === "rc" && matching) {
    const stable = list.find((r) => releaseChannel(r) === "stable");
    if (
      stable &&
      Date.parse(matching.published_at) <= Date.parse(stable.published_at)
    ) {
      return null;
    }
  }

  return matching;
};

const families = (builds: Build[]) =>
  [...new Set(builds.map((b) => b.family))].map((family) =>
    builds.filter((b) => b.family === family),
  );

function BuildRow({
  build,
  release,
}: {
  build: Build;
  release?: Release | null;
}) {
  const file = asset(release, build);
  const body = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-heading">{build.arch}</span>
        <span className="block text-[14.5px] leading-snug text-muted">
          {build.note}
        </span>
      </span>
      {file ? (
        <span className="file-get flex shrink-0 items-center gap-1.5 text-[14px] text-muted">
          {megabytes(file.size)}
          <Icon name="download" size={20} />
        </span>
      ) : (
        <span className="shrink-0 text-[13.5px] text-muted">
          Not in this release
        </span>
      )}
    </>
  );
  return (
    <li>
      {file ? (
        <a
          className="file -mx-3"
          href={file.browser_download_url}
          download
          aria-label={`Download ${build.name}, ${megabytes(file.size)}`}
        >
          {body}
        </a>
      ) : (
        <div className="-mx-3 flex items-center gap-3 px-3 py-2.5">{body}</div>
      )}
    </li>
  );
}

function Tiles({
  builds,
  release,
  mine,
}: {
  builds: Build[];
  release?: Release | null;
  mine?: Build;
}) {
  return families(builds).map((group) => {
    const yours = group[0].family === mine?.family;
    return (
      <div key={group[0].family} className="card flex flex-col gap-3 p-5">
        <div className="flex items-center gap-3 text-heading">
          <span className={yours ? "text-accent" : ""}>
            <PlatformIcon build={group[0].key} size={26} />
          </span>
          <h3 className="text-[1.2rem]">{group[0].family}</h3>
          {yours && (
            <span className="ml-auto rounded-full bg-line px-2.5 py-0.5 text-[13.5px] font-medium text-accent">
              Your system
            </span>
          )}
        </div>
        <ul className="space-y-1">
          {group.map((build) => (
            <BuildRow key={build.key} build={build} release={release} />
          ))}
        </ul>
      </div>
    );
  });
}

const jump = () =>
  document.getElementById("dl-all")!.scrollIntoView({ behavior: "smooth" });

export function Download() {
  const mine = DOWNLOAD_PLATFORMS.find(
    (build) => build.key === visitorBuild()?.key,
  );
  const [tab, setTab] = useState(() =>
    TABS.includes(mine?.family ?? "") ? mine!.family : TABS[0],
  );
  const { data: releaseList, error: releaseError } = useAsync(releases, []);
  const [channel, setChannel] = useState<Channel | null>(null);
  const available = CHANNELS.flatMap((entry) => {
    const release = releaseList && newestRelease(releaseList, entry.key);
    return release ? [{ ...entry, release }] : [];
  });
  const selected =
    available.find((entry) => entry.key === channel) ?? available[0];
  const release = selected?.release;
  const file = mine && asset(release, mine);

  return (
    <>
      <PageHead>
        <h1 className="display">Download</h1>
        <p className="mt-6 max-w-[38em] text-[19px] text-muted">
          Download neoOMSI for Windows, macOS or Linux. An existing OMSI 2
          installation is required for maps, buses, and other game assets.
        </p>
        {available.length > 1 && (
          <div
            className="mt-8 flex flex-wrap gap-3"
            role="group"
            aria-label="Build channel"
          >
            {available.map((entry) => (
              <button
                key={entry.key}
                type="button"
                className={`${selected === entry ? "btn" : "btn-quiet"} gap-2`}
                aria-pressed={selected === entry}
                onClick={() => setChannel(entry.key)}
              >
                <Icon name={entry.icon} size={18} />
                {entry.name}
              </button>
            ))}
          </div>
        )}
        {release && (
          <div className="mt-8 max-w-[42em]">
            <div className="flex flex-wrap items-center gap-3">
              <Tag
                color={release.prerelease ? "#d8a020" : "#2da44e"}
                className="inline-flex items-center gap-1.5 py-0.5"
              >
                <Icon name={selected!.icon} size={15} />
                {selected!.name}
              </Tag>
              <span className="text-muted">
                {version(release)} · {date(release.published_at)}
              </span>
              <a className="link" href={release.html_url}>
                Release notes
              </a>
            </div>
            {release.prerelease && (
              <div className="card mt-4 flex gap-3 p-4">
                <span className="flex h-6 shrink-0 items-center text-accent">
                  <Icon name="info" size={22} />
                </span>
                <div className="min-w-0 text-[16px] leading-6">
                  <p className="font-semibold text-heading">
                    {selected?.key === "rc"
                      ? "Release candidate"
                      : "Preview build"}
                  </p>
                  <p className="mt-1 text-muted">
                    {selected?.key === "rc"
                      ? "Pre-release version undergoing final testing before general release."
                      : "Early development build with the latest compatibility fixes and features. Ideal for testing and reporting feedback."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        {releaseError ? (
          <p className="mt-6 text-muted">
            Could not load downloads.{" "}
            <a
              className="link"
              href="https://github.com/neoOMSI/neoOMSI/releases"
            >
              View releases on GitHub
            </a>
            .
          </p>
        ) : releaseList === undefined ? (
          <p className="mt-6 text-muted">Loading available builds…</p>
        ) : !release ? (
          <p className="mt-6 text-muted">No builds have been published yet.</p>
        ) : null}
        {release && (
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {mine && file ? (
              <>
                <a
                  className="btn gap-2"
                  href={file.browser_download_url}
                  download
                >
                  <PlatformIcon build={mine.key} size={20} />
                  Download
                  {release.prerelease
                    ? ` ${selected!.name.toLowerCase()}`
                    : ""}{" "}
                  for {mine.name}
                </a>
                <button
                  type="button"
                  onClick={jump}
                  className="link text-[16px]"
                >
                  Other systems
                </button>
              </>
            ) : (
              <button type="button" onClick={jump} className="btn gap-2">
                <Icon name="download" size={20} />
                Choose a build
              </button>
            )}
          </div>
        )}
        <p className="mt-8 flex max-w-[34em] gap-3 text-[16px] text-muted">
          <Icon
            name="info"
            size={20}
            style={{ marginTop: 3, color: "var(--color-accent)" }}
          />
          <span>
            Needs an installed copy of OMSI&nbsp;2. On the first start, point
            the launcher to its folder, the one with <code>maps</code> and{" "}
            <code>Vehicles</code>. Nothing in it is changed.
          </span>
        </p>
      </PageHead>

      {release && (
        <section className="wrap">
          <h2 id="dl-all" className="section-title scroll-mt-24">
            Download for your system
          </h2>
          <p className="mt-2 text-muted">
            Choose your operating system and processor. All downloads below are
            from the selected {selected!.name.toLowerCase()} build.
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Tiles builds={DOWNLOAD_PLATFORMS} release={release} mine={mine} />
          </div>
        </section>
      )}

      <div className="wrap pb-20 sm:pb-24">
        <div className="mt-24 grid grid-cols-[minmax(0,1fr)] gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
            <h2 className="section-title">Installing</h2>
            <p className="mt-3 max-w-[24em] text-[16px] text-muted">
              Put mod folders or .zip archives in the <code>Mods</code> folder next
              to the game, or manage them on the launcher's <b className="text-ink">Mods</b> page.
              The original OMSI&nbsp;2 folder is never changed.
            </p>
          </div>
          <div>
            <div role="tablist" className="tabs">
              {TABS.map((t) => (
                <button
                  key={t}
                  role="tab"
                  type="button"
                  aria-selected={t === tab}
                  onClick={() => setTab(t)}
                  className="tab"
                >
                  <PlatformIcon
                    build={PLATFORMS.find((p) => p.family === t)!.key}
                    size={18}
                  />
                  {t}
                </button>
              ))}
            </div>
            <p
              role="tabpanel"
              className="mt-6 max-w-[40em] text-[17px] leading-relaxed"
            >
              {INSTALL[tab]}
            </p>
          </div>
        </div>

        {release && (
          <div className="mt-24 grid grid-cols-[minmax(0,1fr)] gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <div>
              <h2 className="section-title">Dedicated server</h2>
              <p className="mt-3 max-w-[24em] text-[16px] text-muted">
                Only for hosting a multiplayer session without playing on that
                machine. See{" "}
                <a className="link" href={url(docPath("SERVER"))}>
                  Dedicated server
                </a>
                .
              </p>
            </div>
            <div>
              <p className="mb-4 text-muted">
                Same version as the game download: {version(release)}.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Tiles builds={SERVERS} release={release} />
              </div>
            </div>
          </div>
        )}

        <p className="mt-24 flex items-center gap-2 text-muted">
          <Icon name="history" size={20} />
          <span>
            Looking for previous versions or full changelogs? Visit the{" "}
            <a className="link" href={url("/releases/")}>
              Releases
            </a>{" "}
            page.
          </span>
        </p>
      </div>
    </>
  );
}
