# User guide

This guide covers setting up neoOMSI, essential driving keybindings, graphics and audio options, and managing community mods.

> [!IMPORTANT]
> **neoOMSI requires an existing OMSI 2 installation.** neoOMSI contains no copyrighted maps, buses, or textures of its own. On first start, point the launcher to your existing OMSI 2 installation.

## Getting started

1. Download neoOMSI from the [Download page](/download/) for your operating system.
2. Extract the downloaded `.zip` archive into any folder on your computer (such as `C:\Games\neoOMSI`).
3. Double-click `neoomsi.exe` (or run `./neoomsi` on Linux/macOS).
4. On first launch, the start menu will ask for your OMSI 2 installation directory (typically `C:\Program Files (x86)\Steam\steamapps\common\OMSI 2`, or your custom Steam library path on another drive). Your original game files are strictly read-only and never modified.
5. Choose your map, select a bus and livery, pick a scheduled timetable duty, and click **Drive**.

## Keybindings & controls

### Driving controls

| Action | Primary Key | Alternative |
| --- | --- | --- |
| **Throttle** | `W` | `Up Arrow` |
| **Brake** | `S` | `Down Arrow` |
| **Steer Left** | `A` | `Left Arrow` |
| **Steer Right** | `D` | `Right Arrow` |
| **Mouse Steering** | `O` | Toggles steering with mouse on/off |

### Steering wheels and gamepads

- **Steering wheels:** Plug in your wheel before launching neoOMSI.
- **Calibration:** Open **Settings → Controls** to assign steering axes, pedals, gear shifters, and adjust force feedback strength or deadzones. DirectInput, Raw Input, and SDL2 hardware are automatically detected.

### Vehicle operations

| Action | Key | Description |
| --- | --- | --- |
| **Battery / Ignition** | `E` | Inserts key and turns on vehicle electrics |
| **Engine Starter** | `M` | Hold to crank engine until started |
| **Drive Gear (D)** | `Shift + D` | Engages forward automatic drive gear |
| **Neutral (N)** | `N` | Puts transmission in neutral |
| **Reverse (R)** | `R` | Engages reverse gear |
| **Parking Brake** | `.` | Toggles handbrake on/off |
| **Quick Autostart** | `Shift + U` | Automatically starts up the bus and prepares to drive |

### Camera and cockpit

- **Cockpit switches:** Left-click on buttons and levers to toggle them; click and drag rotary knobs.
- **Look around:** Hold the right mouse button and drag to look around the cabin, or use `I` / `J` / `K` / `L`.
- **In-game menu:** Press `Esc` to access settings, switch buses, view timetables, or return to the menu.
- **Settings search:** Press `Ctrl + F` inside Options to search for any setting, keybinding, or display toggle.

## Trip evaluation and timetable punctuality

At the final stop of a scheduled timetable trip, bring the bus to a halt and open the passenger doors to view your completed trip evaluation report.

The report displays every stop along your route, showing your scheduled arrival time, actual arrival time, and whether you arrived on time, early, or delayed. You can review your driving statistics, scroll through the timetable stops, and click **Save as text…** (`Ctrl + S`) if you wish to export your trip log for virtual bus companies (VBCs).

## Passenger behavior

Under **Settings → Gameplay → Passengers**, you can tailor how passengers behave on your bus:

- **Passengers prefer available seats:** When enabled, boarding passengers seek out and reserve open seats before using standing areas.
- **Rear door boarding:** Allows passengers who do not need to buy a ticket to board through rear doors, speeding up busy station stops.
- **Realistic passenger models:** An optional high-definition passenger pack can be downloaded directly through the in-game settings to replace default character models.

## Graphics and upscaling (DLSS and FSR)

neoOMSI uses a modern 64-bit graphics engine supporting DirectX 12 (Windows), Metal (macOS), and Vulkan (Linux).

Under **Settings → Graphics → Upscaling**, Windows players can boost performance using hardware upscalers:

- **AMD FSR:** Supported on Windows (DirectX 12 and Vulkan) across modern AMD, NVIDIA, and Intel graphics cards.
- **NVIDIA DLSS:** Available on Windows for NVIDIA GeForce RTX graphics cards (DirectX 12 and Vulkan).
- **Quality presets:** Choose between *Quality*, *Balanced*, or *Performance* to achieve your desired balance of sharpness and high frame rates.

## Road reflections and weather

When driving in rainy weather, wet road surfaces display dynamic real-time reflections of buildings, streetlights, scenery, and your bus. Wet-road reflections are visible from both outside cameras and through cockpit windows.

You can customize the simulation weather from the start menu by selecting a sunny preset, dynamic rain storms, or clicking **Live Weather** to automatically synchronize local wind, temperature, and cloud cover with real-world airport METAR reports.

## Installing mods and add-ons

neoOMSI features a dedicated **Mods** directory located directly inside your neoOMSI folder.

- **Installing content:** Place custom map folders, bus folders, or `.zip` mod archives into the `Mods/` folder.
- **Safe loading:** neoOMSI automatically reads these files without overwriting or altering your original OMSI 2 installation.
- **In-game manager:** Open the **Mods** tab in the neoOMSI start menu to enable, disable, or adjust the load order of your installed add-ons.

## Advanced command-line options

For power users who prefer launching scenarios directly from shortcuts or batch scripts, `neoomsi` supports command-line arguments:

```sh
neoomsi --map maps/Grundorf/global.cfg --bus Vehicles/MAN_SD200/MAN_SD80.bus
```

| Argument | Description |
| --- | --- |
| `--map <path>` | Loads directly into a specified map configuration |
| `--bus <path>` | Automatically spawns the specified vehicle `.bus` file |
| `--weather <path>` | Applies a specific weather profile on launch |
| `--time <HH:MM>` | Sets the starting simulation time |
| `--date <YYYY-MM-DD>` | Sets the starting simulation date |
