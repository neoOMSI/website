# Options and features

This page describes neoOMSI's own options and features, grouped as in **Options**. **Options**
is a tab of the start menu and of the in-game menu (`Esc`). Most changes apply at once; options
marked "next start" apply the next time the game starts.

Each option is saved in [`settings.toml`](user-guide.md#settings-file). The tables give the
TOML section and key, so you can also set an option by hand. Keys and controllers are on
[Controls](controls.md). Graphics quality, upscaling, passenger seating and models, and trip
evaluation are in the [User guide](user-guide.md).

## Gameplay

| Option | What it does | `[gameplay]` key | Default |
| --- | --- | --- | --- |
| **Maintenance** | How fast vehicles wear: **Infinite (no wear)**, **Very bad**, **Bad**, **Normal** or **Good**. Next start | `maintenance` | `0` (Infinite) |
| **Passengers pay the exact fare** | Passengers pay the exact amount, so you give no change at the cash desk | `exact_fare` | on |
| **Boarding** | How passengers get their tickets: **Pay and take the ticket**, **The driver sells the ticket** or **Just walk in** | `boarding` | `auto` |
| **Automatic IBIS** | Enters the selected tour into the IBIS for you | `auto_ibis` | off |
| **Strict AI stop positions** | AI buses held short of a stop by a red light or traffic wait until they reach the stop before opening their doors. Behind another bus at a stop they may still open up to 10 m short. Off is the OMSI 2 behaviour that maps are built around | `ai_strict_stops` | off |
| **Torch** | **Head torch** or **Portable torch** (see [Torch](#torch)) | `torch_mode` | `head` |
| **Collisions with objects**, **Collisions with vehicles**, **Collisions with pedestrians** | Switch each kind of collision on or off | `collision_objects`, `collision_vehicles`, `collision_pedestrians` | on |

### Torch

The torch lights 3.5 metres ahead. Switch it on and off with **Toggle torch** in Quick Access
(tap `Alt`). The **Head torch** follows your view; the **Portable torch** is aimed with the
cursor. The beam stays still while the in-game menu or a dialog is open.

### Traffic

These apply from the next start. They are stored under `[ai]`.

| Option | Choices | `[ai]` key | Default |
| --- | --- | --- | --- |
| **Unscheduled traffic** | 25 % to 200 % of the map's traffic | `unsched_factor` | `1.0` (100 %) |
| **Scheduled traffic** | **All**, or at most 10, 25 or 50 timetable buses | `max_scheduled` | `0` (All) |
| **Parked vehicles** | **None**, **Every space**, or at most 35, 100 or 250 | `max_parked` | `0` (Every space) |

When you choose a tour, the service selector offers **Keep scheduled bus running**. Turned on,
the AI bus that runs your tour in the timetable keeps running alongside you instead of being
removed. It is stored as `keep_ai_bus` under `[timetable]` (default off).

### Passengers

| Option | What it does | `[passengers]` key | Default |
| --- | --- | --- | --- |
| **Passenger simulation distance** | How far stops and running services carry passenger demand: **Short (450 m)**, **Medium (900 m)**, **Long (1,800 m)** or **Whole map**. *Whole map* tracks distant demand without loading scenery | `simulation_distance` | `medium` |
| **Passengers hail buses** | Passengers near the kerb turn towards a suitable bus and hold an arm out until they board or the bus passes | `hail_buses` | on |
| **Humans max count** | The most animated people at once: waiting, walking and riding. Raise it if nearby buses show fewer passengers than they carry; higher limits use more CPU and memory | `max_humans` | `200` |
| **Pedestrians and passengers** | **All installed humans**, or only those in the map's `humans.txt`. Not used with RealisticPax; from the next map start | `humans` | `installed` |

Seating, rear-door boarding, passenger models and movement are described in the
[User guide](user-guide.md#passenger-seating).

### Driving

**Options → Gameplay → Driving**:

| Option | What it does | Section and key | Default |
| --- | --- | --- | --- |
| **Road Feedback** | Road and suspension vibration through a supported wheel or controller. Experimental: turning it on asks you to confirm. Force feedback must be on too | `[gameplay]` `road_vibration` | on |
| **Road Feedback Intensity** | 1 (gentle) to 5 (strong) | `[gameplay]` `road_vibration_intensity` | `3` |
| **Kerb Interaction** | Kerbs push the steering and give wheel or controller feedback. Off removes the steering push and its feedback; the bus still collides with kerbs | `[gameplay]` `kerb_interaction` | on |
| **Kerb Interaction Intensity** | 1 (gentle) to 5 (strong) | `[gameplay]` `kerb_interaction_intensity` | `3` |
| **Automatic clutch** | Works the clutch for you | `[gameplay]` `auto_clutch` | on |
| **Automated manual transmission** | Shifts a manual gearbox for you, by engine speed | `[gameplay]` `auto_shift` | off |
| **Momentary gear buttons** | Hold a gear button to stay in that gear; releasing it returns to neutral | `[gameplay]` `momentary_gears` | off |
| **Keyboard brake stays applied** | The brake stays on until you press the throttle | `[controls]` `brake_hold` | on |
| **Indicators cancel themselves** | The bus's script switches the indicator off after a turn | `[controls]` `blinker_cancel` | on |
| **Linear keyboard steering** | Keyboard steering turns at a constant rate, as in OMSI | `[controls]` `steering_linear` | off |
| **Classic keyboard steering** | The wheel stays where the keys left it; you steer back yourself | `[controls]` `old_steering` | off |
| **Speed-dependent keyboard steering** | The steering keys act more slowly at higher speeds | `[controls]` `red_steer_spd` | off |

## Camera

Most camera options are self-explanatory in the game. Head tracking and free look are
described on [Controls](controls.md#head-tracking).

**Adjust the seat in the cockpit...** (also **Seat and mirrors** in the in-game menu) sets the
seat, the mirrors and the field of view of the current vehicle with a live preview. You can
save the result for this vehicle only or as a named preset.

## Graphics

The [User guide](user-guide.md#graphics-and-frame-rate) explains the quality options and
upscaling. These options are neoOMSI's own:

| Option | What it does | `[graphics]` key | Default |
| --- | --- | --- | --- |
| **Smoke** | **All vehicles**, **Own vehicle only** or **Off**. As in OMSI, *Own vehicle only* also hides the smoke of map objects | `smoke` | `all` |
| **Envmap pictures** | Shows the reflection pictures that vehicles and objects bring (OMSI's envmaps). Off: paint, chrome and glass reflect only the real-time surroundings | `envmaps` | on |
| **Texture memory** | How much memory textures may use: **Automatic**, or 500 MB to 24 GB. *Automatic* takes a share of the system and graphics memory | `texture_memory` | `0` (Automatic) |

### Mirrors

Two kinds of mirrors are available. **Upgraded Mirrors** chooses between them and needs a
restart.

| Option | What it does | `[graphics]` key | Default |
| --- | --- | --- | --- |
| **Upgraded Mirrors** | 1024 px mirrors with their own refresh rate and anti-aliasing | `upgraded_mirrors` | off |
| **Mirrors** (classic) | Mirror resolution: **Off**, **Low (128)**, **Normal (256)**, **High (512)**, **Very high (1024)** | `mirror_size` | `256` |
| **Mirror refresh** (classic) | How often the mirrors are redrawn: **Frozen**, **Economy** or **Full** | `mirror_refresh` | `full` |
| **Target mirror refresh** (upgraded) | 20 to 60 updates per second for visible mirrors. Fisheye cameras share up to 15; several visible mirrors can lower it. VR has its own setting | `mirror_target_fps` | `30` |
| **Mirror anti-aliasing** (upgraded) | **FXAA** or **Off**, independent of the main view | `mirror_aa` | `fxaa` |

## Interface

| Option | What it does | `[ui]` key | Default |
| --- | --- | --- | --- |
| **Language** | The language of the game interface | `language` | English |
| **Units** | **Metric (km/h, km, °C)**, **UK (mph, miles, °C)** or **Imperial (mph, miles, °F)** | `units` | `metric` |
| **Discord status** | Shows on Discord what you are playing: the map, line or tour, and the bus | `[discord]` `status` | on |

neoOMSI comes with ten languages: English, Deutsch, Français, Čeština, Türkçe, Polski,
Nederlands, Português (Portugal), Português (Brasil) and 简体中文. The list shows how much of
each is translated; untranslated texts appear in English. In the file, a language is stored by
its code: `en`, `de`, `fr`, `cs`, `tr`, `pl`, `nl`, `pt-pt`, `pt-br` or `zh-cn`.

Under **Info bar**, **Tour** shows the number or name of the tour you are driving
(`info_tour`, on by default).

## Game & Updates

neoOMSI updates itself from its GitHub releases. Mods and content in the game folder are not
touched by an update.

| Option | What it does | `[launcher]` key | Default |
| --- | --- | --- | --- |
| **Check for updates automatically** | Looks for a new version when the game starts | `update_check` | on |
| **Update channel** | Which releases to check: **Stable**, **RC** (release candidates) or **EA (Nightly)** | `update_channel` | `stable` |
| **Install updates automatically** | Installs a new version as soon as it is found | `update_auto` | off |
| **Check for updates** | **Check now** looks for a new version | | |
| **Current version** | The version you are running | | |

Before an update, neoOMSI shows the release notes of the new version and of the previous
versions on the channel. **Update to** downloads it, installs it and restarts the game. If the
version is older than yours (after switching to another channel), the dialog says the update
is a downgrade.

**Coming from openOMSI** (shown when openOMSI is installed) takes its gamepads, steering wheels
and key bindings. Mods and plugins are described under [Modding](user-guide.md#modding).

## OMSI parity

| Option | What it does | `[parity]` key | Default |
| --- | --- | --- | --- |
| **Passengers as in OMSI** | Fills stops and pavements exactly as OMSI 2 does. Off uses neoOMSI's own rules: people gather over each line's interval, interchanges fill with every line due, running buses already carry riders, and nobody appears in view | `passengers` | off |

With it off, **neoOMSI passenger rules** fine-tune those rules: **Boarders per bus**, **Riders
changing lines**, **Pedestrians out in heavy rain** and **Longest arrival time**.

## Privacy and diagnostics

**Share anonymous performance reports** (`performance_reports` under `[privacy]`, off by
default) sends anonymous performance data after each session; see the
[privacy notice](https://neoomsi.com/privacy/telemetry/).

## Time and weather

These are on the in-game menu's **World** page.

| Option | What it does | `[gameplay]` key | Default |
| --- | --- | --- | --- |
| **Real-time sync** | The game's date and time follow your computer's clock. The time cannot be changed while it is on | `time_sync` | off |
| **METAR sync** | The weather follows the real weather report (METAR) of an airport, updated every 10 minutes | `metar_sync` | off |
| **METAR source** | The airport, as a 4-letter ICAO code. Empty: the airport nearest to the map | `metar_station` | empty |

**Refresh now** fetches the report again; **Load once** loads it without keeping the weather
in sync. The reports come from aviationweather.gov. When no report can be loaded, the weather
is a clear day. In a LAN session the host sets the clock and the weather.

The start menu has the same choice under **Time & weather**: **AIRPORT (ICAO)** with **Live
updates (every 10 minutes)**.

## Driver profiles

Your driver profile records your drives: level and XP, **Hours driven**, **Distance**, **Stops
served** and **On time**, ratings for **Driving**, **Comfort** and **Ticket selling**, and a
**Trip history** with details for each trip. Choose
the profile from the driver button at the top of the start menu, or with **Driver** on the
in-game menu's **Vehicle** page. The chosen profile stays selected.

- **New driver** creates a profile.
- **Merge profiles...** moves the statistics, XP and history of other profiles into the
  current one and removes them from neoOMSI. A recovery backup is saved first.

Profiles are OMSI's driver files (`Drivers/*.odr`). neoOMSI reads them from your OMSI 2
folder and saves to the `Drivers` folder of its content folder; OMSI 2's own files are not
changed.

## Start menu

Choose a map, a vehicle and how the drive starts:

- The map and vehicle lists show the folder each one comes from. **Vehicle details** shows the
  vehicle's **Description** and **Vehicle file**.
- **Only fleet numbers from the map's AI list** offers only the fleet numbers, number plates
  and repaints that the map's AI list gives the chosen bus. It appears when the map lists that
  bus, and is stored as `map_fleet` under `[start_menu]` (default off).
- Choose **LINE**, **TOUR** and **FIRST TRIP**. **By start time** picks the trip for the
  chosen time. **NEXT DEPARTURES** lists up to 40 next passenger trips of all lines from the
  chosen start time, with each trip's destination sign; picking one sets line, tour and trip.
- **START POINT** chooses where you start; **Automatic (nearest to the first stop)** is the
  default. **Start on foot (no bus)** starts without a bus.
- Maps, timetables, buses, repaints and depot files refresh by themselves while the start
  menu is open, so you can add content without restarting.

## Map and navigator

Open the map with `Shift + M`, the in-game menu's **Map** page, or **Open navigator map** in
Quick Access. The map, minimap and navigator also work on foot without a bus, following you.

Buttons on the map show your position, zoom, switch the AI bus and bus-stop markers, and
search streets: type a name and pick a result to centre the map on that street.

Right-click on the map for:

| Action | What it does |
| --- | --- |
| **Set waypoint** / **Clear waypoint** | The navigator guides you to the point |
| **Teleport here** | Moves your bus to the nearest street within 300 m |
| **Move free camera** | Puts the free camera there |
| **Take over bus** | On an AI bus: you drive it, from any distance, and continue its trip. Your previous bus is handed to the AI |

In a LAN session only the host can teleport, and buses cannot be taken over by clients.

Hover over a bus to see its tour, trip, status (early, on time or late), registration,
passenger count, next stop and speed. Hover over a stop to see its next three services with
their timetable and expected times.

## Photography mode

Open **Photography mode** from the in-game menu (`Esc`). In single player the simulation is
paused; in multiplayer the world keeps running, so park safely first. Time and weather changes
are only for your picture: they leave your timetable, vehicles and passengers unchanged.

| Key or mouse | Action |
| --- | --- |
| right mouse button + drag | look around |
| `W` `A` `S` `D` | move |
| `Q` / `E` | down / up |
| `Z` / `C` | roll the camera |
| `X` | level the camera |
| `Shift` / `Ctrl` | faster / slower |
| mouse wheel | zoom |
| `Ctrl` + click | focus on that point |
| `Enter` or `F12` | take the photo |
| `R` | reset the camera |
| `H` | hide the controls |
| `Esc` | exit |

The panels offer:

- **Camera** and **Lens**: field of view and **Focal length (35 mm equivalent)**, **Aperture**,
  **Focus distance**, **Depth of field**, camera roll and movement speed, and three
  **Positions** to save and restore a camera position during the session.
- **Time & weather**: time of day, **Weather preset**, **Visibility** and **Cloud cover**.
- **Image** and **Colour**: exposure, **Brightness**, **Contrast**, **Saturation**, **White
  balance**, **Tint**, **Vignette**, and a **Filter** (**Monochrome**, **Warm**, **Cool**,
  **Vintage**).
- **Composition**: a **Composition guide** (**Rule of thirds**, **Golden ratio**), **Photo
  aspect ratio**, **Hide your driver**, and **Traffic visibility** (**Hide normal traffic
  (keep buses)** or **Hide all traffic, including buses**).

Photos are saved as PNG files in the `Screenshots` folder of the content folder. Leaving
photography mode restores the scene.
