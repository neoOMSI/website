# Controls

This page lists the default keys, explains how to change them, and covers the mouse, game
controllers, head tracking, VR and triple screens. Other options are on
[Options and features](options.md).

## Where the keys come from

neoOMSI uses OMSI 2's key layout. It reads `Inputs/keyboard.cfg` from your OMSI 2
installation and adds its own keys on top, so keys you changed in OMSI 2 carry over. Once
you change a key in neoOMSI, it keeps its own copy (see [Change a key](#change-a-key)) and
later changes in OMSI 2 are no longer picked up.

Keys are matched by their position on the keyboard, not by the letter printed on it. The
tables below and the **Key bindings** list use the names of a US QWERTY keyboard. On a German
keyboard, for example, the key named `Z` is the one labelled Y.

"Hold" means the key works only while you keep it pressed.

## Driving

| Action | Key |
| --- | --- |
| **Throttle** | `Numpad 8` (hold) |
| **Brake** | `Numpad 2` (hold) |
| **Throttle boost** | `Numpad +` (hold) |
| **Steer left** / **Steer right** | `Numpad 4` / `Numpad 6` (hold) |
| **Center steering** | `Numpad 5` (hold) |
| **Clutch** | `Tab` (hold) |
| **Parking brake** | `.` |
| **Horn** | `H` (hold) |
| **Start engine** | `M` |
| **Battery disconnect switch** | `E` |
| **Station brake (without door release)** | `Scroll Lock` |
| Start up the bus, or switch it off (`bus_startup`) | `Shift + U` |

`Shift + U` runs the whole start-up sequence of the bus for you. Pressed with the bus
running, it switches the bus off.

### Gears

| Action | Key |
| --- | --- |
| **Automatic: drive** | `D` |
| **Automatic: neutral** / **Automatic: reverse** | `N` / `R` |
| **Automatic: 1** / **Automatic: 2** | `1` / `2` |
| **Gear: 1** to **Gear: 6** | `1` to `6` |
| **Gear: neutral** / **Gear: reverse** | `N` / `R` |
| **Gear up** / **Gear down** | `[` / `/` |
| One gear up / down on a manual gearbox (`gear_up`, `gear_down`) | `Ctrl + Up` / `Ctrl + Down` |

## Lights, indicators and wipers

| Action | Key |
| --- | --- |
| **Indicator left** / **Indicator right** | `Numpad 7` / `Numpad 9` (hold) |
| **Indicators off** | `Numpad .` |
| **Hazard lights** | `B` |
| **Headlights** | `L` |
| **Parking lights** | `Shift + L` |
| **High beam** | `F` |
| **Rear fog light** | `Ctrl + F` |
| **Driver's light** | `6` |
| **Lower right light** | `7` |
| **Upper deck light** / **Lower deck light** | `8` / `9` |
| **Wipers: next mode** | `W` |
| **Wiper interval mode** | `Shift + W` |
| **Windscreen washer** | `Ctrl + W` |

The list also has indicator toggles (`blinker_left_toggle`, `blinker_right_toggle`). They have
no key by default: give them one if you want a single key that switches an indicator on and
off.

### Let traffic go first

Flash your headlights to let AI traffic go first: switch the lights so they change three
times, with no more than one second between changes. Switching the high beam on over the
low beam does not count. For up to 10 seconds, or until your bus speeds up, junctions ahead
do not count your bus, and a car waiting behind an obstacle pulls out if your oncoming bus
can stop in time.

## Doors

| Action | Key |
| --- | --- |
| **Front door 1** | `Numpad /` |
| **Front door 2** | `Numpad *` |
| **Door release** | `Numpad -` |
| **Front door 6** | `Numpad +` |
| Doors, from front to back (`doorkey_1` to `doorkey_9`) | `Shift + 1` to `Shift + 9` |
| The bus's own door release (`doors_release`) | not set |
| **Pushchair switch** | `F12` |
| **Microphone** | `Q` (hold) |

`Shift` + a number works the doors of the bus in order from the front, whatever the bus's
script calls them. If you gave `Shift` + that number to another action, your binding wins.

## Destination display and IBIS

| Action | Key |
| --- | --- |
| **Next line** / **Previous line** | `F8` / `F5` |
| **Next destination** / **Previous destination** | `F7` / `F6` |
| **Destination scroll: line 1**, **line 2**, **line 3**, **tour** | `F5`, `F6`, `F7`, `F8` |
| **Destination scroll up** / **down** | `Page Up` / `Page Down` (hold) |
| **Destination scroll up (step)** / **down (step)** | `Page Up` / `Page Down` (tap) |
| **IBIS: 0** to **IBIS: 9** | `Ctrl + Numpad 0` to `Ctrl + Numpad 9` |
| **IBIS: Enter** | `Ctrl + Numpad Enter` |
| **IBIS: Clear** | `Ctrl + Numpad .` |
| **IBIS: line / tour mode** | `Ctrl + Numpad *` |
| **IBIS: route mode** | `Ctrl + Numpad /` |
| **IBIS: destination mode** | `Ctrl + Numpad -` |

## Tickets and the cash desk

| Action | Key |
| --- | --- |
| **Issue ticket** | `T` |
| **Give change** | `Ctrl + T` |
| **Collect payment or take back change** | `Shift + T` |

`Shift + T` takes the money a passenger put on the cash tray. With no payment waiting, it takes
back the change you laid out. It also clears single tickets lying on the desk.

Coins for the change, by amount:

| Amount | Key | Amount | Key |
| --- | --- | --- | --- |
| 5.00 | `Ctrl + 5` | 15.00 | `Shift + Ctrl + 5` |
| 2.00 | `Ctrl + 6` | 8.00 | `Shift + Ctrl + 6` |
| 1.00 | `Ctrl + 7` | 4.00 | `Shift + Ctrl + 7` |
| 0.50 | `Ctrl + 8` | 1.50 | `Shift + Ctrl + 8` |
| 0.10 | `Ctrl + 9` | 0.30 | `Shift + Ctrl + 9` |
| 0.05 | `Ctrl + 0` | 0.15 | `Shift + Ctrl + 0` |

## Views and camera

| Action | Key |
| --- | --- |
| **View: driver** | `F1` |
| **View: passenger** | `F2` |
| **View: outside** | `F3` |
| **View: map** (free camera above the bus) | `F4` |
| **View: on foot** (a simple walking camera; to leave the bus, see [On foot](#on-foot)) | `F11` |
| **Switch viewpoint** (driver, passenger, outside, map) | `S` |
| **Interior camera: previous** / **next** | `Left` / `Right` |
| **Reset view direction** | `C` |
| **Reset all view directions** | `Space` |
| **View: timetable** | `Insert` |
| **View: ticket sales** | `Home` |
| **Outside camera: zoom in** / **zoom out** (zoom in the cockpit, closer or further in the outside view) | `=` / `-` (hold) |
| Look around in the bus | `Alt + J`, `Alt + L`, `Alt + I`, `Alt + K` |
| Adjust the mirror you look at (driver view) | `Ctrl + Alt + arrow keys` |

A mirror adjusted with `Ctrl + Alt + arrow keys` keeps its position for that vehicle. It is
saved under `[mirrors]` in [`settings.toml`](user-guide.md#settings-file). **Seat and mirrors**
in the in-game menu sets the seat, the mirrors and the field of view with a live preview.

In the free camera (`F4`): `W` `A` `S` `D` move, `Q` goes down, `E` or `Space` goes up, left `Shift`
moves five times faster and the arrow keys turn the camera.

## Game and menus

| Action | Key |
| --- | --- |
| **Open main menu** (in-game menu) | `Esc` |
| Quick Access menu | tap `Alt` |
| **Pause simulation** | `P` |
| **Quick save** | `Ctrl + S` |
| **Screenshot** | `Shift + Ctrl + P` or `F12` |
| **Switch information display** | `Shift + Y` |
| **Show/hide navigator** | `Shift + N` |
| Map page (`toggle_city_map`) | `Shift + M` |
| **Switch mouse control** (mouse steering) | `O` |
| **Switch controller** (game controllers on/off) | `K` |
| Fullscreen on/off (`toggle_fullscreen`) | `Alt + Enter` |
| Next radio station (`radio_next`) | `Shift + R` |
| Driver record summary (`save_personnel`) | `F9` |
| Object editor (`toggle_editor`) | `Shift + Ctrl + E` |
| **Exit game** | `Ctrl + Q` |

A LAN session cannot be paused. Screenshots are saved as PNG files in the `Screenshots`
folder of the content folder. `F12` is also OMSI's **Pushchair switch**: on a bus that has
one, both happen. Move one of them in the **Key bindings** list if that bothers you.

There is no key for photography mode: open it from the in-game menu (`Esc`) with
**Photography mode**. See [Photography mode](options.md#photography-mode).

### Multiplayer

| Action | Key |
| --- | --- |
| Show or hide the chat (`chat_toggle`) | `V` |
| Write in the chat (`chat_open`) | the key left of `1` (`` ` ``) |
| **Multiplayer: talk (hold)** | `Caps Lock` |
| **Multiplayer: talk over the radio (hold)** | `Shift + Caps Lock` |

The chat line opens on `/` if your `keyboard.cfg` leaves that key free. OMSI's own layout
uses `/` for **Gear down**, so the chat takes the key left of `1` instead. Push-to-talk
applies when voice chat is set to **Push-to-talk (hold the key)**.

## Quick Access (Alt menu)

Tap `Alt` on its own (press and release it without another key) to open or close Quick
Access. It is a grid of buttons; a button is greyed out when it does not apply.

| Button | What it does |
| --- | --- |
| **Spawn new bus** | Place another vehicle in the world. |
| **Change bus** | Lists the parked and AI buses within 250 m. Pick one to drive it. |
| **Let AI drive this bus** | Hands your bus to the AI, which continues your trip (or drives to the depot). Choose **Take a seat** to ride along as a passenger, or **Leave the bus**. |
| **Change bus livery** | Changes the repaint of your bus on the spot. **Original textures** goes back to the default look. |
| **Clean and service bus** | Opens **Wash bus**, **Refuel bus** and **Repair bus**. |
| **Change line, route or service** | Choose a line and tour to drive. |
| **Cancel current trip, line or service** | Ends your current tour; you keep driving freely. |
| **Set bus display** | Choose the destination shown on the bus. |
| **Open navigator map** | Opens the full navigator map. |
| **Route arrows** | Shows OMSI 2's route arrows on the road. |
| **Move bus to entry point** | Moves your bus to one of the map's start points. |
| **Change time** | Set the time (`HH:MM:SS`) and date (`YYYY-MM-DD`). |
| **Change weather** | Pick a weather preset, switch live weather on or off, change the METAR station or refresh it. |
| **Toggle torch** | Switches the torch on or off. See [Torch](options.md#torch). |
| **Delete current bus** | Removes the bus you are driving. |

Clearing traffic is in the in-game menu: **Clear traffic...** offers **Clear general traffic**
(removes road traffic, keeps timetable buses) and **Clear and respawn AI Buses** (rebuilds the
timetable buses for the current time). Your bus and occupied buses are kept. To take over a bus
anywhere on the map, use the map's right-click menu (see
[Map and navigator](options.md#map-and-navigator)).

## On foot

Get out with **Get out of the vehicle** on the in-game menu's **Vehicle** page, or with
`Shift + Ctrl + G` from the driver's seat.

| Action | Key |
| --- | --- |
| Walk | `W` `A` `S` `D` |
| Run | hold `Shift` |
| Jump | `Space` |
| Sit down, stand up, or take the driver's seat when you stand next to it | `G` |
| Look around | mouse, or the arrow keys |
| First-person view / free camera | `F1` / `F4` |
| Map page | `Shift + M` |

**Back to my bus** in the in-game menu returns you to your bus.

## Change a key

1. Open **Options**, then **Controls → Key bindings**. **Options** is a tab of the start menu
   and of the in-game menu (`Esc`).
2. Select an action and press the new key, with `Shift`, `Ctrl` or `Alt` if you want a
   combination. You can also press a button on a game controller to bind it.
3. `Esc` leaves the binding as it was. To remove a binding, including its controller
   buttons, select its row and press `Delete`.

The list has these groups: **Scripted (this vehicle)** (other functions of the bus you are
driving that have no key yet), **Driving and the bus**, **The game** and **Headset (VR)**. Type
in **Find a key binding** to search by name or key. When a key is used twice, the row shows
**This key is already used by:** and the other actions.

neoOMSI saves your keys to `Inputs/keyboard.cfg` in its content folder (see
[Modding](user-guide.md#modding) for where that is). If that folder cannot be written, they go
to `~/.neoomsi/Inputs/keyboard.cfg` in your home folder. OMSI 2's own file is never changed.
Changes apply at once.

## Mouse and cockpit

- **Click** a switch or button in the cockpit to work it. Click and drag to turn a dial or a
  lever. The mouse wheel over a control turns it too.
- **Look around:** hold the right mouse button and move the mouse. With **Right mouse button
  rotates the view** off (**Options → Camera**), the right button zooms and the middle button
  turns the view, as in OMSI. With it on (the default), `Shift` + right button zooms.
- **Mouse wheel:** in the cockpit it zooms. In the outside view it moves the camera closer or
  further away; `Ctrl` + wheel narrows the field of view instead.
- **Mouse steering:** press `O`. Move the mouse sideways to steer, up to accelerate and down to
  brake. **Right click stops mouse steering** (**Options → Controls**, off by default) makes a
  right click end mouse steering, as in OMSI.
- **Free look** (**Options → Camera → Free look**): the mouse turns the view and the centre of
  the screen works the controls. Tap `Alt` to show the cursor and Quick Access.

| Option (Options → Controls) | `[controls]` key | Default |
| --- | --- | --- |
| **Steering with the mouse** | `mouse_steering` | off |
| **Right click stops mouse steering** | `mouse_right_off` | off |
| **Mouse steering sensitivity** | `mouse_sens` | `1.0` (100 %) |

## Controllers

Wheels, pedals, gamepads, joysticks and button boxes work on Windows, Linux and macOS. Set
them up under **Options → Controls → Controllers**:

1. Select the device and choose **Set up**. **Use this controller** switches a device off
   without losing its setup.
2. Under **Axes**, give each axis a function: **Steering**, **Throttle**, **Brake**,
   **Clutch**, **Throttle/Brake**, **Look left / right** or **Look up / down**. **Invert**
   reverses an axis.
3. Each axis has a **Dead zone** and a curve: **Linear**, **Degressive**, **Progressive**,
   **Bi-degressive** or **Bi-progressive**.
4. Under **Buttons**, give each button an action. Press a button on the device to find it in
   the list (**Search buttons** searches by name).

**Import from OMSI 2** takes the controllers from OMSI 2's `Inputs/gamectrler.cfg`.
**Import from openOMSI** takes gamepads, wheels and key bindings from openOMSI; what you
already set up stays.

On Linux, each device also has an **Axis mode**. See the
[Linux controller axis guide](linux-controller-axes.md).

`K` switches all game controllers off and on while driving.

### Steering wheels and pedals

| Option (Options → Controls) | What it does | `[controls]` key | Default |
| --- | --- | --- | --- |
| **Steering wheel range** | Your wheel's total rotation, lock to lock | `wheel_range` | `900` (degrees) |
| **Steering wheel angle at full lock** | How far your wheel turns when the bus's wheels reach full lock. Below 45° the slider shows *OMSI*, the OMSI behaviour | `wheel_lock` | `0` |
| **1:1 steering wheel sync** | The cockpit's steering wheel turns exactly with yours instead of using the model's animation | `wheel_sync` | off |
| **Throttle pedal strength** / **Brake pedal strength** | How strongly the pedals act | `pedal_throttle` / `pedal_brake` | `1.0` |
| **Gamepad steering sensitivity** | How far a small stick movement steers; full stick is still full lock | `stick_sens` | `1.0` |
| **Gamepad stick dead zone** | Small stick movements count as straight ahead | `steer_center` | on |

Settings for each device (axes, buttons, dead zone, force feedback) are saved under
`[controller.<device name>]` in [`settings.toml`](user-guide.md#settings-file). The starting dead
zone is `deadzone = 0.05` (5 %) under `[controller]`.

### Force feedback

Steering wheels get force feedback on Windows and Linux. Gamepads that support it vibrate.

| Option | What it does | `[controller]` key | Default |
| --- | --- | --- | --- |
| **Force feedback and vibration** | Force feedback for wheels, vibration for gamepads | `ff_enabled` | on |
| **Invert force feedback by default** | For wheels that have no saved direction | `ff_invert` | off |
| **Wheel's own steering effects** | Centring, friction and damping run in the wheel itself. Turn off if the wheel feels notchy or does not centre (some Fanatec wheels) | `ff_wheel_effects` | on |

Each device page also has **Steering force**, **Vibration** and **Invert force feedback**.
Road and kerb feedback are set under **Options → Gameplay → Driving** (see
[Driving](options.md#driving)).

## Head tracking

neoOMSI reads opentrack's **UDP over network** output. opentrack works with TrackIR, Tobii,
webcams and phones, and can run on another computer. On Windows, neoOMSI also reads TrackIR's
own software and opentrack's freetrack output directly.

| Option (Options → Camera → Head tracking) | `[camera]` key | Default |
| --- | --- | --- |
| **Head tracking** | `head_tracking` | off |
| **Head tracking port** (4242, 4243, 5005 or 5555) | `head_tracking_port` | `4242` |
| **Invert head tracking** (yaw, pitch, roll, or a combination) | `head_tracking_invert` | none |

In opentrack, choose the output **UDP over network** and send it to the computer running
neoOMSI on the same port.

## VR

VR is available on Windows. It needs an OpenXR runtime that supports Direct3D 12, the
**DirectX 12** graphics API, and the headset on the same graphics card as the game.

Turn on **Use OpenXR headset** under **Options → Graphics → VR**; it applies from the next
start. These settings are stored under `[vr]`:

| Option | Key | Default |
| --- | --- | --- |
| **Use OpenXR headset** | `enabled` | off |
| **Resolution per eye** (50–100 %) | `scale` | `0.65` |
| **Head tracking smoothing** (off to 30 ms) | `head-smoothing-ms` | `0` (off) |
| **Bus mirror refresh** (off, per second, or every frame) | `mirror-rate` | `16` |
| **Show headset picture on monitor** | `desktop-mirror` | on |

With a bus, the VR group also places the navigator display: position, size, rotation,
**Navigator opacity**, **Move and rotate with the mouse...** and **Reset navigator position**.
These are saved for each bus.

VR keys (group **Headset (VR)** in the key list):

| Action | Key |
| --- | --- |
| Recenter the view | `Shift + Ctrl + R` |
| Show or hide the headset picture on the monitor | `F7` |
| Switch between VR and desktop mode | `F8` |
| Show or hide the navigator display | `Shift + Ctrl + N` |
| Place the navigator display with the mouse | `Shift + Ctrl + M` |

While placing the navigator display, `Enter` or `Esc` finishes and `R` resets it. With VR
turned on, `F7` and `F8` act as VR keys instead of **Next destination** and **Next line**;
move one of them if you need both.

## Triple screens

**Triple-screen projection** under **Options → Graphics → Display** sets up the view for three
monitors around your seat. Measure your setup and enter the values; they are stored under
`[graphics]`.

| Option | Key | Default |
| --- | --- | --- |
| **Triple-screen projection** | `triple_screen` | off |
| **Span three monitors at startup** (borderless window across three aligned monitors) | `triple_screen_span` | on |
| **HUD on centre screen** | `triple_screen_hud` | on |
| **Visible width of one screen** | `triple_screen_width_mm` | `690` mm |
| **Viewing distance** (eyes to the middle monitor) | `triple_screen_distance_mm` | `400` mm |
| **Bezel gap or overlap** (negative values overlap) | `triple_screen_bezel_mm` | `14` mm |
| **Left screen inward angle** / **Right screen inward angle** | `triple_screen_left_angle` / `triple_screen_right_angle` | `30`° |
| **Eye height relative to screen centre** | `triple_screen_eye_height_mm` | `0` mm |

With triple screens on, `Alt + Enter` returns to a window. DLSS and FSR do not apply to
triple-screen views (see [Upscaling](user-guide.md#upscaling-dlss-and-fsr)).
