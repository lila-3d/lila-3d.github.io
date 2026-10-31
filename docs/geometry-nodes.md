# Geometry nodes

Build meshes, scatter, layouts and game-ready output from node graphs that stay live on a mesh's modifier stack. Every node is listed in the [Geometry node reference](nodes/geometry-nodes.md).

## Get it working

1. **Mesh > Node Editor**, then **New** on its toolbar.
2. Add nodes between Group Input and Group Output (**Tab** or **Shift+A** over the canvas).
3. Apply the group to a mesh. The result updates as you edit; the group's exposed inputs are keyable attributes on the modifier.

```python
gnCreateGroup("Scatter")
gnAddNode("Scatter", "DistributePointsOnFaces", name="Dist")
gnApply("Ground", "Scatter")
```

Distances are in centimetres, angles on sockets in radians unless the socket says degrees, and Y is up.

## Zones: Repeat, For Each, Simulation, Closure

Adding a zone adds its input and output node together; the nodes you put between them run inside the zone, drawn as a tinted region. Values besides the geometry that travel through a zone are **items**: select either zone node and add them in the side panel. Nodes inside a zone can read anything outside it.

- **Repeat** runs its nodes *Iterations* times, each pass starting from the last pass's geometry and items. *Iteration* is the pass number from 0.
- **For Each Element** runs its nodes once per mesh part, face, curve or instance, each seeing only its element, and joins the results. Runs are parallel, so don't rely on order.
- **Simulation** steps its geometry and items forward one frame at a time from *Start Frame*, cached frame by frame; scrubbing back reads the cache. *Delta Time* is the step's length in seconds. Items keep one value each, so store per-point state as attributes on the geometry.
- **Closure** turns its nodes into a value you link elsewhere and run with **Evaluate Closure**. Set the closure's inputs and outputs in the side panel; linking a closure into an empty Evaluate Closure copies them.

The older **Repeat** and **For Each Element** nodes that run a separate group still work: pick the group in the side panel and double-click the node to open it.

## Bundles and matrices

- **Combine Bundle** packs several values of any type into one link; **Separate Bundle** takes them out by name, and **Join Bundle** merges bundles. Linking a Combine Bundle into an empty Separate Bundle copies its items.
- **Matrix** sockets carry a whole transform. Build one with **Combine Transform**, read it with **Separate Transform**, and use it in **Transform Geometry**, **Transform Point**, **Transform Direction** and **Set Instance Transform** by setting their mode to *matrix*. A rotation links straight into a matrix socket.

## Bake

Put a **Bake** node after anything slow (a big boolean, a simulation) and press **Bake** in its side panel. It saves what reaches it next to the scene (`bakes/<group>_<node>`) and from then on reads the file instead of running the nodes before it. *Animation* mode saves every frame of the playback range. **Delete Bake** goes back to live evaluation.

## Spreadsheet

**Editors > Spreadsheet** lists the selected mesh's evaluated geometry: a row per point, edge, face, corner, curve or instance, a column per attribute. Pick the component and domain at the top; volumes show their resolution, voxel size and value range.

## Wrangle and Expression

Per-element code, VEX-like. Wrangle writes attributes; Expression returns a value as a field. Type the code in the node's properties and press Ctrl+Enter (or Apply) to run it; Escape discards unapplied edits.

```c
// Wrangle, domain point: lift by noise, colour by height
@P.y += noise(@P * 0.02) * a;
v@Cd = set(fit(@P.y, 0, 100, 0, 1), 0.2, 0.8);
i@class = rand(@id) > 0.5 ? 1 : 0;
```

| Item | Meaning |
| --- | --- |
| `@name` | Read or write an attribute. Prefix `f@ i@ v@ p@` sets float, int, vector, vector4; untyped is float. |
| `@P`, `@N`, `@Cd`, `@id` | Position (writable), normal (read only), colour, id. |
| `@ptnum` / `@elemnum`, `@numpt` / `@numelem` | Element index and count. |
| `a`, `b`, `c`, `d` | The node's inputs (`d` is a vector), also `ch("a")`. |
| `if / else`, `for`, `while`, `break`, `continue`, `?:` | Control flow. |

Functions: `sin cos tan asin acos atan atan2 sqrt pow exp log abs floor ceil frac sign radians degrees min max clamp lerp fit smooth length normalize dot cross distance rand noise set int float`, and `PI`. Division by zero gives 0.

## Game output conventions

A node graph reaches the scene as one mesh, so game nodes mark their results with attributes:

| Node | Attribute | Meaning |
| --- | --- | --- |
| LOD Chain | instance `lod`, `screenSize` | One instance per level. |
| Collision | face `collision`, `collisionShape` | Piece number; shape 0 UCX (convex), 1 UBX, 2 USP, 3 UCP. |
| Socket Points | point `socket`, `rotation` | Socket index and orientation. |
| Pivot Painter | UV set N and N+1, colour `pivotAxis` | Pivot xy; pivot z and 0..1 element index; axis and relative length. |
| Lightmap UV | a second UV set | Packed with padding for the lightmap resolution. |

## Vertex animation and imposters

- **Vertex Animation Texture**: put it where the animated geometry should be captured and press **Encode** in its side panel. It samples what reaches it over the playback range and writes the rest mesh FBX, position and normal textures and a JSON of the material inputs into `vat/` next to the scene, the same files as **exportVertexAnimation**.
- **Imposter**: press **Bake** to view what reaches it from every direction of a Frames x Frames grid and write a base colour atlas, a normal atlas (depth in alpha), a card mesh FBX and the material inputs into `imposters/`. Hemi-octahedral only views from above, for things seen from the ground. Base colour comes from the mesh's current colour set. Its **Card** output is the square the imposter draws on.

## Volumes

Volume nodes make a voxel grid (signed distance or density) that you shape with SDF Boolean, Offset and Smooth. A volume shows in the viewport as a see-through surface inside its grid's box, but only meshes reach the modifier stack: end the branch with **Volume to Mesh** to keep it as geometry.

Volumes go out to OpenVDB (`.vdb`, for Unreal's sparse volume textures, Houdini and Blender) with `exportVDB("Box", "smoke.vdb")`, or to NanoVDB with `exportNanoVDB`. **Read VDB** and **Read NanoVDB** bring a float grid in, from EmberGen or Houdini for instance. All four come with the NanoVDB extension, on by default.

## Troubleshooting

**"no group named ..." on a Group, Repeat or For Each node.** The group it runs was renamed or deleted. Pick it again in the side panel.

**"has no zone output to pair with".** One half of a zone was deleted outside the Node Editor. Delete the other half and add the zone again.

**A Bake node says its baked file is missing.** The `bakes` folder was moved or deleted. Bake again, or Delete Bake to evaluate live.

**A simulation zone doesn't move.** It starts at *Start Frame* and only steps forward from there; check the frame is past it and the modifier is enabled.

**A Wrangle error with a line and column.** Its code didn't compile; the position points at the problem. Writing `@N` or writing `@P` on edge, face or corner domains is an error.

**SDF nodes say they need a signed distance.** A density grid reached them (Volume Cube, Distribute in Volume input). Use Mesh to SDF or Points to SDF instead.

**Wave Function Collapse outputs `solved` false.** The tiles' labels or profiles can't fill the grid. Add a tile that fits the failing sides, allow rotations, or raise restarts.
