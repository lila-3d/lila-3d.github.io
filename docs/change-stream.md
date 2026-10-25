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

Start from a snapshot, then apply each group whose `seq` is greater than the snapshot's.

| Message `type` | Means |
| --- | --- |
| `hello` | Sent on connect. |
| `group` | One action's changes: `command`, `source` (`ui`, `script` or `interactive`), `ok`, `undo` or `redo` with the step's label, `changes`. |
| `resync` | The scene was replaced (`reason`: `new`, `open`, `reset`, `overflow`). Ask for a snapshot. |
| `event` | `sceneSaved`, `sceneImported` or `sceneExported`, with `path`. |
| `snapshot` | `nodes` (parents first, each with `parent`, `attrs`, and `world` when you asked for it), `connections`, `selection`, `time`, `scene`. |
| `live` | Only with `"live": true`. Interim `value` (and `world`) changes while a drag is still going, at most about 30 a second per attribute. The drag's `group` still follows on release. `seq` is the last group's. |
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
| `world` | Only with `"world": true`. `matrix`: the evaluated world matrix, 16 numbers, column by column (translation is 12 to 14). Sent after a transform's values change or it is reparented, for it and every transform under it, once per action. |

## Troubleshooting

**Nothing arrives.** Changes go out when the action ends: after the command, or when a drag is released. Run `changeStream()` to see whether it is running, on which port, and how many clients are connected.

**`changeStream: cannot listen on port 8742`.** Another Lila has the port. Use `changeStream(enable=True, port=8743)`, or change the port in the preferences.

**A `resync` arrives.** A scene was opened or cleared, an import or load changed it wholesale, or your client fell more than 256 MB behind. Send `{"op": "snapshot"}` and continue from its `seq`.

**Mesh values are `{"summary": "mesh", ...}`.** Meshes, and data over 4 KB, go as counts and a hash by default. The hash changes when the points or faces do. Subscribe with `"full": true` for whole values.

**Another machine can't connect.** It only listens on localhost. Turn off **Localhost only**, or run `changeStream(allowRemote=True)`. Windows asks to let it through the firewall.

**`wrong token` or `this server needs a token`, then the connection closes.** With remote connections allowed, each client must send the token first: `{"op": "auth", "token": "..."}`, or `"token"` in its subscribe. `changeStream()["token"]` shows it, and it is kept in general.json as `/changeStream/token`. A client that sends nothing is dropped after 10 seconds. Localhost-only needs no token.

**Batch runs stream nothing.** `lilabatch` doesn't read the preferences: run `changeStream(enable=True)` in the script.

**A change shows up twice after a snapshot.** A snapshot asked for while a command has a dialog open can already contain a change that command's group then sends. Applying it again is harmless for values; skip a `created` for an id you already have.

**A mesh's evaluated shape or another computed output doesn't arrive.** Only edited values and, with `world`, world matrices are streamed. Deformed or generated meshes, and anything that changes only because time moved, are not.

## Options

| Preference (General) | Default | What it does |
| --- | --- | --- |
| Stream scene changes to other processes | Off | Starts the server with Lila. |
| Port | `8742` | Where it listens. |
| Localhost only | On | Off listens on every network interface and requires the token. |

`changeStream(enable=, port=, allowRemote=)` changes the running session only. `port=0` picks a free port, returned as `"port"`.

Narrow what a client hears with `{"op": "subscribe", ...}`. Lists match any entry; leave one out to match everything.

| Field | What it does |
| --- | --- |
| `types` | Node types, subtypes included, e.g. `["mesh"]`. |
| `attrs` | Attribute long names, e.g. `["translate", "rotate"]`. |
| `under` | Full paths: the node and everything below it, e.g. `["\|Rig"]`. |
| `full` | `true` sends whole meshes and large data. |
| `live` | `true` adds `live` messages during drags. |
| `world` | `true` adds `world` changes, and `world` to snapshot nodes. |
| `token` | The token, when the server needs one. |
| `snapshot` | `true` replies with a filtered snapshot as well. |

## Inside Lila

Extensions get the same messages without a socket. Handlers run on the main thread after each action, and an extension's subscriptions go when it unloads.

Python:

```python
from lila import stream

sub = stream.subscribe(lambda msg: print(msg["type"]), types=["transform"], attrs=["translate"], live=True, world=True)
stream.unsubscribe(sub)
```

C++, from an extension's init:

```cpp
#include <lila/ChangeStream.h>
#include <lila/Log.h>

lila::stream::Filter filter;
filter.types = {"mesh"};
lila::stream::subscribe(ctx, [](const nlohmann::json& msg) {
    if (msg["type"] == "group")
        for (const auto& c : msg["changes"])
            lila::log::info("{} {}", c["kind"].get<std::string>(), c.value("path", ""));
}, filter);
```

`snapshot(filter)` returns the whole scene as a snapshot message in both.
