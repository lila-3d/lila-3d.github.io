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

## Loops: Repeat and For Each Element

Both run another group, picked from the node's side panel like a Group node; double-click to open it.

- **Repeat** runs the group *iterations* times. Its output geometry is the next pass's input, and any output named like an input feeds that input on the next pass (a counter, an accumulated value). An Int input named `iteration` reads the pass number from 0.
- **For Each Element** runs the group once per mesh part, face, curve or instance, each run seeing only that element, and joins the results. Int inputs named `index` and `count` read the element's number and the total. Runs are parallel, so don't rely on order.

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

## Volumes

Volume nodes make a voxel grid (signed distance or density) that you shape with SDF Boolean, Offset and Smooth. Volumes don't draw in the viewport and never reach the modifier stack: end the branch with **Volume to Mesh**.

## Troubleshooting

**"no group named ..." on a Group, Repeat or For Each node.** The group it runs was renamed or deleted. Pick it again in the side panel.

**A Wrangle error with a line and column.** Its code didn't compile; the position points at the problem. Writing `@N` or writing `@P` on edge, face or corner domains is an error.

**SDF nodes say they need a signed distance.** A density grid reached them (Volume Cube, Distribute in Volume input). Use Mesh to SDF or Points to SDF instead.

**Wave Function Collapse outputs `solved` false.** The tiles' labels or profiles can't fill the grid. Add a tile that fits the failing sides, allow rotations, or raise restarts.
