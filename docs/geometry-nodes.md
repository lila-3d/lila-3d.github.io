# Geometry nodes

Node graphs that build or change a mesh, live on its modifier stack. Every node is in the [Geometry node reference](nodes/geometry-nodes.md).

## Get it working

1. **Mesh > Node Editor**, then **New** on its toolbar.
2. Add nodes between Group Input and Group Output (**Tab** or **Shift+A** over the canvas).
3. Apply the group to a mesh. The group's exposed inputs are keyable attributes on the modifier.

```python
gnCreateGroup("Scatter")
gnAddNode("Scatter", "DistributePointsOnFaces", name="Dist")
gnApply("Ground", "Scatter")
```

Distances are in centimetres, angles on sockets in radians unless the socket says degrees, and Y is up.

## Zones: Repeat, For Each, Simulation, Closure

A zone's input and output nodes are added together; the nodes between them (a tinted region) run inside the zone. Values other than geometry that pass through a zone are **items**: select either zone node and add them in the side panel. Nodes inside can read anything outside.

- **Repeat** runs its nodes *Iterations* times, each pass starting from the last pass's geometry and items. *Iteration* counts from 0.
- **For Each Element** runs its nodes once per mesh part, face, curve or instance, each seeing only its element, and joins the results. Runs are parallel, so don't rely on order.
- **Simulation** steps its geometry and items forward a frame at a time from *Start Frame*, caching each frame; scrubbing back reads the cache. *Delta Time* is the step in seconds. Items hold one value each, so store per-point state as attributes.
- **Closure** turns its nodes into a value you run with **Evaluate Closure**. Set its inputs and outputs in the side panel; linking it into an empty Evaluate Closure copies them.

The **Repeat** and **For Each Element** nodes in the Group category run a separate group instead: pick it in the side panel, double-click the node to open it.

## Bundles and matrices

- **Combine Bundle** packs values of any type into one link, **Separate Bundle** takes them out by name, **Join Bundle** merges bundles. Linking a Combine Bundle into an empty Separate Bundle copies its items.
- **Matrix** sockets carry a transform. Build one with **Combine Transform**, read it with **Separate Transform**, and use it in **Transform Geometry**, **Transform Point**, **Transform Direction** and **Set Instance Transform** with their mode set to *matrix*. A rotation links straight into a matrix socket.

## Bake

Put a **Bake** node after anything slow (a big boolean, a simulation) and press **Bake** in its side panel. It saves what reaches it to `bakes/<group>_<node>` next to the scene and reads that instead. *Animation* mode saves every frame of the playback range. **Delete Bake** evaluates live again.

## Spreadsheet

**Editors > Spreadsheet** lists the selected mesh's evaluated geometry: a row per element, a column per attribute. Pick the component and domain at the top.

## Wrangle and Expression

Per-element code, VEX-like. Wrangle writes attributes; Expression returns a field. Type the code in the node's properties and press **Ctrl+Enter** (or Apply); **Escape** discards unapplied edits.

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

A graph reaches the scene as one mesh, so game nodes mark their results with attributes:

| Node | Attribute | Meaning |
| --- | --- | --- |
| LOD Chain | instance `lod`, `screenSize` | One instance per level. |
| Collision | face `collision`, `collisionShape` | Piece number; shape 0 UCX (convex), 1 UBX, 2 USP, 3 UCP. |
| Socket Points | point `socket`, `rotation` | Socket index and orientation. |
| Pivot Painter | UV set N and N+1, colour `pivotAxis` | Pivot xy; pivot z and 0..1 element index; axis and relative length. |
| Lightmap UV | a second UV set | Packed with padding for the lightmap resolution. |

## Vertex animation and imposters

- **Vertex Animation Texture**: press **Encode** in its side panel. It samples what reaches it over the playback range and writes the files **exportVertexAnimation** writes into `vat/` next to the scene.
- **Imposter**: **Bake** views what reaches it from a Frames x Frames grid of directions and writes base colour and normal atlases (depth in alpha), a card FBX and the material inputs into `imposters/`. **Send to Unreal** bakes and imports it as `/Game/Lila/Imposters/SM_<name>` with an instance of LilaLink's `M_LilaImposter`, which turns the card to the camera's nearest view. Hemi-octahedral views only from above, for things seen from the ground. Base colour comes from the mesh's current colour set.

## Volumes

Volume nodes make a voxel grid (signed distance or density) that SDF Boolean, Offset SDF and Smooth Volume shape. The viewport shows a volume as a see-through surface, but only meshes reach the modifier stack: end the branch with **Volume to Mesh** to keep it.

`exportVDB("Box", "smoke.vdb")` writes OpenVDB (Unreal sparse volume textures, Houdini, Blender); `exportNanoVDB` writes NanoVDB. **Read VDB** and **Read NanoVDB** bring a float grid in. All four come with the NanoVDB extension, on by default.

## Troubleshooting

**"no group named ..." on a Group, Repeat or For Each node.** Its group was renamed or deleted. Pick it again in the side panel.

**"has no zone output to pair with".** One half of a zone was deleted outside the Node Editor. Delete the other half and add the zone again.

**A Bake node says its baked file is missing.** The `bakes` folder was moved or deleted. Bake again, or Delete Bake to evaluate live.

**A simulation zone doesn't move.** It only steps forward from *Start Frame*; check the frame is past it and the modifier is enabled.

**A Wrangle error with a line and column.** The code didn't compile at that position. Writing `@N`, or `@P` on edge, face or corner domains, is an error.

**SDF nodes say they need a signed distance.** A density grid reached them (Volume Cube, Distribute Points in Volume). Use Mesh to SDF or Points to SDF instead.

**Wave Function Collapse outputs `solved` false.** The tiles' labels or profiles can't fill the grid. Add a tile that fits the failing sides, allow rotations, or raise Attempts.

**Send to Unreal says the LilaLink plugin predates imposters.** Copy Lila's `ue/LilaLink` into the engine or project plugins and rebuild the editor.
