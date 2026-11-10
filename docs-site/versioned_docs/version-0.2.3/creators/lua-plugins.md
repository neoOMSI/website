# Lua plugins

neoOMSI runs two kinds of plugins from the `plugins` folder of the game and of each
content root:

- **OMSI plugins**: an `.opl` file and its DLL, driven as OMSI 2 drives them (system
  variables, the bus's variables, string variables and triggers). Existing plugins work
  without changes; a 32-bit DLL runs in a small helper process.
- **Lua plugins**: scripts for neoOMSI's own API, described here. They see much more of
  the game than an OMSI plugin and need no compiler.

Plugins in a mod load only after the player allows them on the Mods page.

This page describes the Lua API of 0.2.3. Later versions add more events and functions;
see the [0.4.0 Nightly guide](/next/creators/lua-plugins/).

**Note:** the Lua API is still under development, so breaking changes may occur.

## A first plugin

A Lua plugin is one file, `plugins/<name>.lua`, or a folder with a `main.lua`,
`plugins/<name>/main.lua`. A folder plugin can `require` the other `.lua` files of its
folder.

```lua
-- plugins/Speedo/main.lua
local fastest = 0

omsi.on("vehicle", function(name)
  omsi.message("Speedo: driving " .. tostring(name))
end)

function on_frame(dt)
  local v = omsi.speed()
  if v > fastest then fastest = v end
end

omsi.every(60, function()
  omsi.log(string.format("fastest so far: %.0f km/h", fastest))
end)
```

The file runs when the game starts, and again when a new drive starts after the main menu. Then the plugin hears events (see below),
runs its timers and reads and writes the bus. A changed `.lua` file is loaded again while
the game runs (the `stop` event, then a fresh start). The game looks for changes once a
second: the plugin's file, or for a folder plugin every `.lua` file in its folder and
subfolders. The saved data file (`*.save.lua`) does not count.

## The sandbox

Each plugin has its own Lua 5.4 with the safe libraries only: `table`, `string`, `math`,
`utf8`, `coroutine`, `os.clock`, `os.time`, `os.date` and `os.difftime`. There is no
`io`, no other `os` function, no `dofile`, `loadfile` or C modules. `require` finds
modules in the plugin's own folder.

A call into a plugin that runs longer than one second is stopped. A plugin whose calls
fail ten times is switched off until it changes or the game restarts. Errors go to the
log and appear on screen.

Lua plugins run while the game runs, not while it is paused. Keys pressed during a pause
are not passed on.

## Events

A plugin registers handlers with `omsi.on(event, fn)`, or defines a global function
`on_<event>`. `omsi.off(event, fn)` removes a handler. `omsi.emit(event, ...)` calls the
plugin's own handlers for `event` at once, with the given arguments, the `on_<event>`
function included. A plugin can use it for events of its own; it reaches no other plugin.

| Event | Arguments | When |
|---|---|---|
| `start` | | The plugin was loaded. |
| `vehicle` | `name` | The player's vehicle changed; `nil` without one. Also right after `start` when the player already has a vehicle. |
| `frame` | `dt` | Every frame, after timers and watches; seconds since the last. |
| `stop` | | The plugin is unloaded: the drive ends (back to the main menu or the game exits) or the file changed. |
| `key` | `key, down` | A key went down (`true`) or up. Keys by their code name: `KeyA`, `F5`, `Digit1`, `Space`. |
| `next_stop` | `new, old` | The next stop of the duty changed to another name. |
| `view` | `new, old` | The camera changed: `driver`, `pax`, `outside`, `free`, `foot`. |
| `duty` | `line, tour` | The duty changed. |

Within a frame `vehicle` comes first, then timers, watches, `key`, `next_stop`, `view`,
`duty` and `frame`. A handler that fails stops the call it runs in: the handlers after
it do not run, and in a frame neither do the events still to come in that frame.

## Timers and watches

| Function | |
|---|---|
| `omsi.after(seconds, fn)` | Runs `fn` once, after `seconds`. Returns an id. |
| `omsi.every(seconds, fn)` | Runs `fn` every `seconds`. Returns an id. |
| `omsi.watch(name, fn)` | Runs `fn(new, old)` when the bus's variable `name` changes. Returns an id. |
| `omsi.watch(kind, name, fn)` | The same for `var`, `str` (string variable) or `sys` (system variable). |
| `omsi.cancel(id)` | Ends a timer or watch. |
| `omsi.time()` | Seconds the plugin has run (game time). |

## The player's bus

| Function | |
|---|---|
| `omsi.has_vehicle()` | Whether the player drives a vehicle. |
| `omsi.vehicle()` | Its name (manufacturer and model), or `nil`. |
| `omsi.var(name)`, `omsi.set_var(name, value)` | A script variable of the bus. `set_var` returns `false` for a name the bus does not have. |
| `omsi.str(name)`, `omsi.set_str(name, text)` | A string variable. |
| `omsi.vars()`, `omsi.vars("str")` | The names of its variables, or of its string variables. |
| `omsi.press(trigger)`, `omsi.release(trigger)`, `omsi.trigger(trigger)` | A trigger's key down, up, or both. |
| `omsi.position()` | `x, y, z, heading` (degrees), or nothing. |
| `omsi.speed()` | km/h. |
| `omsi.distance(x, y)` | Metres from the bus to a point, or `nil`. |

`omsi.sys(name)` reads an OMSI system variable: `Time`, `GetTime`, `Timegap`, `Pause`,
`Day`, `Month`, `Year`, `DayOfYear`, `Weather_Temperature`, `Weather_AbsHum`,
`PrecipType`, `PrecipRate`, `SunAlt`, `AutoClutch`, `NoSound`, `mouse_x`, `mouse_y`,
`coll_pos_x`, `coll_pos_y`, `coll_pos_z`, `coll_energy` and `wearlifespan`, in any case.
It returns `nil` for any other name.

## The game

`omsi.info()` returns a table of what the game is doing. Fields that do not apply are
`nil` (no duty, no bus); `map` is an empty string without a map.

| Field | |
|---|---|
| `map` | The map's name (empty without a map). |
| `clock`, `day`, `year` | Seconds of the day, day of the year, year. `omsi.clock()` gives `"HH:MM:SS"`. |
| `view`, `paused`, `on_foot`, `multiplayer` | The camera, and flags. |
| `traffic` | AI vehicles on the map. |
| `speed`, `delay` | The bus's speed (km/h) and how late it is (s). |
| `line`, `tour` | The duty. |
| `trip`, `trips` | The trip's number in the duty (from 1) and the duty's trips. A duty started at one trip (`--trip` without `--whole-tour`) has just that trip: `1` and `1`. |
| `terminus` | The trip's terminus. |
| `next_stop` | The next stop's name. |
| `next_stop_arrival`, `next_stop_departure` | Its timetable times, seconds of the day. |

`omsi.command(name)` runs a game menu action after the frame: `refuel`, `wash`,
`repair`, `save`, `load`, `weather`, `later`, `earlier`, `info`,
`timetable`, `couple`, `uncouple`. It returns `false` for any other name, and once
eight commands are waiting in the same frame.

`omsi.message(text, seconds)` shows a line on the screen (5 s by default).
`omsi.log(...)`, `omsi.warn(...)` and `print(...)` write to the game's log.
`omsi.version` and `omsi.name` are the game's version and the plugin's name.

## Saved data

`omsi.data` is a table kept between sessions: it is written when the plugin stops and
read back when it starts (`plugins/<name>/data.save.lua`, or `<name>.save.lua` beside a
single file). Numbers, text, flags and tables of them are kept. `omsi.save()` writes it
at once.
