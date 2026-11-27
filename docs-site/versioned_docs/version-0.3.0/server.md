# Dedicated server

The dedicated server hosts a multiplayer world without opening a game window or requiring graphics hardware. Download the server package for your operating system from the [neoOMSI download page](https://neoomsi.com/download/).

Use an OMSI 2 installation on the server that contains the maps, vehicles, and scenery you intend to use. neoOMSI reads that content; it does not distribute or modify it. Keep the server and players on the same neoOMSI release.

For playing together without a dedicated server, see [Multiplayer](player/multiplayer.md).

## Session invitations and host identity

New invitations look like `NEO-XXXX-XXXX-XXXX-XXXX-X`. They contain a fingerprint of the host's per-session public key and a typo check. Players should copy the full invitation and share it through a trusted channel.

The fingerprint lets clients verify the advertised host identity and the initial welcome, including when a connection uses a tunnel. It does not encrypt or authenticate every later gameplay datagram. Direct-address joins do not include this host identity check.

The server prints its invitation in its log when it starts.

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

### Using another configuration file

Both start scripts take an optional second argument: the path to a configuration file. Use it to run several servers from one package, each with its own file and port.

```sh
./start.sh /path/to/OMSI2 /path/to/other-server.cfg
```

```powershell
start.cmd "C:\path\to\OMSI2" "C:\path\to\other-server.cfg"
```

If the file does not exist, the server creates it with the default settings. The scripts run the server executable as `neoomsi --root <OMSI 2 folder> --server <configuration file>`; you can use the same flags if you start the executable yourself.

The folder that contains the configuration file also holds the server icon (see [Server icon](#server-icon)).

## Configuration (`server.cfg`)

`server.cfg` uses `key = value` lines. Lines starting with `#` are comments. The generated file has a comment for every setting. Restart the server after you change it.

On/off settings accept `1`, `true`, `yes`, or `on` for on; any other value means off. Numbers outside the allowed range are clamped to the nearest allowed value.

### Server list and world

| Setting | Default | Purpose |
| --- | --- | --- |
| `name` | `neoOMSI server` | Name shown to players in the server status and when they join. |
| `motd` | `Welcome! Drive safely.` | Message of the day, shown with the name. |
| `map` | `maps/Berlin-Spandau/global.cfg` | Map path relative to the OMSI 2 folder. |
| `date` | empty | Start date as `YYYY-MM-DD`. Leave empty for the default date. |
| `time` | `08:00` | Time of day at start, as `HH:MM`. |
| `weather` | empty | A weather file (`.owt`) from the OMSI 2 folder, for example `Weather/Bodennebel.owt`. Empty uses the map's default. `cycle` changes the weather through the day, as the month allows. |
| `radius` | `0` | How many map tiles around the map's first entry point stay loaded. `0` loads all tiles. |

### Traffic and passengers

| Setting | Default | Purpose |
| --- | --- | --- |
| `traffic` | `30` | Random traffic level, `0` to `200`. |
| `timetable` | `1` | Enable scheduled AI buses. |
| `passengers` | `1` | Enable waiting and onboard passengers. |
| `vehicles` | empty | Buses players may drive, as vehicle files separated by `;`, for example `Vehicles/MAN_SD200/MAN_SD77.bus`. Empty allows every bus installed on the server. |

### Clock and weather

| Setting | Default | Purpose |
| --- | --- | --- |
| `time_speed` | `1` | How fast the clock runs: `1` is real time, `2` twice as fast, up to `30`. |
| `real_time` | `0` | Follow the server machine's real date and time. `date` and `time` then apply only at the very first moment, and `time_speed` and the administrators' clock controls are ignored. |
| `metar_sync` | `0` | Follow the real weather report (METAR) of an airport. The server downloads the report every ten minutes and sends its values to the players, so they need no METAR sync of their own. `weather` then applies only at the first moment, and administrators cannot change the weather. |
| `metar_station` | empty | The airport's four-letter ICAO code, for example `EDDB`. Empty uses the airport nearest the map. |

### Network and players

| Setting | Default | Purpose |
| --- | --- | --- |
| `port` | `27015` | UDP port for game traffic; TCP on the same number for map downloads. |
| `web_port` | `27025` | TCP port for the status and WebSocket gateway. |
| `max_players` | `16` | The player limit shown in the server status, `1` to `64`. It is not enforced: a session accepts up to 32 connected players, whatever this says. |
| `tunnel` | `1` | Start a temporary Cloudflare quick tunnel for the gateway. |
| `share_positions` | `0` | Allow `GET /players` to show names, buses, lines, and positions. |
| `admin_password` | empty | Password for the in-game server administration. Empty disables administration. |

### Voice chat

| Setting | Default | Purpose |
| --- | --- | --- |
| `voice` | `1` | Allow proximity voice chat between players. |
| `voice_range` | `60` | How far a voice carries, in metres, `5` to `500`. Closed bus doors muffle it. The dispatch radio reaches everybody. |

The server passes voices on to the players; it does not record them. Voice packets are not encrypted, so anyone who can see the network traffic between players and server could listen in.

## Ports and firewall

The server needs three ports:

| Port | Protocol | Used for |
| --- | --- | --- |
| `port` (default `27015`) | UDP | The game session. |
| `port` (default `27015`) | TCP | Map files that joining players download from the host. |
| `web_port` (default `27025`) | TCP | The status page and WebSocket gateway. |

For direct connections, open these ports in the server host's firewall and forward them on the router. If only UDP `port` is open, players can connect but cannot download the map's files directly. Players who joined with an invitation code then retry through the server's tunnel, if one is running; players who joined by address cannot.

Players who join by address from the game's **Multiplayer** page are checked against the gateway first, so `web_port` must be reachable too. The game looks for the gateway at the given port, ten ports above it, and at `27025`, so keep `web_port` at `port` + 10 when you change the ports. Players who join with an invitation code or the tunnel address do not need this.

## Cloudflare quick tunnel

`tunnel = 1` starts a temporary Cloudflare quick tunnel and prints its `https://….trycloudflare.com` address in the log. The address changes every time the server starts. Players can join through it without any open ports on the server: the game traffic and the map downloads then go through the gateway. The server also publishes the address so that players who join with the invitation code can fall back to it.

The tunnel needs `cloudflared`. If it is not installed, neoOMSI downloads a fixed release from Cloudflare's GitHub releases the first time it is needed, checks its SHA-256 checksum, and keeps it in `.neoomsi/bin` in the user's home folder. Set `tunnel = 0` if you do not want to start a tunnel.

## Server icon

Place a PNG file named `server-icon.png` in the folder that contains `server.cfg`. The gateway serves it at `/icon.png`. Use a 64×64 image; the file must be smaller than 256 KB. The server reads the icon when it starts.

## Web gateway

The gateway on `web_port` answers these requests:

| Request | Answer |
| --- | --- |
| `GET /status` | A JSON object with the name, message of the day, map, player count, player limit, version, time, weather, and allowed buses. |
| `GET /players` | A JSON list of the players with name, bus, line, destination, tour, position, heading, and speed. Only when `share_positions = 1`; otherwise `404`. |
| `GET /icon.png` | The server icon, or `404` without one. |
| `/ws` | The WebSocket that players join through, for example over the tunnel. |
| `POST /admin` | Administration commands from the server machine (see below). |

Any other address shows a small status page with the server's name, message, map, and player count.

If you enable `share_positions`, tell players that the gateway can expose their names, buses, lines, and positions to anyone who can reach it.

## Administration

Set a strong `admin_password` before sharing the server. With an empty password, nobody can administer the server.

### In the game

A player types `/admin <password>` in the chat. On success, the **Administration** entry appears in that player's game menu (`Esc`). The password is not sent over the network; the game answers a one-time challenge instead. After five wrong passwords within two minutes, the server refuses new attempts for a while. Administrator rights end when the player leaves.

From **Administration**, an administrator can:

- **Go to** a player, **Bring** a player here, or **Bring everyone here**.
- **Repair** a player's vehicle or set it upright, and **Repair**, **Refuel**, or **Wash all vehicles**.
- **Kick** a player, or **Ban** a player for the rest of the session.
- Mute or unmute a player's microphone, and turn **Voice chat** on or off for everybody.
- Set the clock to morning, noon, evening, or night, move it an hour later or earlier, and change the **Time speed** (1×, 2×, 4×, 8×, 15×, or 30×). Not available with `real_time = 1`.
- Switch to the **Next weather**. Not available with `metar_sync = 1`.

### From the server machine (`POST /admin`)

Tools running on the same machine as the server, such as a script or a dispatch web page, can send administration commands without joining. Send a `POST` request to `/admin` on `web_port` with the admin password in the `X-Admin-Password` header and one command per line in the body (up to ten lines):

```sh
curl -X POST http://127.0.0.1:27025/admin \
  -H "X-Admin-Password: your-password" \
  --data-binary 'say Server restart in 10 minutes'
```

Commands include `say <text>`, `kick <id>`, `ban <id>`, `clock <seconds of the day>`, `speed <factor>`, and `weather next`. With `share_positions = 1`, `GET /players` lists the player ids.

This door only accepts connections from the server machine itself. Requests that arrive through the quick tunnel are refused, even with the right password. Requests through other proxies are only recognised by their forwarding headers (`X-Forwarded-For`, `Forwarded`, `X-Real-IP`), so a proxy that does not add them looks like a local request. If you run a reverse proxy on the same machine, do not forward `/admin` through it. Five wrong passwords within two minutes close the door for a while.

## Building the server package

The provided packages already include the server executable and startup scripts. Engine contributors can build a Linux package with `scripts/build-server.sh`; the source repository is not required to run a downloaded server package.
