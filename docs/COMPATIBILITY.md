# OMSI 2 compatibility guide

neoOMSI is built to run your existing OMSI 2 library directly: original maps, buses, timetable duties, weather profiles, and community add-ons.

The simulator reproduces original OMSI 2.2.032 behavior while replacing the legacy 32-bit executable with a modern 64-bit engine that eliminates memory crashes.

## What is working today

Most standard OMSI 2 content runs without conversion or modification:

### Vehicles and physics
- **Drivetrain simulation:** Automatic and manual gearboxes, torque converters, engine curves, retarders, and pneumatic air brakes.
- **Controls & cockpits:** Dashboard switches, instrument needles, indicator lights, windshield wipers, and interior illumination.
- **Buses:** Standard MAN SD200, SD202, NL/NG series, Citaro families, and custom community buses using standard OMSI script macros.
- **Hardware controllers:** Steering wheels (Logitech G29/G920, Thrustmaster, Fanatec), pedal sets, H-shifters, force feedback, and gamepads.

### Maps and traffic
- **World & terrain:** Map tiles, road splines, elevated structures, bridges, water surfaces, and scenery objects.
- **AI vehicles & pedestrians:** Road traffic following lane rules and priorities, traffic light phases, passenger pathfinding, boarding, and seating.
- **Timetables & scheduling:** Full timetable tours, scheduled departures, delay tracking, and the in-game route navigator HUD.
- **Destination displays:** Matrix and rollband destination signs powered by `.hof` files and IBIS route codes.

### Audio and visuals
- **Audio engine:** Plays vehicle sounds and ambient audio defined in `sound.cfg` files, with optional 3D spatial audio and cabin sound isolation via Steam Audio.
- **Dynamic environment:** Real-time day/night cycles, dynamic rain, seasonal textures, and live airport METAR weather synchronization.
- **Modern rendering:** Native 64-bit DirectX 12, Vulkan, and Metal rendering with AMD FSR and NVIDIA DLSS upscaling to boost frame rates.
- **Virtual Reality:** PCVR headset support on Windows through OpenXR with 3D cockpit viewing and spatial menus.

## Add-ons and community mods

neoOMSI includes a safe, dedicated mod system that keeps your original OMSI 2 files completely clean:

- **Folder mods & archives:** You can drop uncompressed add-on folders or `.zip` archives directly into neoOMSI's `Mods` directory.
- **Virtual overlay:** Mod files are loaded on top of your game without overwriting or moving files in your Steam OMSI 2 installation.
- **Activating and reordering:** Use the in-game **Mods** menu in the launcher to enable, disable, or change the priority of installed add-ons.

## Current limitations and active work

Because neoOMSI is in active development, a few specialized systems are still being refined:

- **Proprietary DRM plugins:** Some commercial Steam add-ons use closed-source, Windows-only DRM wrappers that cannot yet be executed outside of 32-bit Windows.
- **External web services:** Certain modern ticket printers that attempt to connect to external internet servers or local web browsers are currently disabled or run in offline mode.
- **Complex multi-articulated joints:** Double-articulated buses (such as bi-articulated vehicles) are undergoing physics calibration.

## Testing your favorite content

To test a custom map or bus:

1. Launch neoOMSI and verify that your OMSI 2 folder is selected.
2. In the start menu, choose your map from the map selector.
3. Choose your vehicle, select a timetable tour, and click **Drive**.
4. If you spot an issue (such as an incorrect script behavior or missing sound), report it on our [GitHub issue tracker](https://github.com/neoOMSI/neoOMSI/issues) or share the details in our [Discord](https://discord.gg/neoomsi).
