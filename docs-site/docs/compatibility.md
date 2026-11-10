# OMSI 2 compatibility

neoOMSI aims to reproduce the behavior players and content creators can observe in OMSI 2.2.032 while using a modern 64-bit engine. Compatibility is an ongoing project: a map or vehicle may load while some of its scripts, systems, or visual details still behave differently.

neoOMSI requires an installed copy of OMSI 2. It does not include the game's content. Use the release notes for the build you are playing to see recent changes, and keep the version menu set to the matching documentation version when comparing behavior.

## Reference baseline

The compatibility target is OMSI 2.2.032. This covers the behavior visible through supported maps, vehicles, scripts, and input devices. neoOMSI-specific features are described as such in the relevant guide.

## How to check whether content works

<span id="verification-workflow"></span>
<span id="compatibility-status"></span>

Start with a supported release and the content's required OMSI files installed. If the map or vehicle does not appear, check its loading messages for missing dependencies. A successful load does not guarantee that every feature has reached parity.

This guide describes **0.3.0**, currently available as a release candidate. Switch to **0.2.3 Stable** in the version menu to read the stable guide. Release candidates and nightlies may change without notice.

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

### Shared texture references

`[neo_texturepath]` and `[neo_texture]` are opt-in neoOMSI extensions for sharing texture
folders or single files between installed content packs. Content without these tags keeps
OMSI's lookup order. See [Shared assets](creators/shared-assets.md) for the syntax, the
search order and the limits in OMSI 2.
