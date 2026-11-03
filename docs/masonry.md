# Masonry

Brick and stone walls and whole buildings laid stone by stone, with arches, columns, stairs and vaults, then ruined, aged and sent to Unreal as instanced stones.

## Get it working

1. Draw the wall's base line or loop as a mesh with loose edges (or give the points from Python). Y is up; each point's Y is the ground there, so the wall follows the terrain.
2. **Level > Masonry > Masonry Wall** on the selection.
3. Change **bond**, **height**, **thickness** and the stone sizes on the modifier in the attribute editor.

```python
wall = masonryWall(points=[[0, 0, 0], [400, 0, 0], [400, 0, 300]], bond="flemish", height=250)
masonryCheck(wall["mesh"])   # {"ok": True, "issues": [], ...}
```

<!-- TODO image: an L-shaped Flemish bond wall with a bonded corner (images/masonry/corner.png) -->

Corners turn by alternating which side runs through on each course. Cut stones land mid wall, never at a corner. A wall thinner than a stone and a half is one stone thick; a thicker one gets two faces with the mortar core between.

Bonds: `running`, `stack`, `english`, `flemish`, `header`, `gardenWall`, `herringbone`, `ashlar`, `rubble`, `dryStone`. **chips** knocks chips out of stone edges, more on old, wet and damaged stones.

### Walls over a blockout

```python
masonryFromMesh("KeepBlockout", bond="ashlar", stoneLength=60, stoneHeight=30, stoneDepth=35)
```

The blockout is sliced into bands (`band=` cm) and walls laid on each section's centre line, stepping in where it tapers. A hollow blockout gives its own wall thickness; a solid one uses `thickness` (a tenth of its narrower side when 0). The blockout is hidden afterwards.

### Openings, slopes and tops

```python
masonryWall(points=[[0, 0, 0], [1200, 150, 0]], heights=[400, 250], thickness=60, batter=2,
            stoneLength=40, stoneHeight=20, stoneDepth=25,
            openings=[{"name": "gate", "at": 600, "width": 160, "height": 260, "arch": "round"},
                      {"at": 250, "width": 70, "height": 120, "sill": 140, "arch": "pointed"}])
```

- Courses stay level and step over sloping ground. `heights=` (one per point) slopes or breaks the top; `ground="Terrain"` drops the footprint onto a mesh first.
- `openings` entries: `at` (cm along the points), `width`, `height`, `sill`, `arch` (`lintel`, `round`, `pointed`, `segmental`, `flat`) and `kind` (`door`, `window`, `niche`). Arches get voussoirs and a keystone, windows a projecting sill, and the coursing stops at jamb stones.
- **batter** leans both faces in, **bands** adds string courses (`"[300, 600]"`, heights in cm), **cornice** corbels the top courses out.

### Buildings

`masonryBuilding` builds a whole building from one JSON spec: walls with openings, buttresses, bands and cornices, plus columns, colonnades, stairs, barrel vaults, domes, freestanding arches and floors.

```python
masonryBuilding(name="Chapel", spec={
    "stone": {"length": 60, "height": 30, "depth": 35, "joint": 1.5},
    "walls": [{"name": "nave", "points": [[0, 0, 0], [1600, 0, 0], [1600, 0, 800], [0, 0, 800]], "closed": True,
               "height": 900, "thickness": 90, "cornice": 1,
               "openings": [{"name": "west_door", "at": 2000, "width": 200, "height": 450}],
               "buttresses": [{"at": 800}]}],
    "colonnades": [{"name": "portico", "from": [-300, 0, 100], "to": [-300, 0, 700], "count": 4, "height": 600, "diameter": 70}],
    "floors": [{"name": "roof", "points": [[0, 0, 0], [1600, 0, 0], [1600, 0, 800], [0, 0, 800]], "y": 900}]})
```

Floors take `"surface": "cobbles"`, `"flags"` or `"tiles"` (a pitched roof, `pitch` and `uphill`), and vaults `"kind": "groin"` as well as barrel and dome. Every part is a named region (`nave`, `nave/west_door`, `portico/column_3`); `masonryInfo` lists them with stone counts. To change a building, edit what `masonrySpec("Chapel")["spec"]` returns and pass it back with `masonryBuilding(node="Chapel", spec=...)`. The spec's `scale` multiplies every length, stones included: for builders far larger than people, scale the stones with the building, or it reads as human-sized. The full key list is the MCP resource `lila://masonry/spec-schema`.

### Ruin and age

```python
ruin("Chapel", left=0.5, collapse=90, gaps=1)       # half the stone left standing
ruin("Chapel", regions=["nave"], left=0.3)          # only the nave
age("Chapel", age=0.8, moss=0.6)
```

`left` is the share of stone left standing (0.75, 0.5, 0.25). The break is lower toward `collapse` (degrees about Y from +X), a few stones above it survive, nothing is left floating, top stones tip, and a share of what fell lies heaped at the foot (`settle=True` drops it with the rigid-body solver). Floors break into pieces; pieces with nothing under them fall. On objects that aren't masonry, such as stones placed by hand, `ruin` moves and deletes them in place.

