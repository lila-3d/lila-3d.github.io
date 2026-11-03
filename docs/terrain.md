# Terrain

Build heightfield terrain from noise, elevation data or a painted image, erode it, cut building pads and plazas into it, and send it to Unreal as a Landscape with its paint layers.

## Get it working

1. **Level > Terrain > Terrain** makes a 1 km noise terrain. Its size, resolution and shape are attributes on the terrain's modifier in the Attribute Editor.
2. **Level > Terrain > Erode Terrain** carves valleys and writes the masks `flow`, `wear`, `deposit` and `lakes`.
3. Cut a level pad for a building:

```python
terrainStampPad('Terrain', id='temple', footprint=[[-4000, -3000], [4000, -3000], [4000, 3000], [-4000, 3000]], falloff=2000)
```

4. **Level > Terrain > Send Terrain to Unreal** builds the Landscape. Each mask arrives as a paint layer, painted on the `Lila` edit layer, with a generated material that shows them.

To sculpt by hand, select the terrain and pick **Level > Terrain > Sculpt Terrain**. The keys it takes show in the view. **F** switches between sculpting after erosion, which updates at once, and before it, which previews while you drag and erodes when you let go.

Pads follow a mesh or closed curve live: `terrainStampPad('Terrain', id='house', object='HouseBase')`, then move `HouseBase` and the pad moves with it. Stamps sit after erosion, so changing erosion never cuts into them.

## Troubleshooting

**A pad is lumpy or missing.** The terrain's cells are bigger than the footprint's detail. Raise the terrain's `resolution`, or give the pad a wider `falloff`. The result's `applied` is false when the footprint misses the terrain.

**Stamps vanished after a bake.** **Bake Terrain** collapses everything into the file, stamps included. Stamp after baking, or bake before you stamp.

**Moving the terrain shifts the pads that follow objects.** Those pads are relative to where the terrain stood when they were made. Move the terrain and its pad objects together.

**Unreal shows no paint layers.** Rebuild LilaLink from Lila's `ue/LilaLink`. With your own `material=`, its Landscape Layer Sample names must match the layer names in the send's result.

**GPU erosion is unavailable.** `device='gpu'` needs Lila's renderer, so it fails in batch runs. Use `cpu` or `auto`.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `terrainStampPad(mode=)` | `flatten` | `carve` only cuts, `raise` only fills, `terraced` steps down the slope, `plinth` and `stilts` leave the ground and report `plinthDepth` and `piles`. |
| `terrainStampPad(level=)` | `mean` | Pad height from the ground under it: `min`, `max`, `median`, `object` (the source's lowest point). `height=` sets it outright. |
| `terrainStampPad(layer=)` | `Stamps` | Stamp layer; Settlement uses `City`. Stamping an `id` again replaces it. |
| `terrainStampRegion(grade=, edge=)` | `0`, `slope` | Plazas and yards: fall in percent toward `direction=`, with a `slope`, sheer `wall` or `steps` edge. |
| `masks=` | `['cityFootprint']` | Masks the stamp's coverage goes into, for materials and scatter. |
| `terrainSculpt(op=, stage=)` | `raise`, `base` | `raise`, `lower`, `smooth`, `flatten`, `noise` at points, along a path or a curve. `base` sculpts before erosion, `final` after. |
| `terrainRoute(maxGrade=)` | `10` | Cheapest path in percent grade; switchbacks appear on steep ground. `curve=True` makes a curve along it. |
| `terrainAddFeature(kind=)` | `street` | `street` holds `maxGrade` and reports bridge and tunnel spans and culverts; `canal`, `moat`, `bridge`, `culvert`, `tunnel`. |
| `terrainStampQuay(kind=)` | `quay` | `levee`, `embankment` or `seawall` along a line; `side=` is the land side. |
| `riverArea=` | `250000` | Drainage area in m2 that makes a river, for `terrainWaterInfo`, `terrainField`, `terrainBuildable`, `terrainSites` and `terrainCheck`. |
| `terrainErode(device=)` | `cpu` | `gpu` is about 20 times faster at 4K; `cpu` gives the same result on every machine. |
| `terrainSendToUnreal(layers=)` | every mask | A list of masks, or `{'mask': 'LayerName'}` to rename them. |
| `terrainSendToUnreal(material=)` | generated | Your own landscape material. Build it from `MF_LilaLandscapeLayer`, one call per layer. |

> **Note:** On a Z-up scene the terrain lies on XY and points are `[x, y]`. Terrain commands also work on rotated terrains, and the Landscape takes the rotation.
