# Masonry

Brick and stone walls laid course by course along any line or loop, then ruined, aged and sent to Unreal as instanced stones.

## Get it working

1. Draw the wall's base line or loop as a mesh with loose edges (or give the points from Python). Y is up; the wall stands on the lowest point.
2. **Create > Masonry Wall** on the selection.
3. Change **bond**, **height**, **thickness** and the stone sizes on the modifier in the attribute editor.

```python
wall = masonryWall(points=[[0, 0, 0], [400, 0, 0], [400, 0, 300]], bond="flemish", height=250)
masonryInfo(wall["mesh"])["checks"]   # {"overlaps": 0, "ok": True}
```

<!-- TODO image: an L-shaped Flemish bond wall with a bonded corner (images/masonry/corner.png) -->

Corners turn by alternating which side runs through on each course. Cut stones land mid wall, never at a corner. A wall thinner than a stone and a half is one stone thick; a thicker one gets two faces with the mortar core between.

Bonds: `running`, `stack`, `english`, `flemish`, `header`, `gardenWall`.

### Send to Unreal

With the editor connected (`unrealConnect()`):

```python
masonryShip(wall["mesh"], wait=True)["unreal"]   # {"imported": ..., "placed": ..., "errors": []}
```

Each stone mesh is imported once into `/Game/Lila/Masonry/<mesh>` with three LODs (worn, clean, box), and the stones are placed as one HISM per stone mesh per 4 m ground chunk, under the **Lila** folder in the outliner. The core is its own static mesh. Send again after an edit and the wall's chunks are replaced in place; chunks it no longer has are removed.

The core carries the wall's collision as convex UCX pieces; stones have none. Stones use the material slot `MasonryStone` and the core `MasonryMortar`: Unreal finds or makes materials of those names, with a Lila material's values when the scene has one so named. Materials read per-instance custom data: index 0 is a stable random per stone, index 1 is height up the wall (0 bottom course, 1 top).

For few draw calls instead of instancing, `masonryShip(mesh, mode="merged")` sends each chunk's stones as one static mesh with the same three LODs.

## Troubleshooting

**"has no loose edges to build along".** The mesh has faces. Build from a mesh holding only edges, or pass `points=`.

**A curve gets corners in it.** Turns sharper than **cornerAngle** (default 30 degrees) are corners. Raise it, or add points so each turn is gentler.

**Stones look machine laid.** Raise **jitter**, **wear** and **protrude**. **variants** sets how many differently worn copies of each stone exist.

**masonryShip says "not connected to Unreal".** Open the project with the LilaLink plugin enabled, then `unrealConnect()`. Check what would be sent without Unreal with `masonryShip(mesh, dryRun=True)`.

**Stones in Unreal but nothing in the level after a resend.** Errors from the editor go to Lila's log as `masonryShip <wall>: ...`; `wait=True` returns them in `["unreal"]["errors"]`.

**Slow while dragging a slider.** Set **detail** to 2 (plain boxes) while laying out, back to 0 for the final look.

## Tune it

| Input | What it does |
| --- | --- |
| stoneLength, stoneHeight, stoneDepth, joint | The nominal stone and mortar joint, cm. Defaults are a UK brick (21.5 x 6.5 x 10.25, 1 cm joint). Courses are fitted to the wall height. |
| recess | How far the mortar sits behind the stone faces. |
| bevel | Stone edge chamfer. |
| seed | Other wander, wear and cut positions. |
| masonryShip `chunkSize` | Ground cell per instanced component, cm (default 400). Smaller streams and culls finer, at more draw calls. |
| masonryShip `mode` | `hism` (default), `ism`, or `merged`. |
| masonryShip `collisionBands` | Height bands the core's collision is split into (default 1). |
| masonryShip `folder` | Content folder; the wall's assets go in `<folder>/<mesh name>`. |

Stones are instances of a few shared meshes, with `stone`, `wall`, `course`, `role` (0 stretcher, 1 header, 2 bat, 3 closer, 4 filler), `face` (0 outer, 1 inner, 2 through), `random`, `variant` and `size` attributes for geometry nodes to filter or shade by. The graph is a normal geometry-nodes group: open it to put nodes after the **Masonry Wall** node.
