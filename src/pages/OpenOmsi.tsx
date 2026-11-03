import type { ReactNode } from "react";
import { PageHead } from "../components/ui";
import { OPENOMSI, REPO } from "../content/data";
import { OPENOMSI_FAQ } from "../content/faq";
import { Icon } from "../components/icons";
import { docPath, url } from "../lib/routes";
import { Answers } from "./Faq";

interface Row {
  topic: string;
  neo: ReactNode;
  open: ReactNode;
}

const COMPARISON: Row[] = [
  {
    topic: "Development & Availability",
    neo: (
      <span>
        Maintained independently with binary releases on GitHub. Upstream
        attribution is preserved in the{" "}
        <a
          className="link"
          href={`https://github.com/${REPO}/blob/main/NOTICE`}
        >
          NOTICE
        </a>{" "}
        file.
      </span>
    ),
    open: "Public repository developed by community contributors under the AGPL-3.0 license.",
  },
  {
    topic: "Design Focus",
    neo: (
      <>
        Strict fidelity with original OMSI 2.2.032 behavior, testing vehicle
        scripts, physics, and timetables against the reference game. See the{" "}
        <a className="link" href={url(docPath("COMPATIBILITY"))}>
          compatibility guide
        </a>
        .
      </>
    ),
    open: "Explores new engine extensions, experimental lighting modes, and additional plugin formats.",
  },
  {
    topic: "Release Cadence",
    neo: "Staged releases tested against original OMSI 2 behavior to prevent regressions on existing maps.",
    open: "Rapid update cycle with frequent releases and preview snapshots.",
  },
  {
    topic: "Platforms",
    neo: "Windows (x64, ARM64), macOS (Apple silicon, Intel), and Linux (x64, ARM64).",
    open: "Windows (x64, ARM64), macOS (Apple silicon, Intel), Linux (x64, ARM64), and experimental Android builds.",
  },
  {
    topic: "Virtual Reality (VR)",
    neo: "PCVR headsets on Windows through OpenXR, with 3D cockpit tracking and spatial UI menus.",
    open: "PCVR headsets on Windows through OpenXR.",
  },
  {
    topic: "Graphics & Upscaling",
    neo: "DirectX 12, Vulkan, and Metal with NVIDIA DLSS and AMD FSR upscaling on Windows.",
    open: "DirectX 12, Vulkan, and Metal with multiple visual presets, including experimental physically based lighting.",
  },
  {
    topic: "Audio",
    neo: "Steam Audio integration with 3D positional audio, engine sound occlusion, and cabin reverb.",
    open: "Directional stereo sound.",
  },
  {
    topic: "Scripts & Plugins",
    neo: "Executes original OMSI vehicle scripts and standard Windows plugin DLLs.",
    open: "Executes original OMSI vehicle scripts and Windows plugin DLLs, with experimental Lua and WebAssembly plugins.",
  },
  {
    topic: "Dedicated Servers",
    neo: "Standalone headless server packages for Linux (x64, ARM64) and Windows without GUI or GPU dependencies.",
    open: "Dedicated server mode included within the main game package.",
  },
  {
    topic: "Mod Support",
    neo: "Loads add-ons from folders or .zip archives via a dedicated Mods folder, keeping original OMSI 2 files untouched.",
    open: "Loads add-ons from folders or archives (.zip, .7z, .rar) without modifying original OMSI 2 files.",
  },
];

const STEPS: ReactNode[] = [
  <>
    Download neoOMSI from the{" "}
    <a className="link" href={url("/download/")}>
      download page
    </a>{" "}
    and extract it into any separate folder on your PC.
  </>,
  "Launch neoOMSI and select the same OMSI 2 installation folder you use with openOMSI. Both engines read the content without modifying it.",
  <>
    Place any custom add-ons into neoOMSI's <code>Mods</code> folder, or manage
    them on the launcher's <b className="text-ink">Mods</b> page.
  </>,
  "Both engines can safely coexist on your computer. You can use whichever engine best fits your preferences and hardware.",
];

export function OpenOmsi() {
  return (
    <>
      <PageHead>
        <p className="mb-4 text-[15px] font-semibold text-accent">Comparison</p>
        <h1 className="display">neoOMSI and openOMSI</h1>
        <p className="mt-6 max-w-[38em] text-[19px] text-muted">
          Both neoOMSI and openOMSI aim to replace the legacy 32-bit OMSI 2 engine
          with a modern 64-bit simulator. Here is a clear, factual comparison of
          their features and design priorities so you can choose what fits your setup.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a className="btn gap-2" href={url("/download/")}>
            <Icon name="download" size={20} />
            Download neoOMSI
          </a>
          <a className="btn-quiet gap-2" href={url(docPath("COMPATIBILITY"))}>
            <Icon name="sync_alt" size={20} />
            Compatibility guide
          </a>
          <a className="btn-quiet gap-2" href={OPENOMSI.repo}>
            <Icon name="open_in_new" size={20} />
            openOMSI repository
          </a>
        </div>
      </PageHead>

      <div className="wrap space-y-20 pb-20 sm:pb-24">
        {/* Comparison table */}
        <section>
          <h2 className="section-title">Technical comparison</h2>
          <div className="mt-8 overflow-x-auto rounded-xl border border-line">
            <table className="w-full border-collapse text-left text-[15.5px]">
              <thead className="bg-sunken text-[14px] font-semibold text-muted">
                <tr className="border-b border-line">
                  <th scope="col" className="w-[24%] px-5 py-3">
                    Feature
                  </th>
                  <th scope="col" className="w-[38%] px-5 py-3 text-heading">
                    neoOMSI
                  </th>
                  <th scope="col" className="w-[38%] px-5 py-3 text-heading">
                    openOMSI
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(({ topic, neo, open }) => (
                  <tr
                    key={topic}
                    className="border-t border-line first:border-t-0 align-top transition-colors hover:bg-sunken/40"
                  >
                    <th
                      scope="row"
                      className="px-5 py-3.5 font-medium text-heading"
                    >
                      {topic}
                    </th>
                    <td className="px-5 py-3.5 leading-relaxed text-ink">
                      {neo}
                    </td>
                    <td className="px-5 py-3.5 leading-relaxed text-muted">
                      {open}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[15px] text-muted">
            For current openOMSI downloads and documentation, visit the{" "}
            <a className="link" href={OPENOMSI.repo}>
              openOMSI GitHub repository
            </a>.
          </p>
        </section>

        {/* Coexistence */}
        <section className="grid gap-x-16 gap-y-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="section-title">Testing both engines</h2>
            <p className="mt-3 text-muted">
              Because both engines read your OMSI 2 files without changing them,
              you can install and test both side by side without duplicating
              your game assets.
            </p>
          </div>
          <ol className="route max-w-[38rem]">
            {STEPS.map((step, i) => (
              <li key={i}>
                <p className="text-ink leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="section-title">Common questions</h2>
          <div className="mt-6">
            <Answers list={OPENOMSI_FAQ} level={3} />
          </div>
        </section>
      </div>
    </>
  );
}
