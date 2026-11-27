# Trolleybuses

neoOMSI runs trolleybuses made for the **TrolleyGrid** plugin (Ackerman Projects, OMSI
2.3.004) natively: the poles run on the map's overhead wires, the bus gets traction power
only while both are on, and they come off when driven badly. The plugin's library
(`TrolleyWirePlugin.dll`) is never loaded; its settings and its list of trolleybuses are
read from the files it installs in `plugins\`.

This page says what neoOMSI looks for, so that a bus or a map can be built or converted for
it. Everything here also works without the plugin installed: missing files fall back to the
values TrolleyGrid 1.0 Open Beta ships with.

## Settings files

| File | Purpose |
| :--- | :--- |
| `plugins\TrolleyWirePlugin.cfg` | Wire, pole, physics, spark and sound settings (`[global]`, `[physics]`, `[sparks]`, `[sound]`) |
| `plugins\TrolleyWireVehicles.ini` | One `[vehicle:<name>]` section per trolleybus: where its poles are |

Both are plain `key=value` files. The first content root that has a file wins. A missing key
keeps its default.

## The vehicle

### What makes a bus a trolleybus

A vehicle is a trolleybus when **its scripts declare the variable `shtanga_wire_present`**
(in any varlist of its `[varnamelist]`). Nothing else is checked; a bus without it is left
alone.

### Where the poles are

Pole geometry comes from `TrolleyWireVehicles.ini`. An entry belongs to a bus when its
`bus_file` matches the end of the bus's `.bus` path (case does not matter; a bare file name
matches in any folder):

```ini
[vehicle:my_trolleybus]
enabled=1
bus_file=Vehicles\My Trolleybus\my_trolleybus.bus
; pole bases (model frame: x right, y forward, z up)
pole_base_left_x=-0.256101
pole_base_right_x=0.256101
pole_base_forward=0.226053
pole_base_height=3.116170
; the shoe's contact point with the pole at rest (hooked down)
contact_left_x=-0.261714
contact_right_x=0.253469
contact_forward=-5.940704
contact_height=5.071949
```

- The distance from base to contact point is the pole's length.
- `pole_carrier_bus_file=<file>.bus` puts the poles on a coupled part (an articulated
  trolleybus's rear section) instead of the bus itself.
- Optional: `yaw_factor_left/right`, `pitch_factor`, `shoe_factor_left/right` (scale the
  output angles), `shoe_visual_drop_m` / `ai_shoe_visual_drop_m` (lower the drawn shoe),
  `contact_reach_release_error_m`, `contact_reach_release_time`.
- Without an entry, or for keys it leaves out, the `[global]` values of
  `TrolleyWirePlugin.cfg` are used (`pole_base_*`, `contact_rest_*`: the ZiU-682G).

### Variables

neoOMSI writes these once a frame, before the scripts run:

| Variable | Meaning |
| :--- | :--- |
| `shtanga_lev_pitch`, `shtanga_prav_pitch` | Pole raised from its rest pose (degrees) |
| `shtanga_lev_rot`, `shtanga_prav_rot` | Pole swung about the vertical (degrees, positive: tip to the left) |
| `shtanga_lev_shoe_rot`, `shtanga_prav_shoe_rot` | Shoe turned about its pivot to lie along the wire (degrees) |
| `shtanga_lev_shoe_pos_x/y/z`, `shtanga_prav_shoe_pos_x/y/z` | Contact point (model frame) |
| `shtanga_wire_present` | 1 while both poles are on the wire (power) |
| `shtanga_contact_force_left/right` | Contact force (N) |
| `shtanga_dewired_left/right` | 1 from coming off until the pole is back on the wire |
| `shtanga_engine_trip` | 1 while a pole is off (cut the traction) |
| `shtanga_manual_command_left/right` | 0 while the pole is hooked down, else 1 |
| `shtanga_spark_left/right` | 1 while the shoe sparks (for a `[light_enh_2]`) |
| `shtanga_speed_limit_active`, `shtanga_complex_overspeed` | A shoe is at a switch or crossing / too fast there |

And reads these, set by the scripts:

| Variable | Meaning |
| :--- | :--- |
| `shtanga_switch_pedal` | At a switch: 0.05 or more takes the leftmost branch, less the rightmost |
| `shtanga_manual_grab_left/right` | Going to 1 (a click on the pole) raises a hooked pole, or pulls down a raised one |
| `cp_zummer` | The cab's buzzer sounds while a pole is off only when this is 1 (or missing) |
| `shtanga_wire_reset` | 1 puts the poles on the nearest wire again (neoOMSI writes 0 back) |

For the AI, write `shtanga_switch_pedal` from `AI_Blinker_L/R` (left blinker: 1). An AI
bus's poles follow the wire and never come off: where its wire ends they go down quietly
and look for a wire again every `lost_reset_frames` frames. Only the pole angles and the
sparks are written for it.

### The model

Animate each pole with two `[newanim]` blocks about its base (`origin_trans` at the pole
base): first `origin_rot_x 90` with `anim_rot` on `shtanga_lev_pitch`, then
`origin_rot_y 90` on `shtanga_lev_rot`. The shoe takes `shtanga_lev_shoe_rot` about its own
pivot first (`origin_rot_y 90`), then the pole's two. Model the pole in its hooked-down
pose. Show the moving pole with `[visible] cp_SHTANGALEV 1` and a hooked one with `0`;
the scripts copy `shtanga_manual_command_left` into `cp_SHTANGALEV` for the player's bus.
The TrolleyGrid ZiU-682G files are a complete example.

## The map

### Wires

A spline carries wires when its **file name contains one of `spline_keywords`** (`[global]`
of `TrolleyWirePlugin.cfg`, comma separated, case does not matter). Default:
`Troll_lines_01.sli, Troll_lines_02.sli, Troll_lines, Troll_line, Trolleybus, trolley`.

Where the two wires hang is read from the spline's `.sli` profiles: the left wire is the
middle of all profile points left of the spline (`x < 0`), the right wire the middle of
those right of it, and the height is the lowest profile point (the wires' underside).
Without points on a side, `wire_x_left`, `wire_x_right` and `wire_height` are used
(-0.255, 0.255, 5.8 m). A mirrored spline is flipped.

### How spans join

- Wire ends closer than **0.3 m** that point against each other are one wire.
- An end with no such partner is joined across a gap to every wire that starts up to
  `exact_reacquire_max_move` (**3.75 m**) ahead, no more than 40° off its way and running on
  within 50° of it. Two such continuations make a switch; the shoes take the left or the
  right one by the pedal. This is how Tver's switches are laid: the wires stop about a metre
  before the switch object and go on about two metres after it.
- Wires that cross each other without a break are not joined; each shoe stays on its own.

Keep the wires of one direction as one chain of splines, and leave a gap of under 3.75 m at
switches. Spans running side by side (the other direction) are never joined.

### Switch and crossing objects

Objects only mark where a switch or crossing is: there the speed limit
(`complex_speed_limit_kmh`, 25 km/h, within `complex_contact_radius` of the object) applies
and the switch and crossing sounds play. The geometry comes from the splines alone.

An object is recognised by its **file name** (`[global]`, comma separated, case does not
matter; neoOMSI's own keys, TrolleyGrid itself only knows Tver's objects):

| Key | Default | Kind |
| :--- | :--- | :--- |
| `cross_keywords` | `Troll_strelka_OnKrest, Troll_strelka_TwoKrest, Trolley_cross` | Crossing (checked first) |
| `switch_keywords` | `Troll_strelka, Trolley_switch` | Switch |

A map with its own objects can add its names, for example:

```ini
[global]
switch_keywords=Troll_strelka, Trolley_switch, Fahrleitung_Weiche
cross_keywords=Troll_strelka_OnKrest, Troll_strelka_TwoKrest, Trolley_cross, Fahrleitung_Kreuzung
```

## Sounds

Played from `Sounds\AckerTroll\` of the OMSI folder as TrolleyGrid installs them:
`switch_left_sep.wav`, `switch_left_merg.wav`, `switch_right_sep.wav`,
`switch_right_merg.wav` and `cross.wav` (with `_int` variants inside the bus), `iskra.WAV`
(spark) and `wheel_sliding.wav` (the shoes gliding along). The buzzer is
`Sound\zummer_115.wav` of the bus.

## Not the plugin's behaviour

The settings' values are TrolleyGrid's, but how neoOMSI combines them (the contact force,
the sideways force, a pole raised beside the wire, the catcher) is its own model and has not
yet been compared with the plugin in OMSI 2.3.004. `OMSI_DEBUG_TROLLEY=1` logs both poles of
the player's bus every frame.
