# Passengers

neoOMSI fills bus stops and pavements from the map's timetable and stop objects. You can
choose between two rule sets: OMSI 2's own, or neoOMSI's, which make stops fill and empty
more like real ones. This page explains both and lists the settings that change them.

How passengers choose their place in the bus, which doors they use and how they move is
described in the user guide under [Passenger seating](user-guide.md#passenger-seating) and
[Passenger models and movement](user-guide.md#passenger-models-and-movement).

## Choose the rule set

**Options → OMSI parity → Passengers as in OMSI** selects the rules. It is off by default.

| Behavior | neoOMSI rules (default) | **Passengers as in OMSI** |
| :-- | :-- | :-- |
| Which stops fill | Stops within the **Passenger simulation distance** | Only stops on the nine tiles around you |
| AI buses | Already carry riders when they appear | Start empty |
| How many wait at a stop | Every line due there adds people, up to the **Boarders per bus** limit per call | At most one line's worth of people |
| When people arrive | Over the time since that line's last bus, all there when the bus is due | As in OMSI 2 |
| People appearing | Nobody appears at a waiting place in view closer than 120 m | As in OMSI 2 |
| Waiting passengers | Give up and go home eventually | Never give up |
| Rain and snow | Keep some pedestrians indoors | No effect |

In [`settings.toml`](user-guide.md#settings-file) the option is `passengers` under
`[parity]`: `true` uses OMSI's rules, `false` neoOMSI's.

## How stops fill up

Both rule sets take the number of people a stop wants from the same sources:

- the calls of timetable trips at that stop: a call starts to count shortly before it is due
  and stops counting once a bus has served it, or once it is 40 minutes late;
- the stop object's passenger numbers in the map (see [For map makers](#for-map-makers));
- the map's hourly passenger density and the **Passengers** slider of the in-game **World**
  page.

With neoOMSI's rules, these points also apply:

- **Lines.** People wait for their own line. A bus of another line that goes to their
  destination passes them by. A bus without a duty (for example your own bus without a
  timetable) takes anybody going its way.
- **Interchanges.** A stop served by several lines fills with people for every line due,
  so it gets busier than a stop of a single line. No stop takes more than a quarter of
  **Humans max count**. At such a stop, some riders who get off stay to change lines (up to
  **Riders changing lines**).
- **Late or missed buses.** People take any bus going their way once their line's bus has
  left without them, no call of their line is due any more, or it is more than 10 minutes
  late.
- **Left behind.** People that a full bus could not take wait up to 20 minutes and board
  the next bus at that stop first.
- **Giving up.** A waiting passenger gives up once 1.25 times the gap between their own
  call and the line's next comparable call has passed since their call, or an hour after
  their call if there is none, but never before their own call is 40 minutes late.
- **Out of sight.** Instead of appearing at a stop in view, people walk in along the
  footpath from out of sight, and pedestrians within 40 m may join the stop.
- **Weather.** Rain and snow keep pedestrians indoors: in the heaviest rain or snow only the
  share set by **Pedestrians out in heavy rain** stays out, lighter rain keeps fewer
  indoors.

## Settings

All of these can be changed in the game. In [`settings.toml`](user-guide.md#settings-file)
they are stored under `[passengers]`, apart from `passengers` under `[parity]`. The ranges
in the table are what the file accepts; the sliders in the game cover less (for example
**Boarders per bus** 20 to 200, **Longest arrival time** 2 to 30, **Passengers** 0.25 to 2).

| Option | Where | Key | Default | Effect |
| :-- | :-- | :-- | :-- | :-- |
| **Passengers as in OMSI** | **Options → OMSI parity** | `[parity] passengers` | `false` | Uses OMSI 2's rules instead of neoOMSI's |
| **Boarders per bus** | **Options → OMSI parity → neoOMSI passenger rules** | `own_bus_load` | `97` | The most people one bus takes on at a stop (a 12 m city bus with 33 seats and 64 standing places). 1 to 400 |
| **Riders changing lines** | **Options → OMSI parity → neoOMSI passenger rules** | `own_transfer_share` | `0.4` | Share of riders getting off at an interchange who stay to change lines. 0 to 1 |
| **Pedestrians out in heavy rain** | **Options → OMSI parity → neoOMSI passenger rules** | `own_rain_out` | `0.5` | Share of pedestrians still out in the heaviest rain or snow. 0 to 1 |
| **Longest arrival time** | **Options → OMSI parity → neoOMSI passenger rules** | `own_arrival_minutes` | `10` | How many minutes before a bus its passengers start coming to the stop. Shorter intervals between buses shorten it. 2 to 60 |
| **Passenger simulation distance** | **Options → Gameplay** | `simulation_distance` | `medium` | How far stops and running buses carry passenger demand (neoOMSI rules only) |
| **Humans max count** | **Options → Gameplay**, or the in-game **World** page | `max_humans` | `200` | The most people on the map at once: waiting, walking and riding |
| **Passengers** | In-game **World** page | `density` | `1.0` | Scales how many passengers wait at the stops. 0 to 5 |
| **Passengers hail buses** | **Options → Gameplay** | `hail_buses` | `true` | Passengers near the kerb turn towards a suitable approaching bus and hold an arm out until they board or the bus passes |
| **Pedestrians and passengers** | **Options → Gameplay** | `humans` | `installed` | `installed` uses all installed people, `map` only those listed in the map's `humans.txt` |

The four **neoOMSI passenger rules** values have no effect while **Passengers as in OMSI** is
on.

**Passenger simulation distance** has these values:

| Value | Key value | Range |
| :-- | :-- | :-- |
| **Short (450 m)** | `short` | 450 m |
| **Medium (900 m)** | `medium` | 900 m |
| **Long (1,800 m)** | `long` | 1,800 m |
| **Whole map** | `whole_map` | Tracks distant demand without loading scenery |

Animated people still count against **Humans max count**, whatever the distance. If buses
near you show fewer passengers than their passenger count, raise **Humans max count**;
higher values use more CPU and memory. At most half of **Humans max count** walk the
pavements. In a LAN session the host keeps a separate set of people around each player.

**Pedestrians and passengers** takes effect from the next map start. With `map`, people
listed twice in `humans.txt` appear twice as often. If the list names nobody that is
installed, all installed people are used. The setting is not used with the realistic
passenger models.

## For map makers

| Map data | Used for |
| :-- | :-- |
| Bus stop object, first string after the name | Most people waiting at the stop (default 1) |
| Bus stop object, second string after the name | Fewest people waiting at the stop (default 0) |
| Bus stop object, third string after the name | How many people get off there, relative to other stops; without it, the mean of the first two |
| `[trafficdensity_passenger]` in `global.cfg` | Hourly factor for waiting passengers and pedestrians |
| `[priority]` of a line | Whether AI buses run the line (see [Behavior details](../compatibility.md#ai-priority-scheduled)) |
| `humans.txt` | Which people appear when **Pedestrians and passengers** is set to the map's list |

Numbers are rounded. Each stop picks its own number of waiting people between the fewest and
the most. Passengers choose where to get off by the third number: a stop with twice the
number gets twice the riders.

`[trafficdensity_passenger]` entries are pairs of an hour and a factor. Between two entries
the factor is interpolated; before the first and after the last entry the nearest factor
applies. A map without entries uses 1. The factor scales:

- the number of people a stop wants, together with the **Passengers** slider;
- how many pedestrians a footpath carries: fewer than 0.01 people per metre, times the
  path's density rule and the hour's factor. With neoOMSI's rules, rain and snow lower this
  further.

The **Passengers** slider does not change the number of pedestrians on footpaths.
