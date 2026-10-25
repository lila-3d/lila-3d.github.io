# Duplicate, instances and arrays

Copies that share their mesh, repeat a transform, or stay live as an array. All of it is in the **Edit** menu.

## Hotkeys

| Key | Does |
| --- | --- |
| **Ctrl+D** | Duplicate. The adjust popup sets count, step move/rotate/scale, pivot and copy/instance/reference |
| **Shift+D** | Duplicate with Transform: one more copy, stepped as far again as the last copy is from its source |
| Hold **Y** + drag a gizmo handle | Clone while moving, rotating or scaling. Shift+D then carries on the same step |

Shift+D measures the step from where the last copy actually is, so move, rotate or scale it any way first. It keeps working after you select other things, as long as that copy still exists.

## Instance or reference

| | Shares | Own |
| --- | --- | --- |
| **Instance** | The mesh and its whole modifier stack | Transform |
| **Reference Copy** | The base mesh | Its modifier stack (starts as a copy of the source's) |

- Editing components on any member edits every member. Adding a modifier to an instance adds it to the shared stack.
- **Make Unique** gives a member its own data again.
- **Convert to Instances** replaces meshes identical to the last selected one with instances of it. Use it on imported kits.
- Deleting the source hands its data to the next member; nothing else changes.
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

`unrealPlaceInstances` sends one static mesh asset per instance source and places it in the open level: an actor per member, or a HISM component once a group has more than 50 members (pref `/instanceThreshold`, or `mode=`). Array copies count as members.

## Troubleshooting

**Shift+D is greyed out.** It needs a copy made by Duplicate or a clone drag in this session, and that copy must still exist.

**Editing one mesh changed others.** It's an instance or reference. **Select Instances** shows the members; **Make Unique** splits it off.

**Unreal actors were respawned instead of moved.** Placements are matched by Lila's node ids, which change when the scene is reopened.

**An array modifier's centre object moved but the copies didn't follow the mesh.** The mesh's position is stored when the centre is set; move the mesh, then set the centre again.
