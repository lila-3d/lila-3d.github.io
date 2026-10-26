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

The core carries the wall's collision as convex UCX pieces; stones have none.

The stones also get a baked atlas: each stone's worn shape is baked onto its plain box as normal, AO and curvature, all stones in one texture set in `<folder>/<mesh>/Textures`. All three LODs read it through uv0; the tiling projection for a stone surface texture is in uv1.

Material slots, which Unreal finds or makes by name (with a Lila material's values when the scene has one so named):

| Slot | On | Wants |
| --- | --- | --- |
| `MasonryStone` | stone LOD0 | AO and curvature from the atlas; its own geometry has the wear |
| `MasonryStoneFar` | stone LOD1 and LOD2 | the atlas normal map too, standing in for the wear |
| `MasonryMortar` | the core | |
| `MasonryShell` | low poly shells | the shell's own baked maps |

Per-instance custom data: index 0 is a stable random per stone, index 1 is height up the wall (0 bottom course, 1 top).

Other modes:

- `mode="merged"`: each chunk's stones as one static mesh with the same three LODs, for few draw calls instead of instancing.
- `mode="lowPoly"`: each chunk as a box shell with the stones and core baked onto it (normal, AO, curvature) and its own collision. For background walls and HLOD.

## Troubleshooting

**"has no loose edges to build along".** The mesh has faces. Build from a mesh holding only edges, or pass `points=`.

**A curve gets corners in it.** Turns sharper than **cornerAngle** (default 30 degrees) are corners. Raise it, or add points so each turn is gentler.

**Stones look machine laid.** Raise **jitter**, **wear** and **protrude**. **variants** sets how many differently worn copies of each stone exist.

**masonryShip says "not connected to Unreal".** Open the project with the LilaLink plugin enabled, then `unrealConnect()`. Check what would be sent without Unreal with `masonryShip(mesh, dryRun=True)`.

**Stones in Unreal but nothing in the level after a resend.** Errors from the editor go to Lila's log as `masonryShip <wall>: ...`; `wait=True` returns them in `["unreal"]["errors"]`.

**Baking is slow.** It runs on the GPU when Lila has one, else the CPU; `["bakeBackend"]` in the result says which. Lower `textureSize`, or send with `textures=False` to skip the atlas.

**Far stones look smooth.** The far LODs need the atlas normal map on `MasonryStoneFar`. Without textures they are plain boxes.

**Slow while dragging a slider.** Set **detail** to 2 (plain boxes) while laying out, back to 0 for the final look.

## Tune it

| Input | What it does |
| --- | --- |
| stoneLength, stoneHeight, stoneDepth, joint | The nominal stone and mortar joint, cm. Defaults are a UK brick (21.5 x 6.5 x 10.25, 1 cm joint). Courses are fitted to the wall height. |
| recess | How far the mortar sits behind the stone faces. |
| bevel | Stone edge chamfer. |
| seed | Other wander, wear and cut positions. |
| masonryShip `chunkSize` | Ground cell per instanced component, cm (default 400). Smaller streams and culls finer, at more draw calls. |
| masonryShip `mode` | `hism` (default), `ism`, `merged` or `lowPoly`. |
| masonryShip `textures` | Bake and send the atlas or shell maps (default on; lowPoly always bakes). |
| masonryShip `textureSize` | Atlas or shell texture size, texels (default 2048). `["atlasTexelsPerCm"]` reports the atlas density. |
| masonryShip `backend` | `auto` (default), `gpu` or `cpu`. |
| masonryShip `collisionBands` | Height bands the core's collision is split into (default 1). |
| masonryShip `folder` | Content folder; the wall's assets go in `<folder>/<mesh name>`. |

Stones are instances of a few shared meshes, with `stone`, `wall`, `course`, `role` (0 stretcher, 1 header, 2 bat, 3 closer, 4 filler), `face` (0 outer, 1 inner, 2 through), `random`, `variant` and `size` attributes for geometry nodes to filter or shade by. The graph is a normal geometry-nodes group: open it to put nodes after the **Masonry Wall** node.
