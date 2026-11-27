# Multiplayer

neoOMSI lets several players drive on the same map together. One game hosts the session; the others join it. Every player needs their own OMSI 2 installation and the same neoOMSI release as the host.

## Ways to play together

| Way | Who hosts | Good for |
| --- | --- | --- |
| Host from the game | A player's own game, while that player drives. | Driving with friends. The session ends when the host leaves. |
| Dedicated server | A separate server program without a game window. | A world that stays online. See [Dedicated server](../server.md). |

Before hosting or joining, the game shows a short notice about sharing map content. The host is responsible for having permission to share the map and its contents with other players.

## The Multiplayer page

Open **Multiplayer** in the start menu. It has:

- **SESSION CODE OR SERVER ADDRESS**: where you want to join (see [Joining a session](#joining-a-session)).
- **Player name**: the name other players see. When it is blank, your driver profile's name is used.
- **Host my next drive**: host a session with your next drive.
- **Keep downloaded assets**: keep the host's map files for later joins (see [What is downloaded](#what-is-downloaded-when-you-join)).
- **Clear MP cache**: delete the kept files.
- **Join**: join the session or server in the field.

## Hosting from the game

1. Open **Multiplayer** and turn on **Host my next drive**.
2. Choose a map, vehicle, and the other options as usual, then start driving.
3. Press `Esc` and select **Copy server code**. This copies your invitation code (`NEO-…`) to the clipboard.
4. Send the code to your friends through a trusted channel.

Your friends drive in your world: you set the map, the clock, and the weather. Your game also offers the map's files to joining players.

As the host, you can manage the session from **Administration** in the game menu (`Esc`): send players away, bring them to you, repair their vehicles, mute their microphones, and change the clock, the time speed, the weather, and the traffic. The [server administration](../server.md#administration) section describes the same menu in more detail.

### Ports for hosting

The game hosts on UDP port `27015`. If that port is taken, for example by another session on the same computer, it tries the next ports up to `27024`. It also uses TCP on the same port number for map downloads, and a TCP port ten numbers higher (normally `27025`) for its web gateway.

You usually do not need to open ports yourself:

- The game asks your router to forward the game port for UDP and TCP (UPnP), if the router allows it.
- With an invitation code, both games try to reach each other through their routers.
- The game also starts a temporary Cloudflare quick tunnel, so players can still join when a direct connection fails. If `cloudflared` is not installed, the game downloads it the first time you host. See [Cloudflare quick tunnel](../server.md#cloudflare-quick-tunnel).

## Joining a session

Type or paste one of these into **SESSION CODE OR SERVER ADDRESS**, then select **Join**:

| Entry | Example | Joins |
| --- | --- | --- |
| Invitation code | `NEO-XXXX-XXXX-XXXX-XXXX-X` | The session that made the code, at home or over the internet. |
| Address | `192.168.1.20` or `192.168.1.20:27015` | A host or server at that address. Without a port, `27015` is used. |
| Computer name | `myserver.example.com:27015` | A host or server by its name. |
| Web address | `https://example.trycloudflare.com` | A host or server through its gateway or tunnel. |
| `neoomsi` | `neoomsi` | The official neoOMSI server, when it is online. |
| Nothing | | The first session found on your local network. |

After you connect, the game downloads the host's map files if needed and opens the start menu on the host's map. Choose a starting point and your vehicle, then select **Drive**.

### Invitation codes

An invitation code contains a fingerprint of the host's identity for this session and a typo check. Most typos are caught by the check before the game tries to connect. Your game finds the host's addresses through a public relay on the internet, so both games need an internet connection, even on the same network. Only addresses go through the relay, never the game itself. Codes from older releases are not accepted; ask the host for a new `NEO` code.

The fingerprint lets your game check that the host's first answer comes from the right host, also through a tunnel. Later game traffic is not signed or encrypted. Joining by address does not include this check. See [Session invitations and host identity](../server.md#session-invitations-and-host-identity) for details.

### Joining by address

When you join a server by address from the **Multiplayer** page, the game first asks the server's web gateway for its status. The server's web port (normally `27025`) must be reachable for this. **Server online** or **Server not reachable** shows the result under the field.

### Searching the local network

Leave the field empty and select **Join** to search your local network. The game asks every computer on your networks for a session on UDP port `27015` and joins the first host that answers within a few seconds. A host that had to move to another port is only found this way on the same computer; use the invitation code instead.

## Command line

You can also host or join when you start neoOMSI from a command line:

| Flag | Purpose |
| --- | --- |
| `--lan-host <port>` | Host a session on this UDP port. `0` uses `27015`, or the next free port. |
| `--lan-join <target>` | Join a session. `<target>` is anything the join field accepts; `auto` searches the local network. |
| `--lan-name <name>` | Your name as the other players see it. Without it, your driver profile's name is used. |

```sh
neoomsi --lan-join NEO-XXXX-XXXX-XXXX-XXXX-X --lan-name "Anna"
```

## What is downloaded when you join

When you join, your game compares the host's map files with yours and downloads only what is missing or different. This includes the map and the scenery objects, splines, textures, sounds, and configuration it uses. Players also exchange their bus's depot file (HOF) and repaint, so others see your bus as you see it.

Some things are never downloaded:

- **Vehicles.** Every player drives their own bus. If you do not have another player's bus installed, you see a generic stand-in instead. The game warns you and names the missing bus.
- **Programs and plugins.** Executables, libraries, operating-system scripts, and OMSI plugins are refused by their file type, and files that look like a program inside are refused whatever their names. OMSI's own scripts (`.osc`) of maps and scenery objects are downloaded. Plugins are never loaded from downloaded files.

Downloaded files are stored encrypted for the session only and removed when the session ends. A join stops if it would leave less than 3 GB free on your disk. On Windows, **Keep downloaded assets** keeps the files in an encrypted cache, so later joins are faster. **Clear MP cache** deletes that cache; it does not touch your installed content or saves.

Select **Missing assets** in the game menu (`Esc`) to see which content of the session is missing on your computer.

### What you need to install yourself

- An OMSI 2 installation and the same neoOMSI release as the host.
- The bus you want to drive, and the buses of other players you want to see as they are.
- The vehicles of the host's traffic, if you want to see them.
- Weather files the host switches to during the session. The start weather is downloaded.

## In a session

- The host sets the clock and the weather. Your own time and weather settings do not apply.
- Traffic and timetable buses follow the host's game. Only the host can take over an AI bus from the map; for other players, **Take over bus** is unavailable.
- The trip evaluation does not pause the session.

## Chat

Press `/` to type a chat message, then `Enter` to send it or `Esc` to cancel. If a bus already uses `/`, the game picks another free key. Press `V` to show or hide the chat. You can change both keys in the key bindings.

Type `/warnings` to hide or show the multiplayer warnings in the chat, such as missing buses. Turn the chat off completely under **Options → Interface → Chat in online games**.

## Voice chat

neoOMSI has proximity voice chat: you hear players who are near you. Closed bus doors muffle voices. Speaking over the radio reaches everybody in the session.

| Action | Default key |
| --- | --- |
| **Multiplayer: talk (hold)** | `Caps Lock` |
| **Multiplayer: talk over the radio (hold)** | `Shift + Caps Lock` |

Change these under **Options → Key bindings**. The voice settings are under **Options → Sound → Voice chat**:

| Setting | Default | Purpose |
| --- | --- | --- |
| **Voice chat** | on | Talk to the players near you. |
| **Talk** | **Push-to-talk (hold the key)** | Or **Voice activation**: send whenever you speak. |
| **Microphone** | **System default** | The microphone to use. While you speak, a bar shows how loud you are. |
| **Microphone volume** | 100% | How loud others hear you. |
| **Voice activation** | 50% | Higher values let quieter speech open the microphone. |
| **Noise suppression** | on | Filters engine, wind, and keyboard noise out of your microphone. |
| **Other players** | 100% | How loud other players' voices are. |
| **Player** | 100% | The volume of each player in the session; `0` mutes that player. |

In `settings.toml`, these are stored under `[voice]`. The host or server decides whether voice chat is allowed and how far voices carry (60 m by default). Administrators can mute players.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| "both players need the same version" | Host and players must run the same neoOMSI release. |
| The code is rejected | Copy the whole code. A typo fails the check; old codes are not accepted. |
| The host does not answer | Check the code. Make sure the host is still driving with **Host my next drive** on. A firewall may block UDP port `27015`. |
| Joining by code fails over the internet | Both games need internet access. Some routers and mobile networks cannot be passed; the game then tries the host's tunnel. Otherwise use a [dedicated server](../server.md) or a VPN. |
| **Server not reachable** | The server's web port (normally `27025`) must be reachable when you join by address. |
| The map files do not download | The host's TCP port (same number as the UDP port) must be reachable. After joining with an invitation code, the game retries through the host's tunnel when there is one. |
| Searching finds nothing | The host must be on the same network and on port `27015`. Use the invitation code instead. |
| Other players' buses look generic | Install those buses. Vehicles are never downloaded. |
| The host offers the wrong address | The host's computer may have several network adapters, such as a VPN. Start the host's game with the environment variable `OMSI_LAN_IP` set to the right address (for example `OMSI_LAN_IP=192.168.1.20`); separate several addresses with commas. |
