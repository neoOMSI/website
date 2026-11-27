# Map Creators

## Assign drivers to AI bus depots

Use `[neo_ai_driver]` in your map's `ailists.cfg` to give a depot its own set of driver figures. This neoOMSI extension is available in **0.4.0 Nightly** and applies to timetable AI buses assigned to that depot.

### Add the driver list

1. Open `maps\Your Map\ailists.cfg` and find the depot's `[aigroup_depot]` entry.
2. Add a `[neo_ai_driver]` block inside that depot's section, after the last vehicle list's `[end]` and before the next AI group. The block belongs to the most recently declared group.
3. List one `.hum` file per line, using paths relative to the installed content root, starting with `Humans\`. Close the list with its own `[end]`. Replace the example paths with figures installed by your players.

```ini
[aigroup_depot]
North Depot
Example Map

[aigroup_depot_typgroup_2]
Vehicles\Example Bus\example.bus
1001
[end]

[neo_ai_driver]
Humans\Example Drivers\driver_01.hum
Humans\Example Drivers\driver_02.hum
[end]
```

Keep your existing fleet and timetable assignments. Add a separate block for each depot that needs its own figures.

### Test the assignment

Set **Options → Gameplay → AI Traffic → AI Bus Drivers** to **Automatic**, load the map, and check a timetable bus from the depot you edited. A specific figure or a Random option in that setting takes priority when it can supply a driver.

neoOMSI skips missing or unloadable figures. When the depot has no usable driver list, it uses the map's `drivers.txt`. Keep that file for the usual map-wide fallback and for OMSI 2, which uses its existing driver selection.

### Change drivers for a Chrono event

Add a `[neo_ai_driver]` block under the matching depot in the event's `ailists_#upd.cfg` or `ailists.cfg`. A non-empty list replaces that depot's base driver list during the event. A Chrono depot entry with no driver list keeps the base list.
