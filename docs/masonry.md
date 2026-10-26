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

Materials are instances of one master, `M_LilaMasonry` in `/Game/LilaLink/Masters`, made the first time and then yours to edit; Lila never overwrites it unless you send with `regenerateMaster=True`. Each wall gets its instances in `<folder>/<mesh>/Materials`:

| Instance | Slot | On |
| --- | --- | --- |
| `MI_<mesh>_Stone` | `MasonryStone` | stone LOD0, which has the wear in its geometry |
| `MI_<mesh>_StoneFar` | `MasonryStoneFar` | stone LOD1 and LOD2, which take the atlas normal map instead |
| `MI_<mesh>_Mortar` | `MasonryMortar` | the core |
| `MI_<mesh>_<cx>_<cz>` | `MasonryShell` | each low poly shell, with its own baked maps |

To set the look from Lila, make materials named `MasonryStone` and `MasonryMortar`: their base colour becomes the instances' **Tint**, their roughness **BaseRoughness**, and their base colour and normal maps the tiling stone texture and detail normal (stones read them through uv1; the core and shells project them in world space every **TileSize** cm). Everything else is an instance parameter in Unreal: **ValueSpread** and **ColorSpread** (stone to stone variation), **EdgeLighten** and **CavityStrength** (from the atlas curvature), **DirtHeight**, **DirtFade** and **DirtStrength** (a darker band at the foot of the wall), **AOStrength**.

Per-stone variation comes from instance custom data on HISM and ISM (0 a stable random, 1 height up the wall, 0 bottom course to 1 top) and from vertex colour R and G on merged meshes.

To use your own master instead, pass its path: `masonryShip(mesh, material="/Game/Art/M_MyStone")`. It needs the same parameter names. `material="none"` skips the instances and matches or makes materials by slot name.

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

**"plugin in this editor is too old for masonry materials".** Rebuild LilaLink from Lila's `ue/LilaLink`, or send with `material="none"`.

**The master changed in a new Lila but the wall looks the same.** Your `M_LilaMasonry` is kept as you left it; the reply's `["unreal"]["materials"]["warnings"]` says when it is older. Send once with `regenerateMaster=True` to rebuild it (edits to it are lost; instances keep their values).

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
| masonryShip `material` | `generate` (default), `none`, or the path of your own master. |
| masonryShip `regenerateMaster` | Rebuild `M_LilaMasonry` from this version of Lila. |
| masonryShip `collisionBands` | Height bands the core's collision is split into (default 1). |
| masonryShip `folder` | Content folder; the wall's assets go in `<folder>/<mesh name>`. |

Stones are instances of a few shared meshes, with `stone`, `wall`, `course`, `role` (0 stretcher, 1 header, 2 bat, 3 closer, 4 filler), `face` (0 outer, 1 inner, 2 through), `random`, `variant` and `size` attributes for geometry nodes to filter or shade by. The graph is a normal geometry-nodes group: open it to put nodes after the **Masonry Wall** node.
