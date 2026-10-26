# Settlement

Villages, towns and cities laid out inside an outline, on flat ground or any mesh: main roads routed over the ground, streets grown, gridded or ringed by style, blocks, lots and a building envelope on each lot.

## Get it working

1. **Create > Settlement** with nothing selected lays out a 400 m medieval town. With a mesh selected, its loose-edge loop is the outline, open loose-edge lines are streets kept as drawn, and loose points are the centre (the first point) and attractors main roads run to (a bridge, a harbour, a gate).
2. Change **profile** on the modifier: `hamlet`, `streetVillage`, `medievalTown`, `usTown`, `manhattan`, `europeanCity`, `modernCity`, `scifiMegacity`.
3. Drag **growth** to watch it grow, change **seed** for another town on the same site.

```python
town = settlementCreate(outline=[[-30000, -25000], [35000, -20000], [30000, 30000], [-28000, 25000]],
                        attractors=[[0, 0], [33000, 0]], ground="Terrain", profile="medievalTown")
settlementInfo(town["mesh"])["checks"]   # {"components": 1, "crossings": 0, ..., "ok": True}
```

<!-- TODO image: a medieval town on a hillside, streets converging on the market square (images/settlement/town.png) -->

Points are `[x, z]` or `[x, y, z]` in cm. **ground** is any mesh, read in world space; keep the settlement mesh at the origin.

Buildings are not modelled here. Each lot gets an envelope: the footprint, floors, height and roof a building may fill, drawn as a box. Unreal PCG, Masonry or library assets build the actual buildings from it. `settlementExport(path=...)` writes streets, lots and envelopes as JSON for any of them.

## Troubleshooting

**"the settlement outline has no area".** The outline loop crosses itself or has fewer than three points.

**Streets stop short on hills.** Streets refuse grades over the profile's **maxGrade** and turn across the slope instead. Raise it in **overrides**: `{"maxGrade": 0.2}`.

**`checks.components` above 1.** Some streets do not join the rest, usually streets you drew that end before reaching another. Extend them, or let **growth** fill in.

**Few or no buildings.** Lots smaller than the profile's **minLot**, or with no street frontage, stay open ground. Lower **lotScale** or **minLot**, or raise **growth**.

**Slow on a big ground mesh.** The ground is sampled once per evaluation at about 2 m. Use a lower-resolution copy of the ground while laying out.

## Tune it

| Input | What it does |
| --- | --- |
| pattern | Override the profile's pattern: `organic`, `grid`, `radial`, `linear`, `organicGrid` (an organic core inside a ring road, a grid beyond). |
| overrides | JSON object of profile fields, such as `{"maxFloors": 6, "gridAngle": 30}`. `settlementProfiles()` lists every field of every profile. |
| heightScale, widthScale, lotScale | Multiply floors, street widths and lot sizes. |
| showStreets, showLots, showBuildings | What the modifier shows. All three stay available on the node's own outputs. |

Streets carry face attributes `street` and `class` (0 arterial, 1 collector, 2 local, 3 alley); lot outlines an edge attribute `lot`; envelopes face attributes `lot`, `use` (0 residential, 1 commercial, 2 civic), `floors` and `part` (0 wall, 1 roof, 2 floor). `settlementInfo` also returns street metrics comparable with real cities: orientation entropy and order, intersections, dead-end ratio and block sizes.
