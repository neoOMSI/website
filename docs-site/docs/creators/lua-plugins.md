# Lua plugins

neoOMSI runs two kinds of plugins from the `plugins` folder of the game and of each
content root:

- **OMSI plugins**: an `.opl` file and its DLL, driven as OMSI 2 drives them (system
  variables, the bus's variables, string variables and triggers). Existing plugins work
  without changes; a 32-bit DLL runs in a small helper process.
- **Lua plugins**: scripts for neoOMSI's own API, described here. They see much more of
  the game than an OMSI plugin and need no compiler.

Plugins in a mod load only after the player allows them on the Mods page.

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

The file runs once when the game starts. Then the plugin hears events (see below),
runs its timers and reads and writes the bus. A changed `.lua` file is loaded again while
the game runs (the `stop` event, then a fresh start); files in the plugin's data folder
do not count.

## The sandbox

Each plugin has its own Lua 5.4 with the safe libraries only: `table`, `string`, `math`,
`utf8`, `coroutine`, `os.clock`, `os.time`, `os.date` and `os.difftime`. There is no
`io`, no other `os` function, no `dofile`, `loadfile` or C modules. `require` finds
modules in the plugin's own folder.

The ways out of the sandbox are `omsi.files.read` (a file of the plugin's data folder)
and `omsi.send` (a UDP message to this computer).

A call into a plugin that runs longer than one second is stopped. A plugin whose calls
fail ten times is switched off until it changes or the game restarts. Errors go to the
log and appear on screen.

Lua plugins run while the game runs, not while it is paused. Game events that happen
during a pause wait for the next frame.

## Events

A plugin registers handlers with `omsi.on(event, fn)`, or defines a global function
`on_<event>`. `omsi.off(event, fn)` removes a handler.

| Event | Arguments | When |
|---|---|---|
| `start` | | The plugin was loaded. |
| `vehicle` | `name` | The player's vehicle changed; `nil` without one. |
| `frame` | `dt` | Every frame, after timers and watches; seconds since the last. |
| `stop` | | The plugin is unloaded: the game ends or the file changed. |
| `key` | `key, down` | A key went down (`true`) or up. Keys by their code name: `KeyA`, `F5`, `Digit1`, `Space`. |
| `next_stop` | `new, old` | The next stop of the duty changed: another name, or the same name at another stop number. |
| `view` | `new, old` | The camera changed: `driver`, `pax`, `outside`, `free`, `foot`. |
| `duty` | `line, tour` | The duty changed. |
| `crash` | `energy_kj, speed_kmh` | The player's bus hit something (the speed just before). |
| `pedestrian` | `count` | The player's bus knocked down people. |
| `stops_skipped` | `count, due_at, now_at, trip` | The duty jumped on over stops: a page's skip, or the bus found at a later stop. `count` stops were not served; it was due at stop `due_at` and is due at `now_at` (stop numbers from 1). A stop driven past is not a jump. |
| `trip_done` | `trip, how, driving, comfort, ticket_selling` | A trip of the duty ended, once per trip. `how` is `arrived`, `skipped` (never begun) or `given_up`. The ratings are the session's so far, in per cent. Also when the player leaves the duty or the game ends; not when the game restarts into the same session. |
| `jolt` | `along, across, speed_kmh, passengers` | Braking, accelerating or cornering hard enough to cost driving rating (m/s²), at most once a second. |
| `ticket_sold` | `name, price` | A ticket was sold at the cash desk. |
| `service` | `kind, by, amount` | `refuel` (litres), `wash`, `repair` (minutes), `reset` or `teleport` (metres), by `player`, `plugin`, `host` or `game`. |
| `red_light` | `speed_kmh` | The player's bus went over a stop line at red (see [Traffic lights](#traffic-lights)). |

Within a frame the game's events (`crash` to `red_light`) come first, then timers,
watches, `key`, `next_stop`, `view`, `duty` and `frame`. A handler that fails does not
keep the other handlers from their event.

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
| `omsi.vehicle_manufacturer()`, `omsi.vehicle_model()` | The two halves of its `[friendlyname]`. |
| `omsi.bus.file()` | Its file, relative to the game folder: `Vehicles/MAN_SD202/SD202.bus`. |
| `omsi.var(name)`, `omsi.set_var(name, value)` | A script variable of the bus. `set_var` returns `false` for a name the bus does not have. |
| `omsi.str(name)`, `omsi.set_str(name, text)` | A string variable. |
| `omsi.vars()`, `omsi.vars("str")` | The names of its variables, or of its string variables. |
| `omsi.press(trigger)`, `omsi.release(trigger)`, `omsi.trigger(trigger)` | A trigger's key down, up, or both. |
| `omsi.position()` | `x, y, z, heading` (degrees), or nothing. |
| `omsi.speed()` | km/h. |
| `omsi.distance(x, y)` | Metres from the bus to a point, or `nil`. |

`omsi.sys(name)` reads an OMSI system variable: `Time`, `Timegap`, `Pause`, `Day`,
`Month`, `Year`, `DayOfYear`, `Weather_Temperature`, `Weather_AbsHum`, `PrecipType`,
`PrecipRate`, `SunAlt`, `AutoClutch`, `NoSound`.

## The game

`omsi.info()` returns a table of what the game is doing. Fields that do not apply are
`nil` (no duty, no bus).

| Field | |
|---|---|
| `map`, `map_path` | The map's name, and its folder relative to the game folder. |
| `situation` | The situation file the game was started from (`maps/Grundorf/laststn.osn`); `nil` for a new game. |
| `clock`, `day`, `year` | Seconds of the day, day of the year, year. `omsi.clock()` gives `"HH:MM:SS"`. |
| `view`, `paused`, `on_foot`, `multiplayer` | The camera, and flags. |
| `traffic` | AI vehicles on the map. |
| `speed`, `delay` | The bus's speed (km/h) and how late it is (s). |
| `line`, `tour` | The duty. |
| `trip`, `trips` | The trip's number in the tour (from 1) and the tour's trips, as `--trip` and saved situations count them. |
| `trip_name`, `terminus`, `stops` | The trip's timetable name, its terminus and how many stops it has. |
| `trip_done` | `true` once the bus has reached the trip's last stop. |
| `next_stop`, `next_stop_number`, `next_stop_id` | The next stop's name, its number in the trip (from 1) and its id on the map. |
| `next_stop_arrival`, `next_stop_departure` | Its timetable times, seconds of the day. |

`omsi.command(name)` runs a game menu action after the frame: `refuel`, `wash`,
`repair`, `reset`, `shot`, `save`, `load`, `weather`, `later`, `earlier`, `info`,
`timetable`, `couple`, `uncouple`. It returns `false` for any other name.

`omsi.message(text, seconds)` shows a line on the screen (5 s by default).
`omsi.log(...)`, `omsi.warn(...)` and `print(...)` write to the game's log.
`omsi.version` and `omsi.name` are the game's version and the plugin's name.

## Duties

A plugin can set the player's duty, as a companion app that hands out tours does.

`omsi.duty.trips([line[, tour]])` lists the timetable's trips, of one line and tour when
given. Each is a table:

| Field | |
|---|---|
| `line`, `tour` | As the timetable names them (and `omsi.duty.start` takes them). |
| `trip` | Its number in the tour, from 1: the number `omsi.info().trip` and `trip_done` give. |
| `name`, `terminus`, `sign` | The trip's timetable name, its terminus and the line number it shows. |
| `departure` | Seconds of the day (past 24:00 after midnight). |
| `allowed`, `today` | Whether the line is for the player, and whether the tour runs today. |

`omsi.duty.start(line, tour[, trip])` starts a duty at the trip's first stop: `trip` is
its number in the tour, its name or `"HH:MM"` (the first trip leaving in that minute, else
the first after). Without it, the trip under way or next. The request is checked at once
and the duty starts after the frame. It returns `true`, or `false` and why: no
timetable, no bus, an unknown line, tour or trip, a line not for the player, a tour that
does not run today, or a trip over by half an hour. Starting a duty ends the one before
(`trip_done` for its trip). One change a frame: the last asked for.

`omsi.duty.stop()` ends the duty after the frame; `false` without one.

```lua
-- the next tour the company gave the driver
local ok, why = omsi.duty.start("76", "3", 2)
if not ok then omsi.message("Could not start the duty: " .. why) end
```

## Traffic lights

`omsi.traffic.light_ahead([range])` returns the next traffic light on the bus's way
within `range` metres (250 by default, at most 1000), or `nil`. The way is the one the
bus will take as it asks the lights for green: the branch it indicates at a fork, else
the straightest. The table has:

| Field | |
|---|---|
| `aspect` | `red`, `red-yellow`, `green`, `yellow`, or `off` for a dark light. |
| `seconds` | How long it keeps showing that; `nil` when that is not sure (it waits for a request or a train, or never changes). |
| `distance` | Metres from the bus's front to the stop line; just below 0 while the front is just over it. |
| `state` | OMSI's light state number. |

The lights are the ones the AI traffic drives by, so scripted signals and level crossings
count as the game shows them. A tram is not judged by the street's lights: `nil` on
rails.

The `red_light` event comes when the bus's front went over a stop line at red. Since an
app may penalise a driver for it, it errs on the side of missing a run rather than
blaming a driver:

- The front must be 2 m over the line, moving faster than 0.3 m/s; standing or rocking at
  the line is not a crossing.
- The light must have been red at the last look before the line, at the crossing and
  still 12 m on (driven, backing up taking metres off). Late amber is not a run, and
  neither is green seen while waiting just over the line.
- Which light applied is told by the lane the bus took of those starting at the line,
  12 m on: the nearest lane, and any about as near. All of their lights must have been
  red: straight on at green past a red turn arrow is not a run, nor a free turn beside a
  red light.
- A crossing not told within 40 m, a jump (teleport, another bus) or an emergency run
  counts for nothing.

## Saved data

`omsi.data` is a table kept between sessions: it is written when the plugin stops and
read back when it starts (`plugins/<name>/data.save.lua`, or `<name>.save.lua` beside a
single file). Numbers, text, flags and tables of them are kept. `omsi.save()` writes it
at once.

## Files from other programs

`omsi.files.read(name)` reads a file of the plugin's data folder: `plugins/<name>/data/`
for a folder plugin, `plugins/<name>.data/` for a single file. Names may have folders
(`sub/status.txt`) and are found in any case. Nothing outside the folder can be read: no
`..`, no absolute names, no links out of it. A file may be up to 1 MB. It returns the
text, or `nil` and why.

```lua
local text = omsi.files.read("status.vsm")
if text then ... end
```

## Sending to another program

`omsi.send(port, text)` or `omsi.send(host, port, text)` sends `text` as one UDP
datagram to a program on this computer. The host can only be `localhost` or
`127.0.0.1`; the port must be 1024 or above. A plugin may send 100 messages within any
second, each up to 8 KB. It returns `true`, or `false` and why (the port, the size, the
rate).

```lua
if omsi.send then
  omsi.on("trip_done", function(trip, how)
    omsi.send(5005, string.format('{"trip":%d,"how":"%s"}', trip, how))
  end)
end
```
