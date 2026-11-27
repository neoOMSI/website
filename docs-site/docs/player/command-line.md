# Command-line options and environment variables

neoOMSI starts with its start menu. Command-line options let you skip the menu and start a
scenario directly, or change where the game looks for content. Environment variables switch
a few things that have no option in the game.

```sh
neoomsi --map maps/Grundorf/global.cfg --bus Vehicles/MAN_SD200/MAN_SD80.bus --time 07:30
```

On Windows, use `neoomsi.exe`. Put values that contain spaces in quotes, for example
`--plate "B-AB 1234"`. Paths to OMSI 2 content (`--map`, `--bus`, `--weather`, …) are relative
to the OMSI 2 folder and to your mods, as in OMSI. `neoomsi --help` lists every option.

When you give `--bus` or `--no-menu`, the game skips the start menu and loads the map at once.

## Content and paths

| Option                  | Description                                                                                                                                                                                                                                |
| :---------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--root <path>`         | The OMSI 2 folder (the one with `Omsi.exe`, `maps` and `Vehicles`). Default: `.` (the current folder). When that is not an OMSI 2 folder, the game looks for one by itself: `OMSI_ROOT`, the folder it remembered from last time, a folder next to the program, and the usual Steam locations. If none is found, it asks you for `Omsi.exe`. |
| `--content-zip <file>`  | Read a mod or map archive (`.zip`) in place as extra content, without unpacking it. Give it several times for several archives.                                                                                                           |

## Start scenario

| Option                      | Description                                                                                                                                         |
| :-------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--map <path>`              | Map to load. Default: `maps/Grundorf/global.cfg`.                                                                                                   |
| `--bus <path>`              | Vehicle to drive, e.g. `Vehicles/MAN_SD200/MAN_SD80.bus`. Starts without the start menu.                                                            |
| `--weather <path>`          | Weather file, e.g. `Weather/Bodennebel.owt`.                                                                                                        |
| `--time <HH:MM>`            | Time of day at the start. Default: `09:00`. Seconds may be added (`HH:MM:SS`).                                                                      |
| `--date <YYYY-MM-DD>`       | Date at the start. Default: `1989-05-30`. With real-time sync on (`time_sync`), the computer's clock overrides `--time` and `--date`.                |
| `--season <name>`           | `spring`, `summer`, `autumn` or `winter`. Without it the date decides the season, as in OMSI.                                                       |
| `--situation <file>`        | Start a situation file (`.osn`): map, date and time, weather, your vehicle and its tour. Relative to the OMSI 2 folder, or an absolute path. Starts without the start menu and runs the timetable. |

## Timetable duty

| Option           | Description                                                                                                                                                                  |
| :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--schedule`     | Run the timetable: scheduled AI buses from the map's timetable.                                                                                                              |
| `--line <line>`  | Your line from the timetable, e.g. `--line 76`. Needs `--schedule` and `--bus`.                                                                                              |
| `--tour <tour>`  | Your tour of that line, e.g. `--tour 1`.                                                                                                                                     |
| `--trip <trip>`  | The trip of the tour to start with: its departure time (`HH:MM`) or its place in the tour (`1` = the first). Without it the duty starts with the trip under way at `--time`, else the next one to leave. |
| `--whole-tour`   | With `--trip`: drive on with the rest of the tour after that trip, instead of ending the duty at its terminus.                                                               |
| `--auto-entry`   | With a duty: start at the entry point nearest to its first stop by road (the menu's *Automatic*) instead of `--entry`.                                                       |

Example:

```sh
neoomsi --map maps/<map>/global.cfg --bus Vehicles/<bus>/<file>.bus --schedule --line 76 --tour 1 --time 06:00 --auto-entry
```

## Your vehicle

| Option              | Description                                                                                                                                       |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--paint <name>`    | Paint scheme or advert: an item name or index from the vehicle's `.cti` files.                                                                    |
| `--plate <text>`    | Number plate, e.g. `--plate "B-AB 1234"`. Replaces the plate the vehicle or map would give it.                                                    |
| `--number <number>` | Fleet number from the vehicle's `[number]` list, e.g. `--number 4711`. Default: the first entry. Unless `--plate` is given, it also picks the plate paired with that number. |
| `--map-fleet`       | Take fleet number, plate and repaint from the map's `ailists.cfg` depot lines.                                                                    |
| `--hof <name>`      | Depot (`.hof`) file for the vehicle. Default: the map's depot group.                                                                              |
| `--autostart`       | Put the bus into service at the start (the same as **Shift+U**).                                                                                  |

