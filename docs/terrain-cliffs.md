# Cliffs

Turn a terrain's steep slopes into layered rock cliffs that don't stretch, and send them to Unreal as World Partition tiles that render the same in deferred and mobile forward.

<!-- capture: cliff mesh on an alpine terrain, Level Toolkit Cliffs section open -->

## Get it working

1. Select a terrain and pick **Level > Cliffs > Find Cliffs**. Slopes over 50 degrees become regions `cliff_1`, `cliff_2` and so on, largest first.
2. **Level > Cliffs > Cliff Mesh** builds a rock mesh over each region: rock layers, undercuts, ledges and noise, never bulging past where the ground was.
3. **Level > Cliffs > Send Cliffs** sends the cliffs to Unreal, one World Partition tile at a time.

The same steps from Python:

```python
terrainCliffs('Terrain', slope=50)
terrainCliffMesh('Terrain', region='all')
terrainSendCliffs('Terrain')
```

The Level Toolkit's Cliffs section has the same tools. Every command is undoable and returns stats: region facing and height, triangle counts, tiles sent and skipped.

`region:cliff_1` works in every terrain command that takes a point, path or outline, and `region_cliff_1` is a mask for material rules.

## Proud or inset

Cliff meshes default to proud: the cliff sits on the landscape with its foot sunk below ground and its top tucked under the plateau, so the landscape needs no holes. With `mode='inset'` the landscape gets holes under the cliff, and the mesh meets the ground with matching heights and normals.

## Cliff walls from a curve

**Level > Cliffs > Extrude Cliff** raises a wall along a curve, selected mesh edges or a region's outline, and stamps the terrain to match: a plateau behind, the base cut in front. Edit the curve and the wall and terrain follow.

```python
terrainCliffExtrude('Terrain', curve='RidgeLine', height=2500, profile='overhang')
```

The face looks to the right of the curve's direction; `flip=True` turns it. Profiles are `vertical`, `battered`, `overhang` and `stepped`, or draw your own in XY (X out, Y up) and pass it as `profileCurve`.

## Your own rock kit

**Level > Cliffs > Cliff Kit** fits your rock and cliff pieces along a region's foot instead of generating a mesh: each piece faces out, scales to the cliff's height and overlaps its neighbours. Floating and over-buried pieces are dropped and smaller pieces fill the gaps. With Stagehand loaded, its physics measures how far the hill behind each piece reaches into it and drops pieces past `maxPenetration` of their depth (0.8: a fifth of each piece stays proud); without it, the pieces' sample points decide and the result says so. Model kit pieces standing on their base with their face toward +Z.

```python
terrainCliffKit('Terrain', region='cliff_1', kit=['Rock_A', 'Rock_B'], saveAssembly='GraniteKit')
```

`send='hism'` sends the result as instances; `send='assembly'` sends the pieces with Nanite and one Nanite Assembly placing them all, as a single actor (UE 5.7 or later, with `r.Nanite.AllowAssemblies=1`). **Send Cliffs** sends every kit the same way (`kitAs`); sending a kit the other way replaces what was there.

## Scree, ledge plants and debris

- Ground cover presets `scree`, `ledgePlants` and `hangingRoots` follow the masks a cliff mesh writes (`cliffTalus` below the cliff, `cliffTop` above): `terrainGroundCover('Terrain', rules=['scree', 'ledgePlants', 'hangingRoots'])`.
- **Level > Cliffs > Cliff Scatter** scatters boulders, rocks and debris in tiers, each on its own grid and seeded per grid cell, so an edit only reshuffles the cells it touches.
- Every instance carries `slope` and `downhill` attributes; a ground cover rule with `faceDownhill=True` turns pieces downhill.

## Unreal

Rebuild LilaLink from Lila's `ue/LilaLink` once. Then:

