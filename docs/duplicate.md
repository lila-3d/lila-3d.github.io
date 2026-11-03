# Duplicate and instance

Copies that share their mesh, repeat a transform, or stay live as an array. All of it is in the **Edit** menu.

## Hotkeys

| Key | Does |
| --- | --- |
| **Ctrl+D** | Duplicate. The adjust popup sets count, step move/rotate/scale, pivot and copy/instance/reference |
| **Shift+D** | Duplicate with Transform: one more copy, stepped as far again as the last copy is from its source |
| Hold **Y** + drag a gizmo handle | Clone while moving, rotating or scaling. Shift+D then carries on the same step |

Shift+D measures the step from where the last copy is, so move, rotate or scale it first. It works after you select other things, as long as that copy exists.

## Instance or reference

| | Shares | Own |
| --- | --- | --- |
| **Instance** | The mesh and its whole modifier stack | Transform |
| **Reference Copy** | The base mesh | Its modifier stack (starts as a copy of the source's) |

- Editing components on any member edits every member. Adding a modifier to an instance adds it to the shared stack.
- **Make Unique** gives a member its own data again.
- **Convert to Instances** replaces meshes identical to the last selected one with instances of it. Use it on imported kits.
- Deleting the source hands its data to the next member.
- Freeze Transformations makes the mesh unique first.

FBX export writes one shared mesh per instance source, and FBX and Maya imports bring shared meshes in as instances (Import FBX's `instances` option turns this off).

## Arrays

**Edit > Array**: drag a direction for a row, or click a centre for a ring.

| Key | In the Array tool |
| --- | --- |
| **1** / **2** / **3** | Linear / radial / grid |
| **+** / **-** | Count |
| Drag a handle | Spacing, count, angle, rise |
| **Enter** | Make the array |
| **Esc** | Cancel |

- The objects become the array's children and stay editable; every copy follows.
- Copies aren't objects. Clicking one selects the array; clicking the original selects it.
- **Bake Array** turns the copies into real instances under a group.
- For repeats inside one mesh (gear teeth, bolts round a flange) use the **array** modifier's radial or grid mode. Model one wedge, turn on Weld, and the ring closes exactly.

## Send to Unreal

`unrealPlaceInstances` sends one static mesh asset per instance source and places it in the open level: an actor per member, or a HISM component once a group has more than 50 members (pref `/instanceThreshold`, or `mode=`). Array copies count as members. Sending again moves, adds and removes actors to match, even after renaming or reopening the scene. Save the scene after the first send so it remembers which actors are whose.

```python
unrealPlaceInstances("Ruins", collision="complexAsSimple", wait=True)
unrealListPlacements("Ruins")                  # what Unreal now holds, errors as data
unrealAssetInfo("/Game/Lila/Instances/SM_Wall") # triangles, Nanite, collision
unrealSaveAssets(level=True)
```

- Assets are `SM_<source name>`. Two sources with the same name get part of their link id appended; the name is saved on the source and never changes.
- Assets collide as their render mesh by default (`collision=`: `none`, `box`, `convex`, `complexAsSimple`, `ucx`). With `ucx`, the source's `UCX_` child meshes go into the asset and are never placed. Nanite stays off unless `nanite=True`.
- Geometry nodes instances (scatters, Stagehand arrangements, Fracture pieces) go as instances, not one merged mesh: one asset per mesh they reference, a HISM above the threshold. Their `id` instance attribute keys each one, else its index.
- Custom primitive data slot 0 is a stable random per placement. `unrealCustomData("Boulder", data=["random", "wear", "tint"])` maps member attributes, or for geometry nodes their instance attributes, to slots in order; a vector takes three. Materials read them with a **PerInstanceCustomData** node (HISM) or a parameter with **Use Custom Primitive Data** on (actors).
- In a HISM, each instance's attribute values sit in the holder's `LilaInstanceData` component (`GetValue(instance, "Component.attr")`); the holder itself takes only the components every member shares.
- Validators run first: an issue whose `blocks` lists `unreal` (or the command) on what is sent stops it; other issues come back in the result's `issues`. `validate=False` skips running them.
- `unrealCall("runPython", params={"code": "...", "mode": "evaluate"})` reaches any LilaLink method.

## Troubleshooting

**Shift+D is greyed out.** It needs a copy made by Duplicate or a clone drag in this session, and that copy must still exist.

**Editing one mesh changed others.** It's an instance or reference. **Select Instances** shows the members; **Make Unique** splits it off.

**A placed mesh has no collision in Unreal.** It was sent with `collision="none"`, or `ucx` with no `UCX_` child. Check with `unrealAssetInfo(path)["collision"]` and send again.

**Placements time out on a large send.** The wait grows with the count, up to 30 minutes; a send past that is stuck in the editor. Check its log for LogLilaLink.

**Unreal actors were respawned instead of moved.** The scene wasn't saved after the first send, so the objects got new ids the next time. Delete the old actors in Unreal, under the Lila folder in the Outliner.

**An array modifier's centre object moved but the copies didn't follow the mesh.** The mesh's position is stored when the centre is set; move the mesh, then set the centre again.
