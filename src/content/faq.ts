export interface Question {
  q: string;
  a: string;
}

export const FAQ: Question[] = [
  {
    q: "What is neoOMSI?",
    a: "neoOMSI is a free 64-bit game engine that runs your existing OMSI 2 content on modern PCs. It reproduces original OMSI 2 gameplay, maps, vehicles, and timetable duties with smooth performance and without the 32-bit memory limit crashes of the original game.",
  },
  {
    q: "Is neoOMSI finished?",
    a: "neoOMSI is in active development. Core bus driving, timetable scheduling, weather, and complex vehicles are fully playable. Additional subsystem verification and broader add-on compatibility are continuously added in preview updates.",
  },
  {
    q: "Is neoOMSI free to download and play?",
    a: "Yes. neoOMSI is free to download. The engine source repository is currently private. You still need your own copy of OMSI 2 for game assets.",
  },
  {
    q: "Is the source code publicly available?",
    a: "The game source code is currently private. Binary downloads, issue reporting, and documentation are hosted on GitHub, with upstream attribution to openOMSI preserved in the repository NOTICE file.",
  },
  {
    q: "Do I need OMSI 2 to play neoOMSI?",
    a: "Yes. neoOMSI is an independent game engine containing no proprietary maps, vehicles, meshes, textures, or sounds. On first launch, you select your OMSI 2 directory containing the maps and Vehicles folders. neoOMSI reads these files without altering them.",
  },
  {
    q: "Does neoOMSI work with my OMSI 2 maps, buses and mods?",
    a: "Yes. Standard OMSI 2 maps, buses, liveries, and vehicle scripts work directly without conversion. Custom add-on plugins (DLLs) and community repaints are supported. Subsystems are tested against the original game so your buses steer, shift, and load passengers as expected.",
  },
  {
    q: "Does neoOMSI remove the memory limits of OMSI 2?",
    a: "Yes. Original OMSI 2 is a 32-bit program limited to 2 GB (or 4 GB with community patches) of system memory, causing white textures and out-of-memory crashes on detailed maps. neoOMSI is a native 64-bit application that can use all your computer's RAM, with multithreaded loading so heavy buses and large maps load smoothly without crashing.",
  },
  {
    q: "Which graphics APIs and upscaling methods does neoOMSI use?",
    a: "neoOMSI uses modern graphics APIs: DirectX 12 on Windows, Metal on macOS, and Vulkan on Linux. It supports NVIDIA DLSS and AMD FSR upscaling for higher frame rates, dynamic rain refractions on windshields, and real-time mirror reflections.",
  },
  {
    q: "Does neoOMSI support 3D spatial audio?",
    a: "Yes. neoOMSI includes Steam Audio for realistic 3D sound. When enabled in audio settings, you hear accurate directional sounds around the bus, engine sound isolation from inside the cabin, and natural reverberation in tunnels and streets.",
  },
  {
    q: "Does neoOMSI support VR?",
    a: "Yes. On Windows, neoOMSI includes PCVR support through OpenXR, with stereo rendering, head smoothing, and spatial in-game menus.",
  },
  {
    q: "Can I play OMSI 2 on macOS?",
    a: "Yes. neoOMSI provides native macOS builds for Apple silicon (M1 or newer) and Intel Macs running macOS 11 Big Sur or newer. The engine renders natively through Apple Metal.",
  },
  {
    q: "Can I play OMSI 2 on Linux?",
    a: "Yes. neoOMSI provides native Linux binaries for x86-64 and ARM64 systems with Vulkan 1.2+ support. The game runs directly without Proton or Wine.",
  },
  {
    q: "Can I play OMSI 2 on Android or mobile devices?",
    a: "No. neoOMSI does not support mobile platforms. The project focuses strictly on desktop operating systems and dedicated servers.",
  },
  {
    q: "Which steering wheels and controllers are supported?",
    a: "neoOMSI supports DirectInput, Raw Input, and SDL2 game controllers, including steering wheels, pedals, and shifters.",
  },
  {
    q: "Does neoOMSI change or overwrite my OMSI 2 installation?",
    a: "No. neoOMSI treats your OMSI 2 directory as strictly read-only. Add-ons can be placed in a dedicated Mods folder next to neoOMSI, or managed through the launcher's Mods page. Your original files remain untouched.",
  },
  {
    q: "How do I install mods in neoOMSI?",
    a: "Place your mod folders or .zip archives directly into the Mods directory next to neoOMSI, or manage them using the launcher's Mods page. neoOMSI loads them automatically on top of your OMSI 2 content without modifying any of your original files.",
  },
  {
    q: "Does neoOMSI support multiplayer?",
    a: "Yes. neoOMSI includes built-in multiplayer synchronization for vehicles, passenger boarding, and traffic. Headless dedicated server packages are provided for Linux (x64, ARM64) and Windows, allowing hosting without a GPU or graphical desktop environment.",
  },
  {
    q: "What is the difference between neoOMSI and openOMSI?",
    a: "Both projects recreate OMSI 2 in Rust on a 64-bit engine, but they are developed by different teams. openOMSI is developed publicly under the AGPL license, exploring experimental features like Android mobile builds, physically based lighting, and alternative plugin formats. neoOMSI's source repository is currently private; it focuses on desktop simulation, verified behavior matching OMSI 2.2.032, Steam Audio 3D sound, and standalone dedicated server packages.",
  },
  {
    q: "Is neoOMSI affiliated with MR Software or Aerosoft?",
    a: "No. neoOMSI is an independent community project and is not affiliated with, endorsed by, or sponsored by MR Software or Aerosoft. No proprietary binaries or assets are distributed with the engine.",
  },
  {
    q: "How do I report a bug in neoOMSI?",
    a: "Report bugs on our GitHub issue tracker. Include your neoOMSI version, operating system, GPU, the affected map and bus, and steps to reproduce the issue. Where possible, note how the behavior compares to OMSI 2.2.032.",
  },
];

