# Point clouds

Open LiDAR and laser scans of hundreds of millions of points (LAS, LAZ, E57), see them in colour at any distance, cut them with clip boxes, snap to them, and send cleaned-up parts on as meshes, LAS files or to Unreal.

## Get it working

To try it with a real georeferenced scan, open **Asiago Drone Survey** under **Examples** on the Welcome screen: an 11 MB download of a drone survey of a forest near Asiago, Italy: 2 million points over 220 × 130 m at their UTM coordinates (F. Pirotti, CC BY 4.0).

1. **File > Import...** a `.las`, `.laz` or `.e57` file, or run `importPointCloud("D:/scans/site.laz")`.
2. The first import sorts the points into a cache, `site.lilapc` beside the scan (about 100 seconds for 100 million points). Later imports of the same scan reuse it and open at once.
3. The cloud appears placed by its CRS ([Large worlds](large-worlds.md)), and streams in finer detail as you get closer.

```python
importPointCloud("D:/scans/site.laz")
pointCloudClipBox("site")          # a box around the middle half; move, turn and scale it
pointCloudExtract("site", spacing=5)  # the points inside as a mesh, one per 5 cm cube
```

## Clip boxes

`pointCloudClipBox` adds a box and selects it. **clipMode** on the cloud keeps the points inside the boxes (**inside**) or cuts them away (**outside**); list more boxes by name in **clipBoxes**. Turning a box's **enabled** off stops it cutting.

## Snapping

Click a cloud's points to select it; a marquee selects it when its centre is inside. With vertex snapping on (hold **V**), moved vertices, objects and curve points snap to the cloud's points, so you can trace walls or place props on a scan.

## Getting points out

- `pointCloudExtract(cloud, spacing=5)` makes a mesh of loose points with their colours in `colorSet`, cut by the clip boxes.
- `exportPointCloud("clean.laz", cloud, spacing=2)` writes LAS or LAZ at the scene's real coordinates, with its CRS in the file. In a scene with no georeference it writes metres, Z up.
- `unrealSendPointCloud(cloud, spacing=2)` writes the points in the Unreal level's coordinates and shows them on a LidarPointCloudActor. Enable Unreal's LiDAR Point Cloud plugin first.

## Troubleshooting

**The cloud imports at the origin.** The file names no CRS: the log says "No CRS in the file". Put the scanner's `.prj` beside it, then `importPointCloud(path, rebuild=True)`.

**Holes or gaps up close.** The point budget ran out before the nearest detail. Raise **pointBudget**, or **pointSize** for points that cover more.

**Points don't show in a capture or render at first.** They wait for the cache to load; a slow disk takes a few seconds. A cache on a network drive is slow everywhere: pass `cache=` a local path.

**"is not a Lila point cloud cache (or an older one)".** The cache is from another version or was cut short. Import again with `rebuild=True`.

## Options

| Attribute | Default | What it does |
| --- | --- | --- |
| **pointSize** | 2 | Size of a point, device pixels. |
| **colorMode** | rgb | **rgb**, **intensity**, **elevation** (a ramp over the cloud's height), **classification** (LAS class colours) or **single** (**color**). A scan without colours shows intensity. |
| **pointBudget** | 8 | Most points drawn, in millions. |
| **detail** | 1 | Below 1 draws coarser and faster; above 1 finer, up to the budget. |
| **clipBoxes** | | `pointCloudClip` nodes, by name, separated by spaces. |
| **clipMode** | inside | **off**, **inside** or **outside**. |
| **eyeDomeLighting** | 0.3 | Darkens points where their neighbours are nearer, so a scan without normals reads as surfaces. 0 turns it off; up to 4. |
