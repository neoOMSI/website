# Dedicated server guide

neoOMSI includes a lightweight dedicated server for hosting multiplayer sessions. The server runs headlessly on Linux or Windows without requiring a graphics card or audio hardware.

## How multiplayer works

neoOMSI multiplayer allows you and your friends to drive together on the same map with synchronized bus positions, door states, indicators, and scheduled timetable services.

### Room codes

When a server starts up, it generates an invitation room code formatted like:

```text
NEO-XXXX-XXXX-XXXX-XXXX-X
```

To join:
1. Share this code with your friends.
2. In the neoOMSI start menu, open **Multiplayer** and select **Join Session**.
3. Paste the room code into the box and click **Connect**.

The room code automatically handles network discovery, allowing players to join without needing complicated manual network configuration.

### Direct IP connection

If you are playing on a local area network (LAN) or have forwarded your ports, players can also connect directly by entering your server's IP address and port (default: `27015`).

## Starting the server

Dedicated server packages are available on the [Download](/download/) page for Windows and Linux.

1. Extract the downloaded server package into a folder.
2. Ensure the server has access to your OMSI 2 files.
3. Start the server:
   - **Windows:** Run `start.cmd`
   - **Linux:** Run `./start.sh`

On first launch, if no configuration file exists, the server creates a default `server.cfg` file and generates your first session room code.

## Server configuration (`server.cfg`)

You can customize your server settings in `server.cfg`:

| Setting | Description | Default |
| --- | --- | --- |
| `name` | The name of your server shown to players | `neoOMSI server` |
| `motd` | Message of the day displayed in the chat when players connect | `Welcome! Drive safely.` |
| `map` | Path to the map file relative to your OMSI 2 directory | `maps/Berlin-Spandau/global.cfg` |
| `port` | UDP network port used for game traffic | `27015` |
| `max_players` | Maximum number of concurrent players | `16` |
| `traffic` | Density of background AI traffic (0 to 100) | `30` |
| `timetable` | Enable scheduled AI timetable runs (1 for enabled, 0 for disabled) | `1` |

Save the file and restart your server to apply any changes.
