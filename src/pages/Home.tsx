import { useEffect, useRef, useState, type ReactNode } from "react";
import wordmark from "../../assets/logos/wordmark-gradient-dark.svg";
import wordmarkLight from "../../assets/logos/wordmark-gradient-light.svg";
import { DISCORD, visitorBuild } from "../content/data";
import { DEMOS } from "../components/demos";
import { HOME_FAQ } from "../content/faq";
import { date, latestRelease, version } from "../lib/github";
import { useAsync } from "../lib/hooks";
import { docPath, url } from "../lib/routes";
import { Icon, PlatformIcon } from "../components/icons";
import { mountRoad } from "../gl/road";
import type { Shader } from "../gl/shader";
import { mountLine } from "../gl/line";
import { useTheme } from "../lib/theme";
import { Answers } from "./Faq";

const FEATURES = [
  [
    "speed",
    "No memory crashes",
    "A 64-bit engine that handles high-resolution buses, large maps, and dense traffic without running out of RAM.",
  ],
  [
    "sync_alt",
    "Existing maps & buses",
    "Directly loads your original OMSI 2 maps, vehicles, timetable schedules, and custom bus scripts.",
  ],
  [
    "monitor",
    "Modern graphics & upscaling",
    "Hardware-accelerated DirectX 12, Vulkan, and Metal rendering, with DLSS and FSR upscaling on Windows.",
  ],
  [
    "tune",
    "3D cabin sound",
    "Realistic acoustics with Steam Audio, featuring directional 3D sound, engine occlusion, and cabin reverberation.",
  ],
  [
    "extension",
    "Safe modding",
    "Install add-ons and repaints into a dedicated Mods folder so your original OMSI 2 files stay completely untouched.",
  ],
  [
    "departure_board",
    "Built-in vehicle browser",
    "Pick maps, routes, timetables, and bus liveries with real-time 3D previews before driving.",
  ],
  [
    "install_desktop",
    "Windows, macOS & Linux",
    "Play natively on modern 64-bit Windows, Mac, or Linux without legacy DirectX 9 wrappers.",
  ],
  [
    "dns",
    "Multiplayer servers",
    "Host multiplayer convoy sessions with dedicated lightweight server packages for Windows and Linux.",
  ],
  [
    "check_circle",
    "Tested for stability",
    "Every subsystem is tested against original OMSI 2 behavior so your vehicles and schedules behave as expected.",
  ],
];

const STEPS: [string, ReactNode][] = [
  [
    "Install OMSI 2",
    "neoOMSI contains no copyrighted game content. It reads maps, vehicles, textures, and sounds directly from a licensed OMSI 2 installation and requires one to run.",
  ],
  [
    "Download neoOMSI",
    <>
      Get the release zip from the{" "}
      <a className="link" href={url("/download/")}>
        download page
      </a>{" "}
      and extract it into a separate folder (such as <code>C:\Games\neoOMSI</code>).
    </>,
  ],
  [
    "Select your OMSI 2 folder",
    <>
      On first start, point the launcher to your OMSI 2 installation (typically{" "}
      <code>C:\Program Files (x86)\Steam\steamapps\common\OMSI 2</code>, or your custom Steam library path). Your original files are never modified.
    </>,
  ],
  [
    "Select your run and drive",
    "Choose your map, timetable tour, bus livery, and controller profile in the launcher, then start driving.",
  ],
];

const STOPS = [
  [
    "Download",
    "Windows, macOS and Linux",
    url("/download/"),
  ],
  ["User guide", "Setup, controls and options", docPath("USER_GUIDE")],
  ["Releases", "Changelogs and version history", url("/releases/")],
  ["Discord", "Join the community", DISCORD],
];

const SHEEN =
  "linear-gradient(115deg, rgb(255 255 255 / .22) 0%, rgb(255 255 255 / 0) 38%)";

const BACKDROPS = [
  `${SHEEN}, linear-gradient(160deg, var(--brand-start) 0%, var(--brand-middle) 55%, var(--brand-end) 100%)`,
  `${SHEEN}, linear-gradient(160deg, #4f86e0 0%, #2456b0 45%, #12306e 100%)`,
  `${SHEEN}, linear-gradient(165deg, #c4a8f0 0%, #8a6ad8 45%, #46349a 100%)`,
  `${SHEEN}, linear-gradient(160deg, #6fd8c0 0%, #1f9c86 45%, #0c4f45 100%)`,
];

