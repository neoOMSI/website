# Trams: pantographs and overhead wires

OMSI 2 has no overhead wire for trams. Its trams get power everywhere, and their scripts
find the wire themselves with `GetHeightAbovePoint` (NF6D, KT4D, Konstal N) or with coded
third rails (`contactshoe_0_volt_rail` 9030 marks a section separator, 9031–9047 the wire
height). neoOMSI runs all of that as OMSI 2 does.

On top of that, neoOMSI can give a tram **real wire contact**: a pantograph defined for the
vehicle touches the map's wires, and its scripts are told the wire height, contact and
voltage. This is a neoOMSI feature, not OMSI behaviour, available from the **0.4.0 Nightly**
line on. A vehicle without a pantograph definition is left exactly as it is, with power
everywhere.

The options **Tram pantographs touch the wires** (on by default) and **Staggered tram
wires** (off by default) are under Gameplay (see
[Options](../player/options.md#tram-overhead-wires)). Both take effect when a map is loaded.
With the first one off, every raised pantograph has power.

## The vehicle

### `[neo_pantograph]`

Add one block per pantograph to the `.bus` or `.ovh` file of the part that carries it (an
articulated tram's middle section, for example). OMSI 2 ignores the block.

```
[neo_pantograph]
0           x: across the body (m, right positive)
2.556       y: along the body (m, forward positive)
4.2         height of the head when lowered (m)
4.27        lowest working height (m)
5.83        highest working height (m), where the head stops without a wire
0.6         half the width of the head (m)
90          static contact force (N)
Panto_oben  variable that raises it while above 0.5 (- : always raised)
0.6         optional: how fast the head rises and lowers (m/s)
```

Heights are in the part's frame (z up from its origin), the same frame
`GetHeightAbovePoint` uses. The pantographs of a part are numbered from 0 in file order.

### Without changing the vehicle: `neoOMSI\catenary.cfg`

For a vehicle whose files you do not want to edit, put the blocks in
`neoOMSI\catenary.cfg` under the OMSI folder (or in a mod's content root). A `[vehicle]`
line names the end of the part's path, and the `[neo_pantograph]` blocks after it belong to
that part:

```
[vehicle]
Vehicles\Tram_NF6D\NF6D_C.bus
[neo_pantograph]
0
2.556
4.2
4.27
5.83
0.6
90
-
```

A file's own `[neo_pantograph]` blocks win over an entry here.

### Variables

neoOMSI writes these once a frame, before the scripts run, **only if the script declares
them** (as OMSI 2 does with `contactshoe_<n>_*`). `<n>` is the pantograph's number on its
part. On a coupled part with scripts of its own, they go into that part's variables.

| Variable | Meaning |
| :--- | :--- |
| `pantograph_<n>_height` | Height of the head (m) |
| `pantograph_<n>_lift` | Rise of the head from its lowered height (m): put it in a `[newanim]` `anim_trans` so the drawn head follows the wire |
| `pantograph_<n>_wire_height` | Height of the wire over the head (m), 0 when none |
| `pantograph_<n>_lateral` | Offset of that wire across the head (m, right positive) |
| `pantograph_<n>_contact` | 1 while the head touches a wire |
| `pantograph_<n>_dewired` | 1 after the wire slid off the head's edge, until lowered |
| `pantograph_<n>_volt` | Voltage at the head: 0 without contact, dewired, on a dead section or at a separator |
| `pantograph_<n>_force` | Contact force (N), 0 without contact |
| `pantograph_<n>_separator` | 1 while the track under it marks a section separator |
| `pantograph_<n>_spark` | 1 while the head arcs, for a `[light_enh_2]` of the vehicle's own |

The lift variable is read from the same script.

## How the contact works

This model is neoOMSI's own. There is no OMSI 2 reference for it.

- The wires that cross the plane across the body at the pantograph count, if they run
  within 60° of the body's way. Cross-span wires do not count.
- The head rises at its speed to the lowest wire that is within its width and its working
  range. The wire presses it down, and it follows the wire up while touching it. Without a
  wire it rises to its highest working height.
- Wires above the highest or below the lowest working height are not touched.
- At a wire switch the head touches both wires and keeps the one it ran on. It takes the
  other one when the first leaves the head, so it stays on the wire of the branch its
  track takes.
- If the wire it ran on slides off the head's edge while no other wire is under the head,
  the pantograph is **dewired**: it rises past the wire and stays off until it is lowered.
  A wire that just ends does not dewire it. An AI tram's driver puts it back up as soon as
  a wire is over the head again.

## Sparks and sounds

These are neoOMSI's own effects. There is no OMSI 2 reference for them.

The head arcs when a moving tram breaks contact, runs onto or off a section separator,
or is dewired. With ice on the wire it also arcs at random, about 1.5 times a second; in
rain, 0.2 times, and in snow, 0.3 times. During an arc neoOMSI draws glowing sparks and a
bluish flash at the head, and the flash lights the surroundings.

Heard are a clack when the head runs onto or off a separator, and a crackle for every arc.
neoOMSI makes both sounds itself. To use files instead, give them in
`neoOMSI\catenary.cfg` (paths from the OMSI folder); `-` switches a sound off:

```
[separator_sound]
Sounds\MyTram\trenner.wav
[spark_sound]
-
```

A vehicle's own `sound.cfg` can play its own sounds with the triggers
`pantograph_<n>_separator`, `pantograph_<n>_spark` and `pantograph_<n>_dewire`. Switch
neoOMSI's sounds off then, so that they are not heard twice.

## The map

### Which splines are wires

A spline counts when its file name contains one of the wire keywords (below) **and** it has
wire profiles. A profile is a wire when all its points are between 3 and 9 m above the
spline and it is at most 10 cm wide. A spline that is only a cable (no `[path]`, every
profile at most 10 cm wide and tall) is a wire at whatever height the map lays it.
Profiles less than 6 cm apart are one wire, at their lowest point. This finds all kinds
used in OMSI 2 maps:

- wire splines (`OL_480.sli`, `Fahrdraht.sli`, `tram_drat.sli`)
- cable splines laid at wire height (Eberlinsee's `Perotinus\stromleitung.sli`)
- track splines that also draw the wire (`Meterspur_normal_OL_520.sli`; Prague's
  `kolej*.sli`, which draw two tracks' wires in one spline)

The 2 m wide planes that some splines lay at wire height for `GetHeightAbovePoint` are not
wires.

### Voltage and dead sections

| Data | Effect |
| :--- | :--- |
| `[neo_catenary]` + voltage in a `.sli` | Voltage of the wires in that spline; `0` makes a dead section |
| `[third_rail]` with a separator code (default 9030) | Section separator: 0 V while the pantograph's nearer bogie is over it |
| none | The default voltage, 600 V |

The 9030 code is the one the Kartoffelphantom and NF6D splines already use
(`Meterspur_normal_OL_*_Streckentrenner.sli`).

### `neoOMSI\catenary.cfg` settings

| Key | Default |
| :--- | :--- |
| `[wire_keywords]` count, then one per line | `oberleitung`, `fahrdraht`, `fahrleitung`, `_ol_`, `_ol.`, `/ol_`, `/ol.`, `drat`, `siec`, `kolej`, `tram`, `strab`, `strassenbahn`, `straßenbahn`, `meterspur`, `stromleitung` |
| `[voltage]` | `600` |
| `[separator_codes]` count, then one per line | `9030` |
| `[separator_sound]`, `[spark_sound]` | neoOMSI's own sounds |

Each setting comes from the first file that gives it. The `[vehicle]` entries of all files
are used.

### Staggered wires

OMSI 2 maps lay the wire straight above the track. With the option on, neoOMSI moves it
0.2 m from side to side, back in the middle every 30 m along a spline. This is neoOMSI's
own model.

## Building a map for wire contact

A map that follows the rules on this page makes the overhead wire part of how a tram
drives, not only scenery. It gains:

- **Power only under the wire.** A track without a wire has no power, so sidings or depot
  tracks without a wire can be built on purpose.
- **Dead sections.** `[neo_catenary]` with `0` in a `.sli` switches a section off, for
  example a closed work site.
- **A voltage per section.** `[neo_catenary]` with `600` or `750` sets it for each wire
  spline, so a tram can react to a change between two networks.
- **Section separators that act.** A 9030 third rail or a short 0 V wire spline gives a
  short gap in the voltage, with sparks and the separator's clack.
- **Wire switches without special objects.** Lay the wire splines over each other at the
  switch; the pantograph keeps to the wire of the branch its track takes.
- **Real consequences.** Lowering the pantograph while moving or a wire laid too far to the
  side gives sparks, lost contact or a dewired pantograph. It also shows you at once where a
  wire lies badly.

The map still works in OMSI 2: it ignores `[neo_catenary]`, draws the wires as before, and
the trams' own `GetHeightAbovePoint` finds them as before.

When you build the wire:

- Lay a wire over every track a tram runs on, at termini and in loops too.
- In curves, keep the wire close to the middle of the track: short chords, at most about
  0.6 m to the side at their joints. Longer chords work only for wide heads, and they leave
  no room for **Staggered tram wires**.
- Keep the wire within the vehicles' working range, usually 4.6 m to 6 m above the rail.
- Give the spline a file name that contains a wire keyword (`ol_`, `fahrdraht` and so on)
  and draw the wire as a thin profile, or add your own keyword in `neoOMSI\catenary.cfg`.
- Mark separators and dead sections with the data in
  [Voltage and dead sections](#voltage-and-dead-sections).

The wire only matters to a vehicle with a pantograph definition. Power is missing only for
a tram whose scripts read `pantograph_<n>_volt`.

## Checking a tram

`OMSI_DEBUG_PANTOGRAPH=1` logs every pantograph of the player's vehicle each frame: place,
head height, wire height, lateral offset, contact, dewired, voltage, separator, the
third-rail codes under the nearer bogie and the wires found across the head.
`OMSI_DEBUG_PANTOGRAPH=all` logs the AI vehicles' too. The log
starts with one `catenary:` line per wire spline type found.