**Level > Masonry > Ruin Brush**: drag over the selected wall or building to knock stones out, Shift to hold them up, `[` and `]` for the radius. From Python, `ruinPaint("Chapel", points=[[x, y, z], ...], radius=120)`; `clear=True` removes the strokes. `structural=True` also drops what can't stand under the rigid-body solver, such as an arch without its keystone.

`age` gives every stone age, wet (near the ground and on exposed tops) and moss (where wet and exposed). Damage comes from the ruin. `plaster=` leaves a render coat that peels high up and where damaged; `ivy=` climbs from the ground (**ivyHeight**, **leaf**).

### Variants and destruction

```python
w = masonryWedge("Chapel", count=9, vary={"left": [0.75, 0.5, 0.25]})   # w["sheet"] is a contact sheet PNG
masonryWedge("Chapel", count=9, vary={"left": [0.75, 0.5, 0.25]}, apply=4)
makeDestructible("Chapel", strength=30, impact=[800, 300, 0], blast=1500)
```

`makeDestructible` hands the stones to the Destruction extension's solver, linked where they touch (mortar strength times contact area, weaker with age) and to the ground. Python scripts can use `import lila.masonry as masonry` for typed calls and dataclass results.

### Send to Unreal

With the editor connected (`unrealConnect()`):

```python
masonryShip(wall["mesh"], wait=True)["unreal"]   # {"imported": ..., "placed": ..., "errors": []}
```

What is sent is the wall as it stands, ruin, rubble, age, plaster and ivy included (plaster and ivy as their own mesh). Each stone mesh is imported once into `/Game/Lila/Masonry/<mesh>` with three LODs (worn, clean, box), and the stones are placed as one HISM per stone mesh per 4 m ground chunk, under the **Lila** folder in the outliner. The core is its own static mesh. Sending again replaces the chunks in place and removes chunks it no longer has.

The core carries the collision as convex UCX pieces, plus boxes for column drums and steps; other stones have none.

Stones also get a baked atlas: each stone's worn shape baked onto its plain box as normal, AO and curvature, all stones in one texture set in `<folder>/<mesh>/Textures`. All three LODs read it through uv0; the tiling projection for a stone surface texture is in uv1.

The look lives in the material function `MF_LilaMasonry` in `/Game/LilaLink/Masters`: drop it into your own material, or use `M_LilaMasonry`, the master built on it. Both are made the first time and then yours to edit; only `regenerateMaster=True` overwrites them. Each wall gets instances in `<folder>/<mesh>/Materials`:

| Instance | Slot | On |
| --- | --- | --- |
| `MI_<mesh>_Stone` | `MasonryStone` | stone LOD0, which has the wear in its geometry |
| `MI_<mesh>_StoneFar` | `MasonryStoneFar` | stone LOD1 and LOD2, which take the atlas normal map instead |
| `MI_<mesh>_Mortar` | `MasonryMortar` | the core |
| `MI_<mesh>_<cx>_<cz>` | `MasonryShell` | each low poly shell, with its own baked maps |

To set the look from Lila, make materials named `MasonryStone` and `MasonryMortar`: their base colour becomes the instances' **Tint**, their roughness **BaseRoughness**, and their base colour and normal maps the tiling stone texture and detail normal. Everything else is an instance parameter in Unreal: **ValueSpread** and **ColorSpread**, **EdgeLighten** and **CavityStrength**, the dirt band (**DirtHeight**, **DirtFade**, **DirtStrength**), **AOStrength**, and the weathering: **AgeDarken**, **DamageColor** and **DamageStrength**, **WetDarken** and **WetRoughness**, **MossColor**, **MossStrength** and **MossUp** (how much moss keeps to upward faces).

Per-stone data on HISM and ISM is instance custom data 0 random, 1 height up the wall, 2 age, 3 damage, 4 wet, 5 moss. Merged meshes carry random, height, moss and wet as vertex colour RGBA and age and damage in uv2.

To use your own master (with the same parameter names), pass its path: `masonryShip(mesh, material="/Game/Art/M_MyStone")`. `material="none"` skips the instances and matches or makes materials by slot name.

Other modes:

- `mode="merged"`: each chunk's stones as one static mesh with the same three LODs, for few draw calls instead of instancing.
- `mode="lowPoly"`: each chunk as a shell with the stones and core baked onto it and its own collision, following the walls as they stand, ruins included. For background walls and HLOD.
- `mode="assembly"`: a Nanite Assembly (UE 5.8) written through USD, with the stone meshes as parts. The Unreal project needs the **Interchange OpenUSD** plugin and `r.Nanite.AllowAssemblies=1` under `[/Script/Engine.RendererSettings]` in `DefaultEngine.ini` (or Nanite Foliage on), then an editor restart. Nanite is otherwise off; `nanite=True` builds Nanite data for the stone meshes in any mode.

