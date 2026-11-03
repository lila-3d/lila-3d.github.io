# Settlement

Villages, towns and cities laid out inside an outline, on flat ground or any mesh: main roads routed over the ground, streets grown, gridded or ringed by style, blocks, lots and a building envelope on each lot.

## Get it working

1. **Level > Settlement > Settlement** with nothing selected lays out a 400 m medieval town. With a mesh selected, its loose-edge loop is the outline, open loose-edge lines are streets kept as drawn, and loose points are the centre (the first point) and attractors main roads run to (a bridge, a harbour, a gate).
2. Change **profile** on the modifier: `hamlet`, `streetVillage`, `medievalTown`, `usTown`, `manhattan`, `europeanCity`, `modernCity`, `scifiMegacity`.
3. Drag **growth** to watch it grow, change **seed** for another town on the same site.

```python
town = settlementCreate(outline=[[-30000, -25000], [35000, -20000], [30000, 30000], [-28000, 25000]],
                        attractors=[[0, 0], [33000, 0]], ground="Terrain", profile="medievalTown")
settlementInfo(town["mesh"])["checks"]   # {"components": 1, "crossings": 0, ..., "ok": True}
```

<!-- TODO image: a medieval town on a hillside, streets converging on the market square (images/settlement/town.png) -->

Points are `[x, z]` or `[x, y, z]` in cm. **ground** is any mesh, read in world space; keep the settlement mesh at the origin.

Rivers and roads from outside go in as lines: `water=[[...], ...]` with `waterWidth`, `roads=[[...], ...]`. Only main roads bridge a river; other streets stop at the bank, and no lot lies in the water. In a site mesh they are loose edges with the int edge attribute `water` (float `width`) or `road`.

### A whole map

```python
settlementSuggest(ground="Terrain", water=rivers, count=3)          # best sites, with the reasons for each
settlementRegion(ground="Terrain", water=rivers, cities=1, towns=3, villages=8)
```

`settlementRegion` puts cities on the best sites (flat, by a river but out of its flood, near confluences), towns between them and villages filling in, routes roads between neighbours, then lays out each place with its main roads continuing the regional ones. The roads and rivers land on a `Region` mesh; each place gets its own settlement mesh.

<!-- TODO image: a river valley with a city, two towns and villages joined by roads (images/settlement/region.png) -->

### Around and on a structure

Keep a monument, ruin or megastructure clear and lay only roads and paths around and onto it:

```python
town = settlementCreate(size=400000, pattern="none", blocks=False,
                        exclude=["Temple"], exclusionMargin=2000, walkable="Temple")
mesh = town["mesh"]
settlementRoute(mesh, start=[-150000, 0], end=[0, 10000, 20000], streetClass="path", profile="footpath")
settlementRoute(mesh, start=[-150000, -150000], via=[[150000, -150000]], end=[150000, 150000], profile="serviceRoad")
settlementAddStreet(mesh, points=[[-50000, 60000], [50000, 60000]], profile="avenue")
```

- **Exclusions** (`exclude=` objects or `exclusions=` polygons, later `settlementAddExclusion`) stay clear of every street, block, lot, building and route, in every pattern. A mesh counts by its footprint seen from above; a closed curve by its inside; an open curve as a corridor along it. Objects are measured when added: run it again after moving them.
- **Routes** take the cheapest way over the ground, around exclusions. A stop given with a height on the **walkable** mesh is reached across its upward faces (floors, ramps, terraces, stacked levels); the route leaves the mesh where it meets the ground nearest the way on.
- `pattern="none"` lays only what you give; `blocks=False` keeps streets and paths only; `buildings=False` keeps lots without envelopes.
- `settlementEditStreet(mesh, id=..., ...)` and `settlementDelete(mesh, ids=[...])` change and remove them by the id each edit returns. All edits undo and save with the scene.
- Cross-sections come from road profiles (`settlementRoadProfiles()`); add your own in the **edits** input under `roadProfiles`, as `{"causeway": {"base": "street", "sidewalk": 400}}`.

<!-- TODO image: service roads and a footpath winding around a giant ruin and up its ramp (images/settlement/structure.png) -->

### Shape the terrain

`settlementGrade(mesh, padMode="terraced")` stamps the settlement's ground (or `terrain=`) in its **City** stamp layer: streets as strips graded along the road, lots as building pads, squares as flat paved regions. Grading again after an edit replaces them and removes stamps of streets and lots that are gone. Paths on the walkable mesh are left alone; `terrainStamps(terrain)` lists what it made.

### Change generated streets

Every street has a stable id: the same street keeps it through re-runs and edits elsewhere. Find it, then change or remove it like your own:

```python
main = settlementStreets(mesh, near=[1200, -800], streetClass="arterial")[0]["id"]
settlementEditStreet(mesh, id=main, profile="highway")
settlementDelete(mesh, ids=[main])
```

A change whose street the layout no longer makes (after a bigger edit) shows in `settlementInfo(mesh)["checks"]["staleOverrides"]`.

### Send to Unreal

Copy `ue/LilaLinkSettlement` into the project's Plugins folder next to LilaLink and enable **Lila Link Settlement**. It brings the PCG and ZoneGraph plugins; LilaLink alone does not need them.

