# ZBrush

Send meshes to ZBrush and back with GoZ.

## Get it working

1. Choose **File > Send to ZBrush** once to add Lila to ZBrush's GoZ applications, then restart ZBrush.
2. With ZBrush open, select meshes and choose **File > Send to ZBrush**. ZBrush comes to the front with each mesh as a subtool.
3. Sculpt, paint, mask or regroup in ZBrush.
4. In ZBrush's **Tool** palette, press **GoZ** to send the current subtool back, or **All** for every subtool. Lila brings them in by itself, and starts if it isn't running. **File > Get from ZBrush** shows where those buttons are and waits for them.

Each mesh becomes a subtool named after it with a closing `-` (`Head-`), and keeps that subtool if you rename the mesh. A subtool comes back into the mesh it came from; one that started in ZBrush comes in as a new mesh and goes back to the same subtool next time. If the topology is the same (you sculpted it), Lila moves the points and keeps the mesh's UVs, materials and hard edges. If you changed the topology (ZRemesher, DynaMesh, Divide), Lila replaces the mesh, keeping only what ZBrush sends. Each receive is one undo step.

```python
from lila import ops
ops.gozSend()                          # the selection
ops.gozSend(["Head", "Body"])
ops.gozReceive()                       # the last GoZ send, if it didn't come in by itself
ops.gozSend(scale=1.0)                 # 1 ZBrush unit per cm instead of per metre
ops.gozSend(newSubtools=True)          # new subtools beside the ones from earlier sends
```

What comes back:

| ZBrush | Lila |
| --- | --- |
| Polypaint | The mesh's current color set, or a new one named `polypaint` |
| Mask | Point layer `sculptMask` (1 masked), which sculpt mode uses |
| Polygroups | Face layer `polygroup` |
| UVs | UV set 0 |

To keep an earlier version in ZBrush, turn on **New Subtools** in Send to ZBrush's option box: the meshes arrive as new subtools and come back from those from then on.

Meshes go out in world space, 1 ZBrush unit per metre (a person is about 2 units tall, the size DynaMesh and ZRemesher expect), and come back to their own transform and size. Receive with the same `scale` you sent with. Lila sends the base mesh under any modifiers, so the modifiers still apply when it comes back.

**File > Import** and **File > Export** also read and write `.GoZ` files directly.

## Troubleshooting

- **ZBrush closes when you send.** ZBrush was open when Lila was added to GoZ. Restart ZBrush and send again.
- **Send to ZBrush or Get from ZBrush says ZBrush isn't open.** Start ZBrush first; Lila doesn't start it.
- **"Waiting for ZBrush to finish loading".** ZBrush was still starting when you sent. Lila retries for two minutes and says **Sent to ZBrush** once it arrives; after that, send again.
- **Nothing comes back when you press GoZ in ZBrush.** In ZBrush, open **Preferences > GoZ** and pick **Lila** as the target application. If Lila isn't in the list, run `gozInstall()` and restart ZBrush.
- **ZBrush asks where Lila is.** Run `gozInstall()` from the Lila you want ZBrush to start. Use `gozInstall(exe="D:/Lila/lila.exe")` to point it at another one.
- **Send to ZBrush says GoZ isn't installed.** Start ZBrush once so it sets up its GoZ folders (`C:\Users\Public\Pixologic` on Windows), then send again.
- **A subtool comes back as a new mesh.** It was renamed in ZBrush, or came from a scene other than the open one.
- **Faces with more than four sides come back as triangles.** ZBrush takes only triangles and quads, so Lila splits larger faces on the way out.
