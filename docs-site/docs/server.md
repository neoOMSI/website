# Dedicated server

The dedicated server hosts a multiplayer world without opening a game window or requiring graphics hardware. Download the server package for your operating system from the [neoOMSI download page](https://neoomsi.com/download/).

Use an OMSI 2 installation on the server that contains the maps, vehicles, and scenery you intend to use. neoOMSI reads that content; it does not distribute or modify it. Keep the server and players on the same neoOMSI release.

## Session invitations and host identity

New invitations look like `NEO-XXXX-XXXX-XXXX-XXXX-X`. They contain a fingerprint of the host's per-session public key and a typo check. Players should copy the full invitation and share it through a trusted channel.

The fingerprint lets clients verify the advertised host identity and the initial welcome, including when a connection uses a tunnel. It does not encrypt or authenticate every later gameplay datagram. Direct-address joins do not include this host identity check.

## Running the server

Extract the server package, then start it with the path to the server's OMSI 2 installation:

```sh
# Linux and macOS
./start.sh /path/to/OMSI2
```

```powershell
# Windows
start.cmd "C:\path\to\OMSI2"
```

The first run creates `server.cfg` beside the server executable. The server writes its log to `server.log` on Linux and macOS; on Windows, output stays in the console window. The package includes a short `README.md` with these offline startup instructions.

## Configuration (`server.cfg`)

`server.cfg` uses `key = value` lines. It is created with comments describing every setting. Common options include:

| Setting | Default | Purpose |
| --- | --- | --- |
| `map` | `maps/Berlin-Spandau/global.cfg` | Map path relative to the OMSI 2 folder. |
| `port` | `27015` | UDP port for game traffic. |
| `web_port` | `27025` | TCP port for the status and WebSocket gateway. |
| `max_players` | `16` | Player limit. |
| `traffic` | `30` | Random traffic level. |
| `timetable` | `1` | Enable scheduled AI buses. |
| `passengers` | `1` | Enable waiting and onboard passengers. |
| `tunnel` | `1` | Start a temporary Cloudflare quick tunnel for the gateway. |
| `share_positions` | `0` | Allow `GET /players` to show names, buses, lines, and positions. |
| `admin_password` | empty | Password for the in-game server administration menu. |

The game session uses UDP `port`; the gateway uses TCP `web_port`. For direct connections, configure the server host's firewall and router for the ports your players need. The quick tunnel can help when a gateway connection cannot reach the host directly; it does not replace the UDP game connection.

`tunnel = 1` starts a temporary tunnel and prints its changing address. Set it to `0` if you do not want to start one. If you enable `share_positions`, tell players that the gateway can expose their names, buses, lines, and positions to anyone who can reach it. Set a strong `admin_password` before sharing the server.

## Building the server package

The provided packages already include the server executable and startup scripts. Engine contributors can build a Linux package with `scripts/build-server.sh`; the source repository is not required to run a downloaded server package.
