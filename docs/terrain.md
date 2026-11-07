# Terrain

Build heightfield terrain from noise, a real place or a painting, erode it, lay roads, rivers and caves into it, paint it with material layers, and send it to Unreal, Unity or Godot.

## Get it working

1. **Level > Terrain > Terrain** makes a 1 km noise terrain. Its size, resolution and shape are attributes on the terrain's modifier in the Attribute Editor.
2. **Level > Terrain > Erode Terrain** weathers it. The modifier's `age` (0 to 1) is the one knob; `erosionPreset` picks natural, alpine, desert or hills.
3. Add water and a road:

```python
terrainAddRiver('Terrain', auto=True)
terrainSeaLevel('Terrain', level=0)
terrainAddRoad('Terrain', id='pass', path=[[-40000, 0], [40000, 5000]])
```

4. **Level > Terrain > Terrain Layers** paints grass, rock, dirt, snow and the rest from the terrain's shape; **Level > Terrain > Preview Terrain Layers** shows them in the view.
5. **Level > Terrain > Send Terrain to Unreal** builds the Landscape with its paint layers, a generated material, the road as landscape splines, rivers and lakes as spline and locator actors, and caves as meshes over holes.

Every step is undoable and returns stats you can read: grades, lake levels, layer coverage.

### Other starting points

- **A real place:** **Level > Terrain > Real Place**, or `terrainImportDem(place='Matterhorn', size=[1200000, 1200000])`. Elevation comes from Copernicus GLO-30; the attribution lands in the workspace's `terrain/ATTRIBUTION.txt`, and it ships with your game.
- **A painting:** **Level > Terrain > Import Terrain** takes a PNG, PSD, TIFF or EXR. The default reading keeps the painting's big shapes and erodes the detail in. For a colour sketch, paint red ridges, green valleys, blue rivers and yellow flat ground over grey, and import with `mode='sketch'`. **Live Link Terrain** re-runs it each time you save the painting.
- **Roads, rivers and coastline from OpenStreetMap:** **Level > Terrain > OSM Features** drapes them as curves and writes land cover masks.
- **Land cover from satellite:** `terrainImportLandCover(terrain='Terrain')` fetches ESA WorldCover (10 m) into the same land cover masks, plus a `worldcover` mask that `terrainBiomes(landcover={'mask': 'worldcover'})` follows. Its credit goes into `terrain/ATTRIBUTION.txt`.
- **A preset:** `terrainSpec(preset='alpineValley')` builds a whole terrain, water, roads and layers included. The presets are alpineValley, mesaDesert, coastalCliffs, rollingFarmland and volcanicIsland; `overrides={'seed': 3}` changes any part. `terrainSpec('Terrain')` reads a terrain back as a spec that rebuilds it.
- **Variants side by side:** `terrainWedge(preset='alpineValley', vary={'seed': [1, 2, 3, 4]})` builds each variant and writes a labelled contact sheet.

### Find places by description

`terrainQuery('Terrain', named='valleyFloor', store='valley')` finds the valley floor and keeps it as a region. Other names include `highestPeak`, `passes`, `ridges`, `flatAreas`, `cliffs` and `northSlopes`. Commands that take a point, path or outline accept `'region:valley'` in its place, so `terrainAddLake('Terrain', polygon='region:valley')` fills it.

### Sculpt

Select the terrain and pick **Level > Terrain > Sculpt Terrain**. Brushes and their settings are in the palette. Ctrl inverts, Shift smooths. Uplift strokes go before erosion, so valleys follow what you paint. For overhangs, the palette's Sculpt Region button copies a patch into mesh sculpt mode with every sculpt brush; exiting sculpt bakes it back.

### Caves and arches

```python
terrainCave('Terrain', curve='CaveLine', radius=300)
terrainTunnel('Terrain', fromRoad='pass')
```

Caves, tunnels, overhangs and arches become mesh pieces over holes in the terrain, with seams that match the ground. A road's tunnel spans are bored with `fromRoad`.

### Other engines and files

`terrainExport` writes `target='unity'` (RAW tiles, splatmaps and an importer script), `target='godot'` (Terrain3D regions and an importer script), `target='mesh'` (LOD tiles with collision as FBX, glTF or USD) or `target='files'` (EXR, 16-bit PNG and R16 tiles). **Level > Terrain > Terrain Tiles** makes the LOD tiles in the scene.

- **Unity:** put `LilaTerrainImporter.cs` in an Editor folder, then **Tools > Lila > Import Terrain...** and pick the export's json. Assign textures to the created Terrain Layers.
- **Godot:** needs Terrain3D 1.0 or later in the project. Copy the export folder into the project, open the scene, open `<name>_terrain3d.gd` and choose **File > Run**, then save the scene.
- **Unreal Mesh Terrain:** copy `ue/LilaLinkMeshTerrain` next to LilaLink, enable it, and send with `kind='meshTerrain'`. Masks arrive as Mesh Partition channels, up to 24, with material layers named after the layer (`Grass`). Material layers get a generated material built on `MF_LilaMeshTerrainChannel`, which reads a channel by the index the send returns in `channelIndices`; drop it into your own material the same way. Roads go as spline modifiers with `terrainSendRoadsToUnreal('Terrain', kind='meshTerrain', paintLayer='Gravel')`, `paintLayer` being the channel they write.

