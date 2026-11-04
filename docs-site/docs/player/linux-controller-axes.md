# Linux controller axes

Linux offers an **Axis mode** for each device under **Options → Controls → Game controllers**.
Select the device after adding it. The mode and **Invert** settings are saved immediately and
kept after restarting.

## Choose an axis mode

| Mode | Behavior |
| --- | --- |
| **Auto** | Recommended. Uses native Linux axes when the device looks like a wheel, pedal set, or joystick, or when no gamepad mapping is available. Otherwise uses the mapped gamepad layout. |
| **Gamepad** | Forces the mapped gamepad layout for sticks and triggers. |
| **Native** | Reads the axes advertised by Linux directly. Use this for an unusual wheel or controller that Auto classifies incorrectly. |

Changing modes does not erase axis assignments, calibration, inversion, or steering curves. If
the new mode presents a different layout, assign the controls again. Native axes use Linux
labels such as `X`, `Y`, `Rx`, and `Ry`; assign the displayed axis to each game function.

## Force feedback

Axis mode and force feedback are separate. Choosing **Native** does not enable force feedback;
neoOMSI uses it only when the device and driver report support for it.

These axis modes apply to Linux. Windows keeps its existing controller behavior.