const ROAD_INTRO_MS = 3200;
const ROAD_INTRO_DISTANCE = 5.4;
const ROAD_SCROLL_DISTANCE = 0.02;
const ROAD_PATTERN_DISTANCE = 9;

const roadOffset = (scrollY: number) =>
  (ROAD_INTRO_DISTANCE + scrollY * ROAD_SCROLL_DISTANCE) %
  ROAD_PATTERN_DISTANCE;

const introTravelDistance = (offset: number) =>
  offset < ROAD_PATTERN_DISTANCE / 2
    ? offset + ROAD_PATTERN_DISTANCE
    : offset;

function RoadHero({ children }: { children: ReactNode }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const road = useRef<Shader | null>(null);
  const introProgress = useRef(0);
  const introOffset = useRef(0);
  const introComplete = useRef(false);
  const { theme } = useTheme();
  const [motionAllowed, setMotionAllowed] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionAllowed(!preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const shader = mountRoad(canvas.current!, theme);
    road.current = shader;
    return () => {
      shader.destroy();
      if (road.current === shader) road.current = null;
    };
  }, [theme]);
  useEffect(() => {
    if (!motionAllowed || introComplete.current || !road.current)
      return;

    const startProgress = introProgress.current;
    const startOffset = introOffset.current;
    const start = performance.now() - startProgress * ROAD_INTRO_MS;
    let frame = 0;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / ROAD_INTRO_MS, 1);
      introProgress.current = progress;
      const localProgress =
        (progress - startProgress) / Math.max(1 - startProgress, 0.001);
      const easeOut = 1 - (1 - localProgress) ** 5;
      const target = introTravelDistance(roadOffset(window.scrollY));
      introOffset.current = startOffset + (target - startOffset) * easeOut;
      road.current?.setFrameTime(introOffset.current);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        introComplete.current = true;
        introOffset.current = roadOffset(window.scrollY);
        road.current?.setFrameTime(introOffset.current);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [motionAllowed, theme]);
  useEffect(() => {
    const scrollRoad = () => {
      if (!motionAllowed || !introComplete.current) return;
      road.current?.setFrameTime(roadOffset(window.scrollY));
    };
    window.addEventListener("scroll", scrollRoad, { passive: true });
    scrollRoad();
    return () => window.removeEventListener("scroll", scrollRoad);
  }, [motionAllowed, theme]);
  return (
    <section className="relative h-svh min-h-[38rem] overflow-hidden">
      <canvas
        ref={canvas}
        className="road-canvas absolute top-0 left-0"
        aria-hidden="true"
      />
      <div className="wrap relative pt-28 sm:pt-44">{children}</div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-linear-to-b from-transparent to-page" />
    </section>
  );
}

