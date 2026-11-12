# Large worlds and georeferencing

Work at real map coordinates, from a drone scan at UTM easting 500 000 to a city block 3000 km from the origin, with no jitter, and send it to Unreal so it lands on the right spot of the globe.

## Get it working

1. Import a georeferenced file: **File > Import...** a photogrammetry OBJ, PLY or FBX with its `.prj` or offset file beside it, a LAS, LAZ or E57 scan ([Point clouds](point-clouds.md)) or an IFC model. The first one sets the scene's georeference; the log says which CRS and origin.
2. Or set it yourself: **Windows > Scene Settings**, type an EPSG code (or part of a name, such as `UTM zone 33N`) in **CRS**, then the origin's **Easting** and **Northing**, or its **Latitude** and **Longitude**.
3. Fly around with the Drone Camera. Geometry far from the origin draws as steadily as geometry at it.

```python
setGeoreference(crs="EPSG:32633", llh=(42.0, 15.0, 30.0))
georeferenceConvert(points=[[0, 0, 0]], to="geographic")  # the scene origin's latitude, longitude, height
```

The scene's geometry stays near the origin; the georeference only says where that origin is on the Earth, so nothing moves when you set or change it. In a Y-up scene +X is north and +Z east; in a Z-up scene +X is east and +Y north. Both land in Unreal as X east, Y south, which is what Unreal's georeferencing and Cesium expect.

## Send it to Unreal

Placing objects in Unreal's level (**Send to Unreal** with level placement, `unrealPlaceInstances`) sets the level's georeference first, so everything lands on its real latitude and longitude. Enable GeoReferencing, Cesium for Unreal, or both, in the Unreal project; the Unreal log says which were set. `unrealSetGeoreference()` does it on its own.

- **GeoReferencing alone** lays the level on the CRS's grid (a flat planet), exactly as Lila's scene is laid out.
- **With Cesium** the level sits on the globe's tangent plane at the origin. Lila moves placements, lights and point clouds onto it, so they line up with Cesium's tiles; GeoReferencing is set to a round planet to agree.

FBX, glTF and USD exports carry the georeference too: FBX as `LilaGeoreference*` scene info properties, glTF in `asset.extras.lilaGeoreference`, USD as a `CesiumGeoreferencePrim` with the WGS 84 origin plus `lilaGeoreference` in the layer's custom data. Imported into another georeferenced scene, they land where they were; a USD with only a Cesium georeference prim sets the scene on the UTM zone around it. Pass `georeference=False` to keep the file's coordinates as they are.

## Georeferenced imports

| File | What Lila reads |
| --- | --- |
| DJI Terra, ContextCapture | `metadata.xml` in the folder (or the one above): `SRS` and `SRSOrigin`. An `ENU:lat,lon` frame goes into the UTM zone around it. |
| Pix4D | `<name>_offset.xyz` (or `offset.xyz`) and the `.prj`. |
| RealityScan | `<name>.rcinfo` from a shifted project output, and the `.prj`. |
| Metashape, RealityScan project output | A `.prj` and absolute coordinates: the mesh is rebased on its rounded centre, which becomes its origin. |
| IFC | `IfcMapConversion` and its `IfcProjectedCRS`. |
| LAS, LAZ, E57 | The CRS in the file, else a `.prj` beside it. |

When the scene already has a georeference, the file is moved (and turned, across CRSs) into it instead. Turn this off with `georeference=False` on `importObj`, `importPly`, `importFbx`, `importIfc` or `importPointCloud`.

## Cursor and selection coordinates

Turn on **Georeference** in the viewport's HUD menu for the cursor's and the selected object's easting, northing and height, and their latitude and longitude. **Ground** instead of **Cursor** means the cursor is over empty space and the reading is on the ground plane.

## IFC

`importIfc("site.ifc")` brings each building element in as a mesh with its colours in the `ifcColor` set, the project, site, building, storeys and spaces as groups, and every property set value as an attribute named `<set>_<property>` (such as `Pset_WallCommon_FireRating`), with `ifcType` and `ifcGlobalId`.

## CAD

The CadImport extension reads STEP, IGES and BREP through OpenCascade: **File > Import...** or `importCad("gearbox.step")`. The assembly tree comes in as groups with the file's names, one material per colour, millimetres converted to cm, normals sharp across the model's face edges. Import the same file again to update its parts where they are; parts the file no longer has are listed in the log and left alone.

| Option | Default | What it does |
| --- | --- | --- |
| **Chordal Tolerance** | 0.05 cm | How far triangles may stray from the surface. |
| **Angular Tolerance** | 20° | Most angle between neighbouring normals within a face. |
| **Relative Chordal** | off | Chordal tolerance as a fraction of each edge's length. |
| **Update Earlier Import** | on | Re-import into the parts made last time. |

## Troubleshooting

**"PROJ doesn't know the CRS".** The code or WKT is misspelled, or the CRS isn't in PROJ's EPSG database. Search for it in **Scene Settings**.

**Geometry shakes or snaps far from the origin.** **Preferences > Viewport > Camera-relative beyond 1 km** is off; turn it back on.

**"not a projected CRS".** A latitude/longitude CRS such as EPSG:4326 can't lay out a scene in centimetres. Use the UTM zone or national grid for the site.

**A scan imports at the origin, not on the map.** No CRS was found: the log says "No CRS" or "not georeferenced". Put the tool's `.prj` beside the file and import again.

**The model lands a few metres off in Unreal.** The Unreal level kept an older origin. Run `unrealSetGeoreference()` and check that only one GeoReferencingSystem or CesiumGeoreference actor is in the level.

**The georeference changes when I import.** Only the first georeferenced import sets it. To start over, choose **Clear Georeference** in the **Scene Settings** overflow menu, or run `setGeoreference(clear=True)`.