## Troubleshooting

**Unreal shows the landscape but no holes over caves.** Your own landscape material needs a Landscape Visibility Mask on Opacity Mask, with the blend mode set to Masked. Without one Unreal drops the holes entirely, collision included. The generated material has one.

**Unreal shows no paint layers.** Rebuild LilaLink from Lila's `ue/LilaLink`. With your own `material=`, its Landscape Layer Sample names must match the layer names in the send's result.

**A road warns about a tighter curve or a missed key.** The road couldn't meet a limit there, and the warning says which. Loosen `maxGrade` or the design speed, or move the path.

**A road laid before erosion still moved.** Only roads with `stage='base'` hold their ground through erosion. Lay main roads first: later roads in the same layer join earlier ones, not the other way round.

**Road meshes don't follow an edit.** **Level > Terrain > Build Road Meshes** makes a snapshot. Build again after changing the terrain or the road.

**Road props are boxes.** **Build Road Meshes** stands Set Dressing library props (Road/StreetLight, Road/Delineator and the rest) and falls back to boxes when the Set Dressing extension isn't loaded or an asset is missing; the log says which.

**Mesh Terrain is missing a layer or the cave holes.** Mesh Terrain has no holes, and takes 24 channels at most. The send's `warnings` and `leftOut` name every mask that didn't go.

**Layers or ground cover look stale.** The preview and the ground cover are snapshots. Run **Preview Terrain Layers** again after changes.

**A lake level comes back lower than you set.** Water above the basin's rim spills. The lake dams the rim, or with `dam=False` drops to the spill level; the result's `warnings` says which.

**A real place has its summit cut short.** 30 m elevation data can't hold a needle peak. Bare earth (`bareEarth=True`), which removes trees and roofs, also shaves narrow tops slightly.

**A pad is lumpy or missing.** The terrain's cells are bigger than the footprint's detail. Raise the terrain's `resolution`, or give the pad a wider `falloff`.

**Stamps vanished after a bake.** **Bake Terrain** collapses everything into the file, stamps included. Stamp after baking.

**GPU erosion is unavailable.** `device='gpu'` needs Lila's renderer, so it fails in batch runs. `auto` falls back to the CPU and logs it.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `terrainErode(preset=, age=)` | `natural`, `0.5` | Erosion recipe and how old the land looks. `terrainLandform(process=)` adds one step at a time: debris, thermal, rills, deposition, snow, terrace, strata, cliff and more. |
| `terrainAddRoad(kind=, profile=)` | `road`, `rural` | Kinds road, path, track, rail, runway. Profiles set lanes, shoulders, kerbs and ditches. `maxGrade=`, `designSpeed=`, `keys=[[x, y, z]]` pin heights. |
| `terrainAddRoundabout(at=, radius=)` | `2500` | A level ring with a raised island at `at`. Roads in the layer that reach it are cut back and join it, each with a splitter island. |
| `terrainRoadBuild(props=)` | `library` | `boxes` for plain stand-ins, or `{'pole': 'MyLib/Lamp'}` to use your own library assets. |
| `terrainRoute(road=)` | none | Routes between two points and lays the road along it in one call. |
| `terrainAddRiver(threshold=)` | `1e6` | Drainage area in m2 that makes a river with `auto=True`. `path=` or `object=` follows a drawn curve. |
| `terrainAddLake(at=)` | none | Fills that basin to its spill level; `polygon=` digs one instead. |
| `terrainSplit(minRoof=)` | `200` | Rock over a cave thinner than this opens a hole; thicker keeps the landscape on top. |
| `terrainBiomes()` | six biomes | Snow, alpine, forest, meadow, scrub and wetland from height, slope, rain and sun. |
| `terrainGroundCover(items=)` | placeholders | Maps rock, tree, grass and debris to your meshes. `sendToUnreal=True` places them as instanced meshes. |
| `terrainSendToUnreal(rvt=)` | `False` | Adds a runtime virtual texture so meshes blend into the ground. |
| `terrainSendToUnreal(material=)` | generated | Your own landscape material. Build it from `MF_LilaTerrainLayer`, one call per layer. |
| `terrainStampPad(mode=)` | `flatten` | Building pads: `carve`, `raise`, `terraced`, `plinth`, `stilts`. Pads follow a mesh or closed curve live with `object=`. |
| `terrainImportDem(source=)` | `copernicus` | `terrarium` (AWS Terrain Tiles) or `opentopography` with your own `apiKey=`. |

**Display > Terrain** shows mask overlays, contour lines and flow arrows on terrains. They draw through the heightfield draw, which stays on while any of them is on.

> **Note:** On a Z-up scene the terrain lies on XY and points are `[x, y]`. Terrain commands also work on rotated terrains, and the Landscape takes the rotation.