// The mockups keep the app's real pixel sizes; on narrow stages they shrink, but still run off the edge.
function Stage({
  backdrop,
  children,
}: {
  backdrop: string;
  children: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current!;
    const demo = el.firstElementChild as HTMLElement;
    const observer = new ResizeObserver(() => {
      demo.style.zoom = "";
      demo.style.zoom = String(
        Math.min(1, (el.clientWidth * 1.12) / demo.offsetWidth),
      );
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="stage" style={{ background: backdrop }}>
      <div ref={box} className="stage-fit">
        {children}
      </div>
    </div>
  );
}

function Line() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stops = useRef<HTMLElement[]>([]);
  const { theme } = useTheme();
  useEffect(() => mountLine(canvas.current!, stops.current, theme), [theme]);
  return (
    <div className="relative mt-12 sm:mt-14">
      <canvas
        ref={canvas}
        className="pointer-events-none absolute top-0 left-0"
        aria-hidden="true"
      />
      <ol className="wrap relative grid gap-y-8 py-2 sm:grid-cols-4 sm:gap-x-8 sm:py-0">
        {STOPS.map(([title, text, href], i) => (
          <li key={title}>
            <a href={href} className="group flex gap-5 sm:block">
              <span
                ref={(el) => void (stops.current[i] = el!)}
                className="block size-5 shrink-0 sm:mt-4 sm:mb-6"
              />
              <span className="block">
                <span className="block text-[1.15rem] font-semibold text-heading brand-accent-hover">
                  {title}
                </span>
                <span className="mt-0.5 block text-[16px] text-muted">
                  {text}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Home() {
  const build = visitorBuild();
  const { data: release } = useAsync(latestRelease, []);

  return (
    <>
      <RoadHero>
        <h1 className="hero-enter hero-enter-1 w-[clamp(16rem,40vw,32rem)]">
          <img className="logo-dark w-full" src={wordmark} alt="" />
          <img className="logo-light w-full" src={wordmarkLight} alt="" />
          <span className="sr-only">neoOMSI: OMSI 2 rebuilt for modern systems</span>
        </h1>
        <p className="hero-enter hero-enter-2 mt-7 max-w-[32em] text-[20px] leading-relaxed text-muted">
          <span className="text-heading">OMSI 2, rebuilt for modern systems.</span>{" "}
          A modern 64-bit engine that runs your existing OMSI 2 maps, buses,
          and add-ons with smooth performance and no 4GB memory crashes.
        </p>
        <div className="hero-enter hero-enter-3 mt-7 flex flex-wrap gap-3">
          <a className="btn gap-2" href={url("/download/")}>
            <PlatformIcon build={build?.key} size={20} />
            {build ? `Download for ${build.name}` : "Download"}
          </a>
          <a className="btn-quiet gap-2" href={docPath("USER_GUIDE")}>
            <Icon name="description" size={20} />
            Read the user guide
          </a>
        </div>
        <p className="hero-enter hero-enter-4 mt-5 text-[15px] text-muted">
          {release && `Build ${version(release)} · ${date(release.published_at)}. `}
          {release && !release.prerelease
            ? "Stable release."
            : "Early development build."}
        </p>
      </RoadHero>

      <section className="relative -mt-[18svh] sm:-mt-[34svh]">
        <div className="bleed grid gap-x-16 gap-y-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
          <div>
            <h2 className="text-[2rem] leading-tight">Key features</h2>
            <p className="mt-3 max-w-[22em] text-muted">
              Running OMSI 2 maps, buses, and scripts on a modern 64-bit architecture.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(3,minmax(0,15vw))]">
            {FEATURES.map(([symbol, title, text]) => (
              <div key={title} className="card flex flex-col gap-3 p-5">
                <span className="brand-accent">
                  <Icon name={symbol} size={28} />
                </span>
                <div>
                  <h3 className="text-[1.1rem]">{title}</h3>
                  <p className="mt-1 text-[16px] text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap grid gap-x-16 gap-y-10 py-16 sm:py-20 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-[2rem] leading-tight">Getting started</h2>
          <ol className="route max-w-[38rem]">
            {STEPS.map(([title, text]) => (
              <li key={title}>
                <h3 className="text-[1.2rem]">{title}</h3>
                <p className="mt-1 text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section>
        <div className="wrap py-16 sm:py-20">
          <h2 className="max-w-[22em] text-[2rem] leading-tight">
            Inside neoOMSI.{" "}
            <span className="text-muted">
              From picking a bus in the launcher to driving the route.
            </span>
          </h2>
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {DEMOS.map(({ title, text, Demo }, i) => {
              const wide = i === 0 || i === DEMOS.length - 1;
              const flip = i === DEMOS.length - 1;
              return (
                <article
                  key={title}
                  className={`showcase${wide ? " wide lg:col-span-2" : ""}${flip ? " flip" : ""}`}
                >
                  <p className="showcase-text">
                    <span className="font-semibold text-heading">{title}.</span>{" "}
                    {text}
                  </p>
                  <Stage backdrop={BACKDROPS[i]}>
                    <Demo />
                  </Stage>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap grid gap-x-16 gap-y-10 py-16 sm:py-20 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-[2rem] leading-tight">Questions</h2>
            <p className="mt-3 text-muted">
              More in the{" "}
              <a className="link" href={url("/faq/")}>
                FAQ
              </a>
              .
            </p>
          </div>
          <Answers list={HOME_FAQ} level={3} />
        </div>
      </section>

      <section className="pt-16 pb-24 sm:pt-20 sm:pb-32">
        <div className="wrap">
          <h2 className="max-w-[16em] text-[clamp(1.8rem,3.5vw,2.5rem)] leading-tight">
            Your maps, your buses, your mods.
          </h2>
          <p className="mt-3 text-muted">
            neoOMSI reads them from your OMSI&nbsp;2 installation without
            modifying it.
          </p>
        </div>
        <Line />
      </section>
    </>
  );
}