## Troubleshooting

**Assembly send fails with "is USD, which this project cannot import" or "is a Nanite Assembly, which this project does not build".** Set up the project as described under `mode="assembly"` above, restart the editor and send again.

**"has no loose edges to build along".** The mesh has faces. Build from a mesh holding only edges, or pass `points=`.

**A curve gets corners in it.** Turns sharper than **cornerAngle** (default 30 degrees) are corners. Raise it, or add points so each turn is gentler.

**An opening is missing.** `at` is measured along the footprint from its first point, in cm; an opening past the end, or one that starts above the wall's top, is skipped. Its courses snap to the coursing, so heights move by up to half a course.

**masonryBuilding names a key it doesn't know.** The error lists the keys that part takes; check the spelling against `lila://masonry/spec-schema`.

**The building looks human-sized.** Scale the stones too: `"scale"` in the spec, or larger `stone` sizes.

**masonryCheck reports floating stones.** Something was placed in mid-air in the spec (an arch or vault with nothing under its springing). Lower it onto a wall or column, or let `ruin` drop what has no support.

**The Ruin Brush does nothing.** Select the wall's mesh before starting the brush; strokes only take stones still standing.

**makeDestructible says the Destruction extension isn't loaded.** Enable Destruction in the extensions list.

**`left` isn't exact.** It is met to within a few percent; survivors and stones that lose their support move it. The result's `["left"]` is what stands.

**Stones look machine laid.** Raise **jitter**, **wear** and **protrude**. **variants** sets how many differently worn copies of each stone exist.

**masonryShip says "not connected to Unreal".** Open the project with the LilaLink plugin enabled, then `unrealConnect()`. Check what would be sent without Unreal with `masonryShip(mesh, dryRun=True)`.

**Stones in Unreal but nothing in the level after a resend.** Errors from the editor go to Lila's log as `masonryShip <wall>: ...`; `wait=True` returns them in `["unreal"]["errors"]`.

**Baking is slow.** It runs on the GPU when there is one, else the CPU; `["bakeBackend"]` in the result says which. Lower `textureSize`, or send with `textures=False` to skip the atlas.

**"plugin in this editor is too old for masonry materials".** Rebuild LilaLink from Lila's `ue/LilaLink`, or send with `material="none"`.

**Moss and wet don't show in Unreal.** Your `M_LilaMasonry` is kept as you left it; the reply's `["unreal"]["materials"]["warnings"]` says when it is older than the plugin. Send once with `regenerateMaster=True` to rebuild it (edits to it are lost; instances keep their values).

**Slow while dragging a slider.** Set **detail** to 2 (plain boxes) while laying out, back to 0 for the final look.

## Tune it

| Input | What it does |
| --- | --- |
| stoneLength, stoneHeight, stoneDepth, joint | The nominal stone and mortar joint, cm. Defaults are a UK brick (21.5 x 6.5 x 10.25, 1 cm joint). Courses are fitted to the wall height. |
| recess | How far the mortar sits behind the stone faces. |
| bevel, tile | Stone edge chamfer; cm of stone per UV unit of the tiling texture. |
| seed, ruinSeed | Other wander, wear and cut positions; another break. |
| slope, roughness, survivors, loose, tip, rubble | How the ruin breaks: lower toward the collapse side, ragged top, stones that hang on, tipped tops, the most a stone tips, share of fallen stones kept as rubble. |
| wetHeight | Damp band above the ground, cm (0 is a fifth of the height). |
| plasterThickness | Render coat thickness, cm (0 is a third of a stone height). |
| masonryShip `chunkSize` | Ground cell per instanced component, cm (default 400). |
| masonryShip `mode` | `hism` (default), `ism`, `merged`, `lowPoly` or `assembly`. |
| masonryShip `nanite` | Build Nanite data for the stone meshes (default off). |
| masonryShip `textures`, `textureSize`, `backend` | Bake the atlas or shell maps, their size, on `gpu` or `cpu`. |
| masonryShip `material` | `generate` (default), `none`, or the path of your own master. |
| masonryShip `folder` | Content folder; the assets go in `<folder>/<mesh name>`. |

Stones are instances of a few shared meshes, with `stone`, `wall`, `course`, `role` (0 stretcher, 1 header, 2 bat, 3 closer, 4 filler, 5 voussoir, 6 keystone, 7 lintel, 8 sill, 9 jamb, 10 column, 11 step, 12 band, 13 slab, 14 rubble, 15 paving), `face`, `region`, `random`, `variant`, `size`, `height`, `age`, `damage`, `wet`, `moss` and `loose` attributes for geometry nodes to filter or shade by. The graph is a normal geometry-nodes group: add nodes after **Masonry Wall** or **Masonry Building**. **Masonry Ruin** and **Masonry Age** do the same to any instances, and **Masonry Links** makes destruction links between any touching stones.