export const HOME_FAQ = FAQ.filter((f) =>
  [
    "What is neoOMSI?",
    "Do I need OMSI 2 to play neoOMSI?",
    "Does neoOMSI remove the memory limits of OMSI 2?",
    "Does neoOMSI work with my OMSI 2 maps, buses and mods?",
    "What is the difference between neoOMSI and openOMSI?",
  ].includes(f.q),
);

export const OPENOMSI_FAQ: Question[] = [
  {
    q: "How do neoOMSI and openOMSI differ in focus?",
    a: "openOMSI is well suited if you want to experiment with new capabilities like Android mobile builds, experimental lighting, or new plugin formats. neoOMSI is geared toward players looking for reliable desktop bus simulation: it focuses on reproducing original OMSI 2.2.032 behavior, with integrated Steam Audio 3D sound, DLSS and FSR upscaling, and dedicated server downloads.",
  },
  {
    q: "Why are there two separate projects?",
    a: "neoOMSI originated from an earlier version of openOMSI, but has since diverged into an independent engine focused specifically on desktop simulation stability, verified OMSI 2 behavior, and standalone dedicated servers.",
  },
  {
    q: "Can I run both on the same computer?",
    a: "Yes. Both engines read your existing OMSI 2 installation without modifying it. You can extract each into its own folder, point both to the same OMSI 2 directory, and use them independently.",
  },
  {
    q: "Can I use the same maps and buses in both?",
    a: "Yes. Both engines are built to read original OMSI 2 files. Custom add-on folders and archives can be placed in neoOMSI's Mods folder without altering your base installation.",
  },
  {
    q: "Are multiplayer sessions compatible?",
    a: "No. The two engines use independent network protocols and synchronization code. Multiplayer sessions require everyone to run the same engine.",
  },
  {
    q: "Does neoOMSI still take code from openOMSI?",
    a: "No. Both codebases have diverged substantially since the initial fork and are developed separately. Attribution for original upstream code is maintained in the NOTICE file.",
  },
];