```python
settlementSendToUnreal(mesh, roads="landscape", pcg=True, zoneGraph=True)
```

- **roads**: `landscape` (landscape splines joined at junctions, shaping the landscape), `splines` (a spline actor; `roadMesh=` lays a mesh along it), `meshes` (ribbon meshes cut into 512 m cells) or `none`. Paths on the walkable mesh always go as a spline actor.
- **pcg** writes a PCG data asset under **folder**. Read it with **Load PCG Data Asset**: pins Lots, Envelopes (footprint polygons with `MaxHeight`, `Floors`, `Use`, `Roof`, `Style`, `Seed` on the data), EnvelopePoints (a point per building), Roads, Intersections (`control`: signal, stop or yield; phases) and ParkingSpots (along roads whose profile has parking, such as `parkedStreet`).
- **zoneGraph** adds lane profiles named `Lila_<profile>` and tags (Vehicle, Pedestrian, Parking, Intersection, Crossing, TrafficLight, StopSign) to the project's ZoneGraph settings, then a spline zone shape per road and crosswalk and a polygon per junction, and rebuilds the ZoneGraph for Mass traffic and crowds. When the project has MassTraffic, the tags its settings name for vehicle, pedestrian, intersection, crosswalk and parking lanes go on the matching shapes too; the reply's `massTraffic` lists which settings it read.

To make streets match a road kit, read its cross-section: `settlementRoadProfileFromUnreal(mesh, asset="/Game/Roads/SG_Avenue")` adds it as a road profile streets can name. `settlementRoadProfileToUnreal(profile="avenue")` writes a Lila profile as ModulesInfo and Grammar pins for PCG's Subdivide Segment.

Buildings are not modelled here. Each lot gets an envelope: the footprint, floors, height and roof a building may fill, drawn as a box. Unreal PCG, Masonry or library assets build the actual buildings from it. `settlementExport(path=...)` writes streets, lots and envelopes as JSON for any of them.

## Troubleshooting

**"the settlement outline has no area".** The outline loop crosses itself or has fewer than three points.

**Streets stop short on hills.** Streets refuse grades over the profile's **maxGrade**. Raise it in **overrides**: `{"maxGrade": 0.2}`.

**`checks.components` above 1.** Some streets do not join the rest, usually streets you drew that end before reaching another. Extend them, or let **growth** fill in.

**Few or no buildings.** Lots smaller than the profile's **minLot**, or with no street frontage, stay open ground. Lower **lotScale** or **minLot**, or raise **growth**.

**A settlement sits right at the map edge, or a tier has fewer places than asked.** Sites need room for their radius inside the outline and spacing from bigger places. Enlarge the outline, lower the counts, or lower `cityRadius`, `townRadius`, `villageRadius`.

**A route reports `ok: False`.** `settlementInfo(mesh)["paths"]` gives the reason per id: a stop outside the outline, no way over the ground (exclusions closing a gap; lower the margin), or no walkable way (the walkable mesh's pieces don't touch: gaps over 1 m or steps over **walkStep** don't join; faces steeper than **walkSlope** are walls).

**Streets still touch the structure.** The footprint is measured when the exclusion is added. Run `settlementAddExclusion` again after moving or reshaping it, and raise `margin`.

**`settlementGrade` says the terrain commands are not available.** It needs the Terrain extension loaded.

**`settlementSendToUnreal` asks for the LilaLinkSettlement plugin.** Copy `ue/LilaLinkSettlement` next to LilaLink in the project's Plugins folder and enable it.

**`settlementRoadProfileFromUnreal` lists `unknown` slots.** Their names don't say lane, median, parking, sidewalk or verge; they were counted as verge. Rename the slots, or edit the profile under `roadProfiles` in the **edits** input.

**Slow on a big ground mesh.** The ground is sampled once per evaluation at about 2 m (2.5 m on a 10 km terrain). Use a lower-resolution copy of the ground while laying out.

## Tune it

| Input | What it does |
| --- | --- |
| pattern | Override the profile's pattern: `organic`, `grid`, `radial`, `linear`, `organicGrid` (an organic core inside a ring road, a grid beyond), `none`. |
| blocks, buildings | Off: streets and paths only; lots without envelopes. |
| walkSlope, walkStep | Steepest walkable face (degrees) and the height a walk may step between separate pieces of the walkable mesh (cm). |
| overrides | JSON object of profile fields, such as `{"maxFloors": 6, "gridAngle": 30}`. `settlementProfiles()` lists every field of every profile. |
| heightScale, widthScale, lotScale | Multiply floors, street widths and lot sizes. |
| showStreets, showLots, showBuildings | What the modifier shows. All three stay available on the node's own outputs. |

Streets carry face attributes `street`, `class` (0 arterial, 1 collector, 2 local, 3 alley, 4 path) and `path` (the edit id, -1 when generated); lot outlines an edge attribute `lot`; envelopes face attributes `lot`, `use` (0 residential, 1 commercial, 2 civic), `floors` and `part` (0 wall, 1 roof, 2 floor). `settlementInfo` also returns street metrics comparable with real cities: orientation entropy and order, intersections, dead-end ratio and block sizes.
