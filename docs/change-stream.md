# Change stream

Feed scene changes to your own process as JSON deltas over a local socket: one line per user action, no polling, no USD.

> Available for C++ and Python, in Lila or from any process over the socket. See [Inside Lila](#inside-lila).

## Get it working

1. Turn it on in **Preferences > General > Change Stream**, or run `changeStream(enable=True)` in the script editor. It listens on `127.0.0.1:8742`.
2. Connect and read one JSON object per line. A complete Python client:

```python
import json, socket

f = socket.create_connection(("127.0.0.1", 8742)).makefile("rw", encoding="utf-8", newline="\n")

def send(request):
    f.write(json.dumps(request) + "\n")
    f.flush()

send({"op": "subscribe", "snapshot": True})
for line in f:
    msg = json.loads(line)
    if msg["type"] == "snapshot":
        print(len(msg["nodes"]), "nodes as of seq", msg["seq"])
    elif msg["type"] == "group":
        for c in msg["changes"]:
            print(msg["command"], c["kind"], c.get("path"), c.get("attr"), c.get("value"))
    elif msg["type"] == "resync":
        send({"op": "snapshot"})
```

3. Move an object in Lila. Each command, tool drag or undo arrives as one `group` line:

```json
{"type":"group","seq":12,"command":"move","source":"ui","ok":true,"changes":[{"kind":"value","id":7,"path":"|Rig|Arm","type":"locator","attr":"translate","value":[10.0,0.0,0.0]}]}
```

Start from a snapshot, then apply each message whose `seq` is greater than the snapshot's and drop the rest: everything at or below the snapshot's `seq` is already in it.

| Message `type` | Means |
| --- | --- |
| `hello` | Sent on connect. |
| `group` | One action's changes: `command`, `source` (`ui`, `script` or `interactive`), `ok`, `undo` or `redo` with the step's label, `changes`. |
| `resync` | The scene was replaced (`reason`: `new`, `open`, `reset`, `overflow`). Ask for a snapshot. |
| `event` | `sceneSaved`, `sceneImported` or `sceneExported`, with `path`. |
| `snapshot` | `nodes` (parents first, each with `parent`, `attrs`, `world` with `"world": true` and `outputs` with `"evaluated": true`), `connections`, `selection`, `time`, `scene`. Its `seq` is the last message it includes. |
| `live` | Only with `"live": true`. Interim `value`, `world` and `evaluated` changes while a drag is still going, at most about 30 a second per attribute. The drag's `group` still follows on release. `seq` is the last group's. |
| `frame` | Only with `"world": true` or `"evaluated": true`. The `world` and `evaluated` changes that time caused (playback, scrubbing) or any other evaluation outside an action, with `time`. At most about 30 a second; the last one always arrives once time stops. `seq` is the last group's. |
| `authed`, `subscribed`, `pong`, `error` | Replies to your requests. |

| Change `kind` | Fields besides `id`, `path`, `type` |
| --- | --- |
| `created` | `attrs`: every stored attribute. |
| `deleted` | The path it had. |
| `renamed` | `oldPath`. |
| `reparented` | `oldPath`, `parent`. |
| `value` | `attr`, `value`, `locked` when locked. Set many times in one action, it is sent once. |
| `connection` | `attr`, `source` (null once disconnected). |
| `selection` | `paths`. |
| `time` | `time`, in seconds. |
| `world` | Only with `"world": true`. `matrix`: the evaluated world matrix, 16 numbers, column by column (translation is 12 to 14). Sent after a transform's values change or it is reparented, for it and every transform under it, once per action, and in `frame` messages for transforms that time or a connection moved. |
| `evaluated` | Only with `"evaluated": true`. `attr`, `value`: an output's evaluated value (a mesh's `outMesh`, a transform's `matrix`), or an input's value while a connection drives it. Sent when it differs from the last value your filter was sent, so the first time it evaluates after you subscribe too. `worldMatrix` comes as `world` instead. |

## Troubleshooting

**Nothing arrives.** Changes go out when the action ends: after the command, or when a drag is released. Run `changeStream()` to see whether it is running, on which port, and how many clients are connected.

**`changeStream: cannot listen on port 8742`.** Another Lila has the port. Use `changeStream(enable=True, port=8743)`, or change the port in the preferences.

**A `resync` arrives.** A scene was opened or cleared, an import or load changed it wholesale, or your client fell more than 256 MB behind. Send `{"op": "snapshot"}` and continue from its `seq`.

**One command arrives as two groups with the same `command`.** A snapshot was taken while it was still running (a dialog open) or during a drag. The first group has the snapshot's `seq` and is already in it; the second holds what came after.

**Mesh values are `{"summary": "mesh", ...}`.** Meshes, and data over 4 KB, go as counts and a hash by default. The hash is taken from the mesh's content (points, faces, attribute layers), so any change to them changes it. Subscribe with `"full": true` for whole values.

**`evaluated` changes for a command that moved time arrive late.** Anything that moves time sends what that changed in the `frame` after its `group`.

**Another machine can't connect.** It only listens on localhost. Turn off **Localhost only**, or run `changeStream(allowRemote=True)`. Windows asks to let it through the firewall.

**`wrong token` or `this server needs a token`, then the connection closes.** With remote connections allowed, or `requireToken=True`, each client must send the token first: `{"op": "auth", "token": "..."}`, or `"token"` in its subscribe. `changeStream()["token"]` shows it, and it is kept in general.json as `/changeStream/token`. A client that sends nothing is dropped after 10 seconds. Localhost-only needs no token unless you ask for it. To try a token client without the firewall prompt, use `changeStream(enable=True, requireToken=True)`: the same check, on localhost.

**`lilabatch` streams nothing.** It ignores the preferences, so batch jobs running side by side don't fight over a port or open one unasked. Pass `--change-stream` (port 8742) or `--change-stream 0` (any free port, printed in the log) before any `--batch-run`, or set `LILA_CHANGE_STREAM` to a port. It listens on localhost only and stops when the job ends, after sending what is queued.

## Options

| Preference (General) | Default | What it does |
| --- | --- | --- |
| Stream scene changes to other processes | Off | Starts the server with Lila. |
| Port | `8742` | Where it listens. |
| Localhost only | On | Off listens on every network interface and requires the token. |

`changeStream(enable=, port=, allowRemote=, requireToken=)` changes the running session only. `port=0` picks a free port, returned as `"port"`. `requireToken=True` asks for the token on localhost too, for machines other users share.

Narrow what a client hears with `{"op": "subscribe", ...}`. Lists match any entry; leave one out to match everything.

| Field | What it does |
| --- | --- |
| `types` | Node types, subtypes included, e.g. `["mesh"]`. |
| `attrs` | Attribute long names, e.g. `["translate", "rotate"]`. Applies to `evaluated` too, e.g. `["outMesh"]`. |
| `under` | Full paths: the node and everything below it, e.g. `["\|Rig"]`. |
| `full` | `true` sends whole meshes and large data. |
| `live` | `true` adds `live` messages during drags. |
| `world` | `true` adds `world` changes, `frame` messages, and `world` to snapshot nodes. |
| `evaluated` | `true` adds `evaluated` changes, `frame` messages, and `outputs` to snapshot nodes. Nothing is evaluated or compared for clients that leave it off. |
| `token` | The token, when the server needs one. |
| `snapshot` | `true` replies with a filtered snapshot as well. |

## Inside Lila

Extensions get the same messages without a socket. Handlers run on the main thread after each action, and an extension's subscriptions go when it unloads.

Python:

```python
from lila import stream

sub = stream.subscribe(lambda msg: print(msg["type"]), types=["transform"], attrs=["translate"], live=True, world=True)
meshes = stream.subscribe(lambda msg: print(msg["type"]), types=["mesh"], attrs=["outMesh"], evaluated=True)
stream.unsubscribe(sub)
```

C++, from an extension's init:

```cpp
#include <lila/ChangeStream.h>
#include <lila/Log.h>

lila::stream::Filter filter;
filter.types = {"mesh"};
filter.evaluated = true;
lila::stream::subscribe(ctx, [](const nlohmann::json& msg) {
    if (msg["type"] == "group" || msg["type"] == "frame")
        for (const auto& c : msg["changes"])
            lila::log::info("{} {}", c["kind"].get<std::string>(), c.value("path", ""));
}, filter);
```

`snapshot(filter)` returns the whole scene as a snapshot message in both. Called while a command is still running, its `seq` still tells you exactly which later messages to apply.
