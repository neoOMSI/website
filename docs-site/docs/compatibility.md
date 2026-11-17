# OMSI 2 compatibility

neoOMSI aims to reproduce the behavior players and content creators can observe in OMSI 2.2.032 while using a modern 64-bit engine. Compatibility is an ongoing project: a map or vehicle may load while some of its scripts, systems, or visual details still behave differently.

neoOMSI requires an installed copy of OMSI 2. It does not include the game's content. Use the release notes for the build you are playing to see recent changes, and keep the version menu set to the matching documentation version when comparing behavior.

## Reference baseline

The compatibility target is OMSI 2.2.032. This covers the behavior visible through supported maps, vehicles, scripts, and input devices. neoOMSI-specific features are described as such in the relevant guide.

## How to check whether content works

<span id="verification-workflow"></span>
<span id="compatibility-status"></span>

Start with a supported release and the content's required OMSI files installed. If the map or vehicle does not appear, check its loading messages for missing dependencies. A successful load does not guarantee that every feature has reached parity.

This guide describes **0.4.0 Nightly**. Use the version menu to switch to **0.3.0 Stable**. Nightly builds may change before release.

## How to report a mismatch

<span id="parity-evidence"></span>

Use the [issue tracker](https://github.com/neoOMSI/neoOMSI/issues) and include:

- the neoOMSI version and release channel;
- the map, vehicle, and add-on involved;
- the steps that reproduce the problem;
- what you expected and what happened;
- relevant neoOMSI logs or screenshots, with personal information removed.

Do not upload OMSI game files or other copyrighted content. A report should describe the behavior, not include proprietary game assets.

## How compatibility is checked

<span id="black-box-methodology"></span>

Compatibility reports are compared against OMSI 2.2.032 using the same content and settings where possible. Reports are most useful when the steps are repeatable and distinguish expected OMSI behavior from what neoOMSI displayed.

## Mod-specific issues

If a problem appears with one add-on, report it with that content's name and a small reproduction. The team will determine whether it reveals a general compatibility gap or depends on content-specific behavior.

## Behavior details

These points describe behavior that map and vehicle creators may notice. Except where
marked as a neoOMSI setting, they follow OMSI 2.2.032. For waiting passengers and
pedestrians, see [Passengers](player/passengers.md).

### AI buses off the rendered tiles

Which tiles count as rendered for this rule is decided by `[performance_tiledistmax]` in OMSI's
`options.cfg` (1 when the file is missing): the tiles that far around the viewer's own tile.
It does not change what neoOMSI draws; that is the view distance.
An AI bus outside those tiles keeps to the timetable: when it is more than 120 s early, it
stops at every stop, even with nobody waiting, and waits there for its departure time.

On rendered tiles, an early AI bus waits for its departure only at stops marked "wait dep.
time" in the timetable and at the end of its trip. A generous timetable leg therefore still
makes it arrive early at the other stops.

### AI lines and `[AIPriorityScheduled]` {#ai-priority-scheduled}

AI vehicles run only lines whose `[priority]` is not above `[AIPriorityScheduled]` in the
`options.cfg` of the OMSI folder. Without an `options.cfg`, the value comes from
`option_presets/minimum.oop`. A file without the key counts as 1, and so does a line
without `[priority]`.

Lines above the limit keep their timetable: passengers still wait for their buses, and you
can still drive them on your own duty.

### Strict AI stop positions

**Options → Gameplay → Strict AI stop positions** is a neoOMSI setting and is off by
default. It is stored as `ai_strict_stops` under `[gameplay]` in
[`settings.toml`](player/user-guide.md#settings-file).

| Setting | Where an AI bus held short of a stop opens its doors |
| :-- | :-- |
| Off (OMSI 2) | Where a red light or another vehicle holds it, up to 90 % of the stop's approach distance short of the stop |
| On | Only directly behind a bus at the stop, and at most 10 m short of the stop |

Either way, a bus within 5 m of the stop object has arrived. Maps are built around the
OMSI 2 behavior.

### Track switches

As in OMSI 2.2.032, an AI train sets the `Switch` variable of a switch object for the
lanes just ahead of it, and the player can click a switch in the free camera or on foot.

The player's tram or train also sets switches, by its route or by key. This is the neoOMSI
setting **Options → Gameplay → Switches by route** (`tram_points_by_route` under
`[gameplay]` in [`settings.toml`](player/user-guide.md#settings-file), on by default; see
[Switches by route](player/options.md#switches-by-route)). How a switch object is set by
the player's vehicle:

| Switch object | What the player's vehicle does |
| :-- | :-- |
| Has a `[mouseevent]` | Runs that event, as a click does, so the script's `{trigger:...}` runs (a spring-back timer restarts, an interlocking locks itself). |
| Its script reads `TrafficLightPhase` | Leaves `Switch` alone and asks for the traffic light of its branch, as an AI train asks for the lights on its route. |
| Has no `[mouseevent]`, or a `[switchdir]` other than 0 and 1 | Writes `Switch` directly, as an AI train does. |
| Its script turns it back after three clicks in a row | Leaves it to the script for 30 seconds. |

A switch is found by its tile and its map id. Objects on other tiles with the same id are
separate switches, for AI trains too. In a multiplayer session, where switches are sent by
id, the switch with that id nearest the player is meant.

A rail vehicle put onto a two-way track (two lanes on one line) stands on the lane that
runs its way, so it asks for the traffic lights of its own direction.

### Vehicle draw order

A vehicle is drawn in the `[mesh]` order of the first LOD in its `model.cfg`. Inside one
mesh, the O3D material subsets are drawn in their file order. neoOMSI uses this authored
order for a vehicle when the model relies on it:

- a blended material writes depth, so it hides parts listed after it, as in OMSI;
- a generated text layer follows a backing that does not write depth.

A blended material writes depth unless it has `[matl_noZwrite]` or `[matl_noZcheck]`. Its
name and texture alpha do not change that. Models use this, for example, to hide a rolled-up
sun visor above the roof with a fully clear blended box.

While working on an add-on, you can override the automatic choice with an environment
variable set before starting neoOMSI:

| Variable | Effect |
| :-- | :-- |
| `OMSI_MODEL_ORDER=1` | Draws every vehicle in authored order |
| `OMSI_MODEL_ORDER=0` or `OMSI_NO_MODEL_ORDER=1` | Never uses authored order |

### Printed glass

Blended window textures may contain both opaque print and translucent tint, including
repaint DDS atlases. neoOMSI keeps print and stickers lit as you move away from them,
while tint and clear areas keep their authored opacity. When a `[matl_transmap]` or a
material or instance alpha supplies the transparency, the pane keeps its reflection.

Set `OMSI_GLASS_PRINT=0` before starting neoOMSI to restore the earlier glass handling for
a comparison.

### Dry ground

Terrain, road splines, painted ground and Surface objects are lit as rough, non-metallic
ground. Overhead spline types such as wires, catenaries and canopies keep their own
shading.

| Property | Default |
| :-- | :-- |
| Roughness | 0.94 |
| Reflectance (F0) | 0.025 |
| Metalness | 0 |

- A material's legacy specular power does not change these defaults.
- PBR maps placed beside the diffuse texture (for example `road_normal`, `road_rough`,
  `road_metal`, `road_ao` or a packed `road_orm`) take priority, each for its own channel.
- The albedo always comes from the authored texture.
- Ground is not classified by texture file names such as "asphalt" or "grass".

Without an authored normal map, the ground gets a fine shared relief pattern up close.
**Options → Graphics → Detail texturing up close** turns it off.

## neoOMSI extensions

<span id="extensions"></span>

neoOMSI also has features that are not present in OMSI 2. These are documented as neoOMSI features and do not change the compatibility target.

### Material LED glow

<span id="material-led-glow"></span>

The `[led_glow_effect]` material setting was added in 0.3.0. It sets the LED-matrix
glow of one material. Write it inside the material's `[matl]` block of a model's `.cfg`,
followed by a strength from 0 to 1:

```text
[matl]
sign.bmp
0

[led_glow_effect]
0.4
```

Values outside 0..1 are clamped; `0` turns the glow off. The glow follows the material's
light map or night map when it has one. Materials without the setting keep the automatic
detection used before: a script-masked material (`\S:n`) with a white light map is treated
as an LED.

### PBR maps

<span id="pbr-maps"></span>

Any texture can bring PBR maps: files beside it with the texture's name and a suffix. For
`bus.dds`:

| Map | Suffixes |
| :-- | :-- |
| Normal map (Direct3D, green down) | `bus_nn`, `bus_normal`, `bus_nrm` |
| Normal map (OpenGL, green up) | `bus_nn_gl`, `bus_normal_gl`, `bus_nrm_gl` |
| Roughness | `bus_rr`, `bus_rough`, `bus_roughness` |
| Gloss (inverted roughness) | `bus_gg`, `bus_gloss`, `bus_glossiness` |
| Metalness | `bus_mm`, `bus_metal`, `bus_metallic`, `bus_metalness` |
| Ambient occlusion | `bus_aa`, `bus_ao`, `bus_occlusion` |
| Packed maps (the letters give the red, green and blue channel) | `bus_orm`, `bus_arm`, `bus_mra`, `bus_rma` |

- Each can be `.png`, `.tga`, `.dds`, `.bmp` or `.jpg`, and `-` works in place of `_`.
- Single-letter suffixes such as `_n` or `_r` are not read: OMSI mods use them for night
  maps and other textures.
- A roughness, metalness or occlusion map must be grey. A normal map must look like one.
  Other files are left alone.
- Roughness and metalness maps give the surface a real-time reflection. With **Envmap
  pictures** on, a material's `[matl_envmap]` picture is shown instead.

A repaint that brings only its colour texture uses the PBR maps of the model's texture it
replaces. This works for a file of the same name in the repaint's folder and for a
differently named file in a `.cti`. As soon as the repaint has one map of its own, it uses
only its own maps. A repaint that moves paint, chrome or stickers to other places should
bring its own roughness and metalness maps.

### Shared texture references

`[neo_texturepath]` and `[neo_texture]` are opt-in neoOMSI extensions for sharing texture
folders or single files between installed content packs. Content without these tags keeps
OMSI's lookup order. See [Shared assets](creators/shared-assets.md) for the syntax, the
search order and the limits in OMSI 2.

### Beam cookie headlamps

<span id="spotlight-cookie"></span>

Vehicles that declare their headlamps with `[spotlight_cookie]`, such as newer Sobol3D buses,
get their light from a picture of the beam. See [Beam cookie headlamps](creators/spotlight-cookies.md)
for the entry and the picture format.
