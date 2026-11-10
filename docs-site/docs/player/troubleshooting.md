# Troubleshooting

This page shows where neoOMSI writes its logs, how to report a problem, and how to fix common
start problems. For setting environment variables, see
[Command-line options and environment variables](./command-line.md#setting-environment-variables).

## Log files

Each start writes a new log file into the `logs` folder next to the
[settings file](./user-guide.md#settings-file):

| System  | Folder                                                                                |
| :------ | :------------------------------------------------------------------------------------ |
| Windows | `%APPDATA%\neoOMSI\logs`                                                              |
| macOS   | `~/Library/Application Support/neoOMSI/logs`                                          |
| Linux   | `$XDG_CONFIG_HOME/neoOMSI/logs`, or `~/.config/neoOMSI/logs` when it is not set       |

The file is named after the time the game started: `game-YYYY-MM-DD_HH_MM_SS.log`, for example
`game-2026-11-09_18_42_05.log`. Finishing an update writes an `update-….log` the same way.
Old logs are kept; send the one from the run that had the problem.

Each line has the time, the kind (`Info`, `Warn`, `Error`, `Crash` or `Debug`) and the message.
When the game stops on an error, the log ends with a `Crash` line that names the build and
the place in the code. The same lines are printed to the terminal when you start the game from
one.

### More detail in the log

The log records `info` and more serious messages by default. Set `RUST_LOG` before starting
the game to change that:

| `RUST_LOG` | Records                                         |
| :--------- | :---------------------------------------------- |
| `error`    | Errors only                                     |
| `warn`     | Warnings and errors                             |
| `info`     | The default                                     |
| `debug`    | Much more detail; the log grows quickly         |
| `trace`    | Everything (shown as `Debug` in the log)        |

Only a plain level is used. Filters for single modules, such as `RUST_LOG=wgpu=warn`, are
ignored, and the default applies.

## Reporting a problem

Report bugs on GitHub [Issues](https://github.com/neoOMSI/neoOMSI/issues). Attach:

- the log file of the run (see [Log files](#log-files));
- the neoOMSI version and release channel (the log names the version and build near the top);
- the map, vehicle and, if it matters, the time, weather and view;
- what you expected and what happened, and whether it happens every time.

Remove personal information from logs and screenshots, and do not upload OMSI game files.

If the game behaves differently from OMSI 2, follow
[How to report a mismatch](../compatibility.md#how-to-report-a-mismatch).

## Reporting low frame rates

A useful performance report is a measured run that someone else can repeat:

1. Start the game with `OMSI_PROFILE=1` set. `RUST_LOG` should be `info` (the default) or
   more.
2. Start directly into the scene with the map, vehicle, view and traffic where it is slow, and
   `--exit-after 120`.
3. Fix the weather with `--weather <file>`. Live weather can turn a dry run into rain half way
   through, and the numbers stop being comparable. Keep the time of day the same too.

Linux example:

```sh
OMSI_PROFILE=1 ./neoomsi --map maps/Grundorf/global.cfg --bus Vehicles/MAN_SD200/MAN_SD80.bus --weather Weather/Bodennebel.owt --time 09:00 --exit-after 120
```

Windows, PowerShell:

```powershell
$env:OMSI_PROFILE = "1"
.\neoomsi.exe --map maps/Grundorf/global.cfg --bus Vehicles/MAN_SD200/MAN_SD80.bus --weather Weather/Bodennebel.owt --time 09:00 --exit-after 120
```

When the run ends, the log gets a summary: times of each frame stage, draw counts, tile
loading spikes and, where the graphics card supports it, GPU pass times. With `--exit-after`
the averages cover only the second half of the run, after loading. Without `--exit-after` the
summary is written when you close the game or go back to the main menu.

Attach the log and say which graphics settings, mirrors or VR you used, which graphics card,
and whether the problem is while driving steadily or while loading.

These switches help narrow it down:

| Variable                  | Effect                                                                                                                                         |
| :------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| `OMSI_RENDER_SCALE`       | A fixed render scale from `0.25` to `1.0`, e.g. `1.00`, `0.70`, `0.50`. The automatic scale is off. If the frame rate hardly changes, fewer pixels do not help: the processor, shadows or mirrors are the limit. |
| `OMSI_VSYNC=0`            | V-Sync off, whatever the settings say (`1` turns it on).                                                                                        |
| `OMSI_MAX_FPS`            | Frame limit. `0` uses the monitor's refresh rate; `1000` or more means no limit. Use `OMSI_VSYNC=0` with `OMSI_MAX_FPS=1000` to keep the limiter out of a measurement. |
| `OMSI_PERF_SWEEP=1`       | Experimental. After 20 seconds, switches graphics features off one at a time (8 seconds each, with an 8-second baseline between them) and writes to the log what each one costs. Stand still while it runs. A number of 3 or more sets the seconds per feature. |

## Sharing performance reports

**Options → Privacy and diagnostics → Share anonymous performance reports** sends frame time
distributions, frame stage timings, GPU adapter and pass timings when supported, graphics
settings and basic system specs after each session. It does not send logs, map or vehicle
names, file paths or account IDs. It is off by default and stored as `performance_reports`
under `[privacy]` in the [settings file](./user-guide.md#settings-file). GPU timings may start
only at the next launch. See the [privacy notice](https://neoomsi.com/privacy/telemetry/).

## Graphics API

On Windows, **Options → Graphics → Graphics API** chooses **Automatic**, **Vulkan** or
**DirectX 12**. The change takes effect the next time the game starts. *Automatic* tries
DirectX 12 first. If the chosen API cannot start, the game tries the other one.

If the game does not start at all, choose the API for one start with `OMSI_BACKEND=vulkan` or
`OMSI_BACKEND=dx12` (see [environment variables](./command-line.md#environment-variables)).
Linux always uses Vulkan, macOS Metal.

## Common problems

### "The original OMSI 2 was not found"

neoOMSI needs a complete OMSI 2 installation. It looks for one by itself; if it finds none, it
asks you to **Select the Omsi.exe of your OMSI 2 installation**. When you cancel, the game shows
*neoOMSI cannot start* with the files it missed.

- Select the `Omsi.exe` in the folder that also has `maps` and `Vehicles`.
- *… is not a complete OMSI 2 installation. Missing: …* means files the game needs are not in
  that folder, for example `maps/Grundorf/global.cfg`, `Vehicles/MAN_SD200` or `envir.cfg`.
  Repair the installation (on Steam: verify the game files).
- *(this is the neoOMSI content folder, not the original game)* means you chose neoOMSI's own
  content folder. Choose the OMSI 2 folder instead.
- You can also start once with `--root "C:\path\to\OMSI 2"`, or set `OMSI_ROOT`.

To change the folder later, use **Options → Game & Updates → OMSI 2 installation →
Change**.

### Mods are not found or not kept

neoOMSI keeps mods in its content folder: next to the `neoomsi` program, or in its `neoOMSI`
folder when the program lies directly in the OMSI 2 folder. When it cannot write there, for
example in `Program Files`, it uses `.neoomsi/content` in your home folder instead
(`%USERPROFILE%\.neoomsi\content` on Windows, `~/.neoomsi/content` on Linux and macOS). The log
names the folder in use in a line starting with `content folder (mods):`. See
[Modding](./user-guide.md#modding).

To avoid this, extract neoOMSI into a folder of your own, as the
[user guide](./user-guide.md#getting-started) suggests. The same applies to updates: an update
fails with *the folder … cannot be written. Put neoOMSI in a folder of yours (or start it once
as administrator) and update again* when the game folder is not writable.

`OMSI_CONTENT` can point at another content folder, but not at one inside the OMSI 2
installation (see [environment variables](./command-line.md#environment-variables)).

### Missing content

When a map or vehicle needs files that are not installed, a message appears after loading. It
points to **Options → Game & Updates → Missing content**, which lists what is missing, how
serious it is (**Required**, **Looks wrong** or **Minor**) and what to do, for example
*Install …* or *Check the load order, or install a new copy of …*. The tab appears only
when something is missing. Missing files are also written to the log.

In multiplayer, the pause menu has **Missing assets** with the files the session could not find.

### DLSS or FSR cannot be chosen

The game keeps *Render scale (previous)* and says why. See
[Upscaling (DLSS and FSR)](./user-guide.md#upscaling-dlss-and-fsr).

### A plugin causes problems

Start once with `OMSI_NO_PLUGINS=1` to load no OMSI 2 plugins. If the problem is gone, turn the
plugins off one at a time in the settings file (see [Modding](./user-guide.md#modding)).