## World and view

| Option                       | Description                                                                                                         |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| `--traffic <count>`          | Number of AI traffic vehicles kept around you. Default: `0` (none).                                                 |
| `--passengers`               | Passengers at bus stops.                                                                                            |
| `--riders <count>`           | Start with this many passengers already seated in your bus. Needs `--passengers`. Default: `0`.                     |
| `--driver <file>`            | Driver personnel file, e.g. `Drivers/OMSI-Fan.odr`. The run is added to it.                                         |
| `--entry <index>`            | Entry point (from the map's `global.cfg`) where your vehicle is placed. Default: `0`.                               |
| `--view <view>`              | Starting view: `driver`, `pax`, `outside` or `free`. Default: `driver`.                                             |
| `--on-foot`                  | Start as a pedestrian where the bus would stand, without a bus.                                                     |
| `--view-distance <metres>`   | How far around the camera map tiles stay loaded. Overrides `view_distance` in the [settings file](./user-guide.md#settings-file); default 900 m. |
| `--pax-ik <true\|false>`     | Turn procedural passenger animation on or off for this start. Overrides `ik` under `[passengers]`. Needs `--passengers`. |

## Menus and tutorials

| Option            | Description                                                                                       |
| :---------------- | :------------------------------------------------------------------------------------------------ |
| `--tutorial <n>`  | Start OMSI's tutorial `1` to `4`.                                                                 |
| `--no-menu`       | Start without the start menu: the command line defines everything.                               |
| `--menu`          | Show the start menu. This is already what happens when neither `--bus` nor `--no-menu` is given. |

## Multiplayer

See [Multiplayer](./multiplayer.md) for playing together and [Dedicated server](../server.md) for
running a server.

| Option                 | Description                                                                                                              |
| :--------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| `--lan-host <port>`    | Host a session on this UDP port. `0` uses port 27015, or the next free one.                                              |
| `--lan-join <address>` | Join a host at `ip[:port]` (port 27015 when left out), `auto` to find one on the local network, or `neoomsi` for the official server. |
| `--lan-name <name>`    | Your name as the other players see it. Default: `Driver`.                                                                |
| `--server <file>`      | Run a dedicated server from this `server.toml` (created with the defaults when missing), with no window, sound or graphics card. |

## Export and automated runs

| Option                       | Description                                                                                                  |
| :--------------------------- | :----------------------------------------------------------------------------------------------------------- |
| `--export-glb <file>`        | Write your vehicle (with `--bus` and `--paint`) as a binary glTF file (`.glb`), then quit.                   |
| `--export-glb-full-textures` | With `--export-glb`: keep textures at full size as PNG instead of shrinking them.                            |
| `--exit-after <seconds>`     | Quit after this many seconds. Useful for [performance reports](./troubleshooting.md#reporting-low-frame-rates). |

## Environment variables

Switches that only need to be set show "any value": the variable turns the feature on as soon as
it exists, even when it is set to `0`. Remove it to go back to normal.

| Variable                 | Value                     | Effect                                                                                                                                                                                                 |
| :----------------------- | :------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OMSI_ROOT`              | folder                    | The OMSI 2 folder, tried first when `--root` does not point at one.                                                                                                                                   |
| `OMSI_CONTENT`           | folder                    | neoOMSI's content folder (where `mods` lives) instead of the default. A folder inside the OMSI 2 installation is refused, because neoOMSI never writes there; the game logs an error and uses the default content folder. Only a `neoOMSI` folder directly in the OMSI 2 folder is allowed. See [Modding](./user-guide.md#modding). |
| `OMSI_CONTENT_ZIP`       | list of `.zip` files      | Like `--content-zip`. Separate several files like `PATH`: `;` on Windows, `:` on Linux and macOS.                                                                                                     |
| `OMSI_BACKEND`           | `vulkan` or `dx12`        | Graphics API to try first. Overrides **Graphics API** in the options. If it cannot start, the game tries the other one. Only Windows has both; Linux uses Vulkan, macOS uses Metal. With VR on, Windows always uses DirectX 12. |
| `OMSI_NO_PLUGINS`        | any value                 | Load no OMSI 2 plugins.                                                                                                                                                                                |
| `OMSI_PLUGIN_HOST32`     | file                      | Use this `legacy-plugin-host32.exe` instead of the one next to the game. A path that is not a file switches 32-bit OMSI plugins off.                                                                                                                             |
| `OMSI_WINE`              | file                      | Linux and macOS: the Wine program that runs OMSI 2 plugins. Default: `wine` on the path or in the usual install locations.                                                                            |
| `OMSI_CLOUDFLARED`       | file                      | Use this `cloudflared` program for the multiplayer tunnel, instead of searching for it.                                                                                                               |
| `OMSI_NO_TUNNEL`         | any value                 | When hosting, do not open the tunnel that lets players in whose router cannot connect directly.                                                                                                        |
| `OMSI_LAN_IP`            | IPv4 address(es)          | Put these addresses first among your computer's own addresses, e.g. when the wrong network adapter is used. Separate several with `,`, `;` or spaces.                                                    |
| `OMSI_NO_LAN_MODS`       | any value                 | Switch off map sharing in multiplayer: the host serves no files, and a joining player downloads none.                                                                                                 |
| `OMSI_MUTE`              | any value                 | Play no sound.                                                                                                                                                                                         |
| `OMSI_TOUCH`             | any value                 | Show the on-screen touch controls on a computer; the mouse acts as a finger.                                                                                                                           |
| `OMSI_NO_UPDATE`         | any value                 | Do not check for updates at start, whatever **Check for updates automatically** says.                                                                                                                  |
| `OMSI_NO_SURF`           | any value                 | Ignore OMSI `.surf` height maps, for comparing wheel contact.                                                                                                                                          |
| `OMSI_TEXTURE_CACHE`     | folder                    | Keep the disk cache of compressed textures here. Default: `.neoomsi/cache/textures` in your home folder. The cache grows to at most 4 GB; the oldest entries are removed first.                        |
| `OMSI_NO_TEXTURE_CACHE`  | any value                 | Keep compressed textures in memory only. Loading takes longer at the next start.                                                                                                                      |
| `RUST_LOG`               | `error` … `trace`         | How much the log records. Default: `info`. See [Troubleshooting](./troubleshooting.md#more-detail-in-the-log).                                                                                         |

For performance measurements, see [Reporting low frame rates](./troubleshooting.md#reporting-low-frame-rates).

### Setting environment variables

Set the variable in a terminal, then start the game from the same terminal. It applies only to
that start.

Windows, Command Prompt:

```bat
set OMSI_BACKEND=vulkan
neoomsi.exe
```

Windows, PowerShell:

```powershell
$env:OMSI_BACKEND = "vulkan"
.\neoomsi.exe
```

To remove it again in PowerShell: `Remove-Item Env:OMSI_BACKEND`. In Command Prompt:
`set OMSI_BACKEND=`.

Linux and macOS:

```sh
OMSI_BACKEND=vulkan ./neoomsi
```

Several variables and options can be combined:

```sh
RUST_LOG=debug OMSI_NO_PLUGINS=1 ./neoomsi --map maps/Grundorf/global.cfg
```