- **Send Cliffs** cuts the cliffs on the World Partition grid (12800 cm cells by default, matching Unreal's grid origin). Tiles share their border vertices exactly, every LOD included, and each actor's pivot is its tile's centre, so it lands in its own cell.
- Only changed tiles are re-sent, plus any whose asset or actor Unreal lost (an editor closed without saving, a deleted actor); a lost actor is placed again without reimporting. A stopped or cancelled send carries on next time, and tiles that no longer exist are removed in Unreal.
- Tiles turn on Nanite past a triangle count. Without Nanite they get LODs and collision from the last LOD.
- `terrainSendToUnreal('Terrain', cliffs=True)` sends the landscape, then the cliffs. `extra=[...]` tiles other meshes with them, such as contact skirts and strips from Seamwork.
- Tiles get `MI_<terrain>_Cliffs`, built on `MF_LilaTerrainVolume`. Drop that function into your own rock material for triplanar rock with cavity darkening; it also outputs the cliff's Strata, Openness, UpFacing and ScatterZones masks from vertex colour.

Landscape paint layers no longer stretch on steep slopes: `MF_LilaTerrainLayer` projects from above on flats and from the sides above 35 degrees, and Lila's viewport draws them the same way. Under mobile (ES3.1) both functions use a cheaper two-projection path. Nothing reads the GBuffer, so deferred, desktop forward and mobile forward look the same.

## Troubleshooting

**A proud cliff's stats warn that part of it is hidden.** The ground still covers that share of the cliff. Raise the terrain's resolution, or use `mode='inset'`.

**`baseClearance` is negative.** That's expected: the foot is buried by that much. A positive value means the cliff floats; `terrainCheck` reports it as `floatingCliff`.

**Cliff detail is lower than asked for.** Each cliff is capped at `maxTriangles` (4 million by default), and the result warns when detail dropped to fit. Split the region or raise the cap.

**The kit send fails with a Nanite Assembly error.** Assemblies need UE 5.7 or later and `r.Nanite.AllowAssemblies=1`. Send with `send='hism'` otherwise.

**The kit is mostly small filler pieces.** The hill swallows the full-size ones: raise `maxPenetration` toward 1, or lower `sink`.

**`hlodLayer` does nothing.** The HLOD layer asset must already exist in the Unreal project.

**Gaps or cracks where a cliff meets the terrain.** `terrainCheck('Terrain')` lists `cliffCrack` gaps over `cliffTolerance`, and tiles over the triangle budget as `tileOverBudget`.

## Options

| Option | Where | What it does |
| --- | --- | --- |
| `slope`, `minArea`, `minHeight`, `mergeDistance` | Find Cliffs | Which slopes count as cliffs and when nearby patches join. |
| `detail`, `depth` | Cliff Mesh | Edges per heightfield cell; how far the surface is pushed in before rock is shaped back out. |
| `strataHeight`, `undercut`, `ledges`, `overhang`, `noise` | Cliff Mesh, Extrude Cliff | Rock layer shape. |
| `rockMap`, `rock`, `rockSize` | Cliff Mesh, Extrude Cliff | A rock height map (image or `.lilamat` height channel) displaced triplanar. |
| `blockout` | Cliff Mesh | Build from any mesh instead of a region. |
| `lowPoly` | Cliff Mesh | Add a reduced copy with baked normal and AO maps for non-Nanite targets. |
| `overlap`, `sink`, `maxPenetration`, `gap` | Cliff Kit | Spacing, how deep bases sink, how far the hill may reach into a piece, and which gaps get fillers. |
| `cellSize`, `nanite`, `naniteTriangles`, `hlodLayer` | Send Cliffs | Tile grid, Nanite threshold and HLOD layer. |

Cliff meshes carry masks in vertex colour: R rock layer, G openness (1 minus cavity), B up-facing, A scatter zones. The same values are point attributes, usable as `scatterProps(mask=...)`. A closed blockout cliff stamped with `terrainVolumeStamp(object=...)` keeps them on the split pieces.

In a terrain spec, `cliffs: true` or `cliffs: {slope, minHeight, mesh, extrude, kits}` runs after the volume step.
