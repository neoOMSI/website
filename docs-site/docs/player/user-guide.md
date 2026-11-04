# User guide

Use this guide to install neoOMSI, learn the controls, and find common gameplay options.

> **Requirement:** neoOMSI needs an existing OMSI 2 installation. It does not include copyrighted game content. On first launch, select the folder containing `maps` and `Vehicles`.

## Getting started

1. Download the build for your operating system from the [Download page](https://neoomsi.com/download/) or GitHub [Releases](https://github.com/neoOMSI/neoOMSI/releases).
2. Extract the archive into a dedicated folder with write permissions (e.g. inside your user directory, not `Program Files`).
3. Launch `neoomsi` (`neoomsi.exe` on Windows).
4. On first start, select your OMSI 2 installation folder (the directory containing `maps` and `Vehicles`). neoOMSI reads these files without modifying them.
5. Select a map, vehicle, and timetable duty in the start menu, then start driving.

## Keybindings

### Driving controls

| Action             | Primary Key | Alternative                   |
| ------------------ | ----------- | ----------------------------- |
| **Throttle**       | `W`         | `Up Arrow`                    |
| **Brake**          | `S`         | `Down Arrow`                  |
| **Steer Left**     | `A`         | `Left Arrow`                  |
| **Steer Right**    | `D`         | `Right Arrow`                 |
| **Mouse Steering** | `O`         | Toggles mouse steering on/off |

Configure wheels, pedals, and gamepads under **Options → Controls → Game controllers**. Linux
also offers native axis modes; see the [Linux controller axis guide](linux-controller-axes.md).

### Vehicle operations

| Action                 | Key         | Description                              |
| ---------------------- | ----------- | ---------------------------------------- |
| **Battery / Ignition** | `E`         | Inserts key and powers electrical system |
| **Engine Starter**     | `M`         | Hold to crank engine until started       |
| **Drive Gear (D)**     | `Shift + D` | Engages forward drive                    |
| **Neutral (N)**        | `N`         | Neutral gear                             |
| **Reverse (R)**        | `R`         | Reverse gear                             |
| **Parking Brake**      | `.`         | Toggles handbrake                        |
| **Quick Autostart**    | `Shift + U` | Automates the complete startup sequence  |

### Camera & cockpit

- **Cockpit switches:** Left-click to toggle, click and drag to turn rotary dials.
- **Look around:** Hold Right-Mouse-Button and move mouse (or arrow keys / `I`/`J`/`K`/`L`).
- **In-game menu:** Press `Esc` to access settings, switch buses, or exit.
- **Find a setting:** Type in the search field of **Options** (or `Ctrl+F`). It matches names, descriptions, key bindings and related words ("lag", "mic", "fullscreen"), forgives typos, and shows where each result lives. `Esc` clears it.

## Trip evaluation

At the final stop of a scheduled trip, stop the bus and open a passenger door to
show the trip evaluation. Service trips and vehicles without a passenger cabin
only require stopping. The screen pauses single-player simulation; LAN sessions
continue running.

The table lists every planned stop with planned and actual arrival/departure
times (`HH:MM:SS`), signed differences in seconds, and a status. Positive
differences mean late; negative differences mean early. Day offsets identify
trips crossing midnight. Missing observations appear as `-`; the final departure
has no actual time when the report opens on arrival.

Use the in-game menu to view the current trip or the last completed trip. Scroll
with the mouse wheel, arrow keys, or Page Up/Page Down. Select **Save as text…**
(or press `Ctrl+S`) to export the table. **Continue** or `Esc` resumes driving.

Observations are recorded while a duty is active. Earlier observations are not
reconstructed when loading a saved situation or joining a trip partway through.
The last completed report remains available during the current session; save it
to a text file to keep it after exiting.

## Passenger seating

Under **Settings → Gameplay → Passengers**, enable **Passengers prefer available seats**
to reserve free seats before using standing places when passengers board. Standing places
are used once all seats are occupied or reserved. This neoOMSI option is off by default;
with it off, passengers choose randomly among all free places, as in OMSI 2.

The option can also be changed through the in-game **Options → Gameplay** menu. Changes
apply to subsequent place reservations in player and timetable buses. In `settings.cfg`,
the option is stored as `pax_prefer_seats=1` (enabled) or `pax_prefer_seats=0` (disabled).

**Boarding at the rear doors** (on by default) lets passengers who buy no ticket from the
driver get on at the exit doors too. Turned off, everybody boards at the bus's entries, as
in OMSI 2. It is stored as `pax_rear_entry`.

## Wet-road reflections

Wet-road puddles show reflections of buses, buildings and scenery. Enable reflections in
the graphics settings, or set `reflections=1` in `settings.cfg`. **Puddle reflections**
chooses what they mirror (see [Graphics and frame rate](#graphics-and-frame-rate)).

Puddle reflections remain visible from inside the bus through its windows and rain
films. Glass tint and raindrops affect the view, including the reflections outside.

## Graphics and frame rate

neoOMSI draws one picture: physically based lighting with a computed sky and automatic
exposure. The former Vanilla, Vanilla+ and Enhanced modes are gone; a settings file that
chose Vanilla, or still has the Low or Medium preset, starts with the matching cheap level
of the options below.

Settings → Graphics → **Quality preset** sets most options at once. *Low* is meant for weak
graphics cards. On the very first start the game picks a preset for the graphics chip it
finds: Low or Medium on the processor's graphics and on cards with up to 4 GB of memory. To
tune further, change these first, roughly by what they save:

| Option                                  | Saves                                                  |
| :-------------------------------------- | :----------------------------------------------------- |
| **Render scale** / **Upscaling**        | Everything drawn per pixel                             |
| **Anti-aliasing (MSAA)**                | A lot of memory and time; *Post anti-aliasing* is cheap |
| **Sun shadows**, **Sun shadow quality**, **Lamp shadows** | Drawing the scene again for each shadow map |
| **Lighting quality**                    | Lamp reach and lamp shadows per frame; most at night |
| **Volumetric light**                    | Light shafts and lamp haze in fog, rain and at night   |
| **Ambient occlusion**                   | A depth-based pass over the whole picture              |
| **Cloud detail**, **Clouds**            | The clouds' ray march (*Automatic* lowers it by itself) |
| **Puddle reflections**                  | A second look at the scene in rain                     |
| **Rain on the windows**                 | Redrawing the street behind the drops in rain          |
| **Mirrors**, **Dynamic window reflections** | Drawing the scene again for each mirror or pane    |
| **Bloom**, **Soft smoke**, **Road spray**, **Indirect light** | Smaller costs, on the graphics card or the processor |

**Minimum frame rate** is the frame rate the game tries to hold; it does not limit it, that is
what **Frame limit** and V-Sync do. When the frame rate falls clearly below it, the game lowers
the cloud detail and, with an automatic render scale, ambient occlusion, the mirrors and the
picture size: at the default of 50, the picture shrinks below 40 fps. Set it to 30 fps if a
steady 30 is enough and you prefer the sharper picture.

If the processor is the limit, lower **View distance**, **Object distance** and **Small
objects** instead: fewer pixels do not help then.

Two options bring back the look of Vanilla+:

- **Vehicle lights** → *Classic (OMSI)*: headlights light the road as short, soft cones,
  without the beam pattern and the long reach of real headlights.
- **Sky** → *Classic (OMSI)*: the sky shows OMSI's sky textures with the Vanilla+ clouds. The
  scene is still lit by the computed sky, so clouds and shadows don't always match. This
  costs a little more: the computed clouds are still worked out for the light.

A settings file that chose Vanilla or Vanilla+ starts with both set to *Classic*.

The graphics profile **Vanilla+** (Settings → Graphics → *Load graphics profile*) sets both
and turns off what Vanilla+ did not have: bloom, volumetric light and indirect light, with
road spray on *Low*. It leaves resolution, anti-aliasing and the quality levels alone. The
game puts this profile back into `settings.toml` on every start, as it comes, so save your
own variant under another name.

## Upscaling (DLSS and FSR)

Settings → Graphics → **Upscaling** chooses how the picture is brought to the window size:

- **Off (native resolution)**: full resolution, no upscaling.
- **Render scale (previous)**: the previous behaviour, controlled by *Render scale* (default).
- **AMD FSR 3.1**: on DirectX 12 and Vulkan (Linux: Vulkan), on most graphics cards.
- **NVIDIA DLSS**: on DirectX 12 and Vulkan, on NVIDIA GeForce RTX cards.

For FSR and DLSS, **Upscaling quality** picks Native AA / DLAA (full resolution, best
edges), Quality, Balanced or Performance. The change takes effect at once, no restart.
While driving, the line **Upscaling in use** shows what actually runs; hovering it shows the
render size, the graphics interface and why a choice is unavailable. The settings are stored
as `upscaler` and `upscale_quality` under `[graphics]`.

When a choice is unavailable the game keeps *Render scale (previous)* and says why, for
example:

- *its runtime files are not installed next to the game*: the optional FSR or DLSS files
  are missing.
- *needs an NVIDIA GeForce RTX graphics card*: use FSR instead.
- *it was prepared for … at start*: DLSS was set up for the other graphics API. Choose the
  named one under *Graphics API* and restart.
- *it could not start (…)*: the driver or runtime refused; update the graphics driver. After
  such an error the choice stays off until the next start.

Tips: Quality or Native AA give the cleanest picture; Performance helps most when the
graphics card is the limit and does little when the processor is. Upscaling does not apply to
triple-screen and VR views, which keep the spatial path. Windows smaller than 32 pixels (for
example while being restored) draw without DLSS for those frames.

## Command-line options

You can launch directly into a specific scenario using command-line arguments:

```sh
neoomsi --map maps/Grundorf/global.cfg --bus Vehicles/MAN_SD200/MAN_SD80.bus
```

| Flag                  | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `--root <path>`       | Path to the OMSI 2 base directory                            |
| `--map <path>`        | Path to the map global configuration (`maps/.../global.cfg`) |
| `--bus <path>`        | Vehicle file to load (`Vehicles/.../*.bus`)                  |
| `--weather <path>`    | Weather profile to apply (`Weather/*.owt`)                   |
| `--time <HH:MM>`      | Initial simulation time                                      |
| `--date <YYYY-MM-DD>` | Initial simulation date                                      |

## Modding

Place mods into the `mods` folder of neoOMSI's content folder (as a folder or a `.zip` archive), exactly as packed; neoOMSI automatically finds the OMSI content layout (`Vehicles`, `maps`, `Sceneryobjects`, etc.) within it. The content folder is the folder of the `neoomsi` executable (or its `neoOMSI` folder when placed directly in the OMSI 2 root), `~/.neoomsi/content` when that folder cannot be written, or the path set via `OMSI_CONTENT`. A folder or `.zip` copied into `mods` by hand works the same way. The original OMSI 2 files are never changed.

**Load order.** Mods are loaded according to their priority: an entry higher in the load order overrides files it shares with lower entries and with the original OMSI 2 files. For example, place an add-on or repaint above the bus it modifies. The order is stored in `mods/.load-order.json`. When unconfigured, default ordering applies (archives from the old `Archives` folder first, followed by mods alphabetically).

A mod's plugins (code running alongside the game) can be configured per mod. Uninstalling moves a mod to `mods/uninstalled`; nothing is deleted. Changes take effect on the next game start.

OMSI 2 plugins (an `.opl` file and its DLL in a `plugins` folder) load as in OMSI. They are 32-bit
Windows programs, so they run in `legacy-plugin-host32.exe`, which comes with neoOMSI; on Linux and
macOS that needs Wine (`wine` on the path, or the program `OMSI_WINE` names). A plugin that talks to
hardware over a serial port sees the ports Wine maps in `~/.wine/dosdevices` (for example
`com1 -> /dev/ttyUSB0`).

A plugin can be turned off or on in `settings.toml`, using the DLL name without `.dll`, for
example `[plugins.Example]` with `enabled = false`. Some OMSI plugins need external services
or Windows components; check the add-on's own instructions before enabling one.

When content required by a map or vehicle cannot be found, neoOMSI logs missing files and notifies you upon loading.

Set `OMSI_NO_SURF=1` before starting neoOMSI to disable OMSI `.surf` height maps for an A/B comparison of wheel contact.

## Passenger models and movement

> **Since `0.3.0-rc.1`:** the current 0.4.0 nightly makes passengers duck under a path link's
> `[next_roomheight]` with both movement systems. The release candidate did not include this
> behavior.

**Settings → Gameplay → Passenger movement** selects Natural or OMSI 2 movement.
**Procedural passenger animation** independently selects the pose system; `pax_ik`
and `--pax-ik` control it (`ik` remains a settings alias). Either pose system makes
passengers duck under a path link's `[next_roomheight]`, as on a double-decker's upper deck.

For realistic models, select **Download the realistic passengers** under
**Settings → Gameplay** (or in the in-game options menu). neoOMSI installs
them into the content folder's `Packs/RealisticPax` and selects **Passenger models →
Realistic**; they take effect upon starting a new drive. Licensing details are in the
[RealisticPax package](https://github.com/neoOMSI/neoOMSI/tree/main/tools/realistic-pax).
Without the pack, installed OMSI passengers remain in use.
