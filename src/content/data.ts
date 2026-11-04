export const SITE = "https://neoomsi.com/";
export const DOCS_SITE = "https://docs.neoomsi.com";
export const REPO = "neoOMSI/neoOMSI";
export const DISCORD = "https://discord.gg/neoomsi";
export const OPENOMSI = {
  repo: "https://github.com/openOMSI-Project/openOMSI",
  site: "https://openomsi-project.github.io/openOMSI/",
};

export const DOCS = [
  {
    file: "USER_GUIDE",
    path: "/player/user-guide/",
    title: "Player guide",
    source: "player/user-guide.md",
  },
  {
    file: "LINUX_CONTROLLER_AXES",
    path: "/player/linux-controller-axes/",
    title: "Linux controller axes",
    source: "player/linux-controller-axes.md",
  },
  {
    file: "COMPATIBILITY",
    path: "/compatibility/",
    title: "Compatibility",
    source: "compatibility.md",
  },
  {
    file: "SERVER",
    path: "/server/",
    title: "Dedicated server",
    source: "server.md",
  },
  {
    file: "HTMLTEXTURE",
    path: "/creators/html-textures/",
    title: "HTML textures",
    source: "creators/html-textures.md",
  },
  {
    file: "TROLLEYBUSES",
    path: "/next/creators/trolleybuses/",
    title: "Trolleybuses",
    source: "creators/trolleybuses.md",
  },
];

export interface Build {
  key: string;
  name: string;
  family: string;
  arch: string;
  note: string;
  os?: string;
  ext?: string;
}

export const PLATFORMS: Build[] = [
  {
    key: "windows-x64",
    name: "Windows",
    family: "Windows",
    arch: "x64",
    note: "64-bit Windows 10 or 11, DirectX 12 or Vulkan",
    os: "windows",
  },
  {
    key: "windows-arm64",
    name: "Windows on ARM",
    family: "Windows",
    arch: "ARM64",
    note: "Windows 11 on ARM (Snapdragon X Elite / Copilot+ PCs)",
    os: "windows-arm",
  },
  {
    key: "macos-arm64",
    name: "macOS (Apple silicon)",
    family: "macOS",
    arch: "Apple silicon",
    note: "Apple silicon (M1 through M4), macOS 11 Big Sur or newer",
    os: "mac",
  },
  {
    key: "macos-x64",
    name: "macOS (Intel)",
    family: "macOS",
    arch: "Intel",
    note: "Intel Macs with Metal support, macOS 11 Big Sur or newer",
    os: "mac-intel",
  },
  {
    key: "linux-x64",
    name: "Linux",
    family: "Linux",
    arch: "x64",
    note: "x86-64 Linux distribution with Vulkan 1.2+ drivers",
    os: "linux",
  },
  {
    key: "linux-arm64",
    name: "Linux on ARM",
    family: "Linux",
    arch: "ARM64",
    note: "ARM64 Linux desktops and SBCs with Vulkan 1.2+",
    os: "linux-arm",
  },
];

export const SERVERS: Build[] = [
  {
    key: "server-windows-x64",
    name: "Server for Windows",
    family: "Windows",
    arch: "x64",
    note: "Headless 64-bit Windows binary; no window or GPU required",
  },
  {
    key: "server-windows-arm64",
    name: "Server for Windows on ARM",
    family: "Windows",
    arch: "ARM64",
    note: "Headless Windows on ARM binary for WoA devices and servers",
  },
  {
    key: "server-linux-x64",
    name: "Server for Linux",
    family: "Linux",
    arch: "x64",
    note: "Headless x86-64 Linux binary for cloud VPS and dedicated servers",
  },
  {
    key: "server-linux-arm64",
    name: "Server for Linux on ARM",
    family: "Linux",
    arch: "ARM64",
    note: "Headless Linux ARM64 binary for Raspberry Pi 4/5 and ARM VPS",
  },
];

function visitorOs() {
  const ua = navigator.userAgent || "";
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return "";
  // Recent iPadOS versions can identify themselves as a desktop Mac.
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return "";
  if (/Windows/i.test(ua))
    return /ARM|aarch64/i.test(ua) ? "windows-arm" : "windows";
  if (/Mac OS X|Macintosh/i.test(ua)) return "mac";
  if (/Linux/i.test(ua))
    return /aarch64|arm64/i.test(ua) ? "linux-arm" : "linux";
  return "";
}

export const visitorBuild = () => PLATFORMS.find((p) => p.os === visitorOs());
