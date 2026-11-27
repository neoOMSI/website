# Beam cookie headlamps

A `[spotlight_cookie]` in a vehicle's `model.cfg` is a lamp whose light comes from a picture,
a *beam cookie*, instead of a cone. The picture says how bright and in which colour the lamp
shines in every direction, so a low beam's cut-off, its hot spot and the tint of its fringes
are drawn exactly as the author painted them.

The keyword is not part of OMSI 2. Newer Sobol3D vehicles, such as the Solaris Urbino III
(3.02sE) and the MAN NL Enhanced V4, declare their headlamps only this way. neoOMSI reads it
from the 0.4.0 Nightly line on; OMSI 2 ignores it, so such a lamp is dark there.

## The entry

```
[spotlight_cookie]
1.08
5.48
0.83
0
1
0
75
lights_low
0
low_beam.png
0.03
```

| Line | Meaning |
| :--- | :--- |
| 1–3 | Position x, y, z (m, model frame: x right, y forward, z up). Used as written. |
| 4–6 | Direction x, y, z of the lamp's axis. |
| 7 | Range (m): how far the lamp reaches, at most 300. A longer range is also a brighter peak. |
| 8 | The variable that switches it: 0 off, 1 full, dimmed in between. A number is a constant. |
| 9 | *Optional.* `0` or `none`: a twin lamp mirrored across the vehicle's axis as well; `1`: just this lamp. |
| 10 | *Optional.* The picture, looked up in the vehicle's texture folders like a `[light_enh_2]` bitmap. |
| 11 | *Optional.* Time constant (s): the lamp is 63 % on after this time and fades to 27 % in the same time when switched off. `0`: at once. |
| 12 | *Optional.* Pitch offset in degrees (+ up): a variable, a number, or empty. |
| 13 | *Optional.* Yaw offset in degrees (+ right): a variable, a number, or empty. |

Everything after line 8 may be left out. The entry ends at the next keyword, at the end of the
file, or at the first line that cannot stand in its place, such as a comment. An empty line
keeps a place free: after the picture, the lines `0`, an empty line and `lamp_yaw` set no pitch
offset and only the yaw offset.

The twin mirrors the position and the direction, but **not the picture or the offsets**: an
asymmetric low beam is the same way round on both sides, and an offset turns both lamps the
same way. To steer two lamps apart (a left and a right cornering lamp, for example), declare
each as its own entry with the flag `1`.

## The picture

- **Size:** 1280 × 1024 pixels; other sizes are scaled to it.
- **Coverage:** 120° across (−60° on the left to +60° on the right) and 96° high (+36° above the
  lamp's axis to −60° below it), evenly spaced in both angles: 0.09375° per pixel, with the
  axis at column 640 and row 384.
- **Values:** sRGB, grey or colour, 8 or 16 bits. White is the beam's peak; a grey picture
  shines white, a coloured one in its colours.
- **Edges:** no light falls outside the picture, and its edges fade out over a few degrees, so a
  beam that runs to the edge does not end in a hard line.

A vehicle can use many pictures. neoOMSI keeps up to 32 different ones at a time; the same
file shipped in several vehicle folders counts once.

## How neoOMSI draws it

- **Enhanced lighting:** every lit surface and the light scattered in fog and rain take their
  brightness and colour from the picture.
- **Classic vehicle lights:** a cone that follows the picture's spread, aim and mean colour.
- **Until the picture is loaded,** or when it is missing, the lamp shines as a plain warm-white
  beam. A missing picture is reported in the log.
- **Shadows:** cookie lamps are headlamps; the player's lamps share one shadow map as usual.
- **AI vehicles:** a vehicle whose script lights none of its cookie lamps under AI control
  gets neoOMSI's stand-in AI beam instead, so it does not drive dark.

The picture's frame follows the lamp's direction and stays level with the ground; it does not
yet tilt when the body rolls.
