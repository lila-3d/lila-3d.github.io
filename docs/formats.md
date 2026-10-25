# File formats

Which formats Lila reads and writes, and what to pick for each job.

## Get it working

**File > Open**, **Import** and **Export** pick the format from the file extension. Open on anything but a Lila scene starts a new untitled scene with the file imported into it.

| Format | Extensions | Open / Import | Export |
| --- | --- | --- | --- |
| Lila scene | `.lila`, `.lilaa` | Yes | Save |
| FBX | `.fbx` | Yes | Yes |
| glTF 2.0 | `.gltf`, `.glb` | Yes | Yes |
| USD | `.usd`, `.usda`, `.usdc`, `.usdz` | Yes | Yes |
| OBJ | `.obj` | Yes | Yes |
| STL | `.stl` | Yes | Yes |
| PLY | `.ply` | Yes, including point clouds | Yes |
| Maya | `.ma`, `.mb` | Yes, without Maya installed | No |
| Alembic | `.abc` | No | Animated meshes |

FBX, glTF and USD all carry the hierarchy, meshes with every UV and color set, material slots, skeletons, skin weights, morph targets, animation and cameras. glTF and USD also carry full PBR materials and their textures.

Which to use:

| Job | Use |
| --- | --- |
| Into Unreal | LilaLink (**Send to Unreal**), else FBX |
| Studio pipelines, Houdini, Omniverse, Apple | USD |
| Web, Godot, Blender, Sketchfab | glTF (`.glb` for a single file) |
| 3D printing, CAD | STL |
| Scans, photogrammetry, point clouds | PLY |
| Niagara flipbooks, cached simulations | Mesh sequences or Alembic (`exportMeshSequence`) |

## Troubleshooting

**A glTF or USD import lists skipped items.** Lights come in as empty transforms, because Lila has no lights. The import report lists everything that didn't come across and why.

**A USD imports with the wrong variant, or without its payloads.** Pick variants and payload loading in the import's options (Shift+Enter on the command in Ctrl+T search).

**A USD export arrives in Unreal 5 rotated.** Keep the export's up axis on Z (the default). Unreal 5 reads Y-up USD files with +X forward.

**A glTF model from elsewhere has inverted-looking normal map lighting.** glTF normal maps are green-up. Lila marks them **OpenGL** on import; check that the material's normal format didn't get changed.

**An STL or PLY comes in 10x, 100x or 1000x the wrong size.** Neither format stores units. Lila reads STL as millimetres and PLY as metres; set `unit` on the import to match the file.

**An STL or PLY comes in lying on its side.** Lila reads both as Z up. Set `upAxis` to `y` on the import.

**A PLY point cloud has no surface.** Lila has no point cloud type, so a PLY without faces comes in as a mesh of loose points. Its colors, normals and extra values (`quality`, `intensity`) are kept on the points.

**Unlit glTF materials look different.** Lila has no unlit model, so they import as emissive.

## Options

Each format's options are on its import and export commands (`importGltf`, `exportGltf`, `importUsd`, `exportUsd`, `importFbx`, `exportFbx`, `importStl`, `exportStl`, `importPly`, `exportPly`). See the [Python API](python/lila.ops.md) for every flag. The ones worth knowing:

| Command | Option | What it does |
| --- | --- | --- |
| `exportGltf` | `draco` | Draco-compresses the meshes. Much smaller files; slightly lossy positions. |
| `exportGltf` | `embedImages` | Puts the textures inside the file. On by default for `.glb`. |
| `exportUsd` | `splitLayers` | Writes geometry, materials and animation as separate layers under one root file. |
| `exportUsd` | `textures` | `relative`, `absolute` or `copy` texture paths. `.usdz` always packages them. |
| `exportUsd` / `exportFbx` | `takes` | Several takes in one file. USD writes them as a `take` variant set. |
| `importUsd` | `variants` | Variant selections, as `{"set": "variant"}` or per prim path. |
| `importUsd` | `loadPayloads` | Off imports the file without its payloads. |
| STL and PLY commands | `unit` | `mm`, `cm`, `m` or `in`. STL defaults to `mm`, PLY to `m`. |
| STL and PLY commands | `upAxis` | `z` (default) or `y`. |
| `importStl` | `hardAngle` | Edges bent more than this many degrees are hard. Default 30. |
| `exportStl` | `colors` | Writes the current color set as per-triangle colors (binary STL only). |
| `exportStl` / `exportPly` | `binary` | Off writes ASCII. |

## What reads and writes each format

Lila does not use the Autodesk FBX SDK, so no Autodesk licence terms come with it.

| Format | Import | Export |
| --- | --- | --- |
| FBX | [ufbx](https://github.com/ufbx/ufbx) parses the file; Lila builds the scene from it | Lila's own binary FBX 7.4 writer |
| OBJ | Lila's own | Lila's own |
| STL | Lila's own | Lila's own |
| PLY | Lila's own | Lila's own |
| glTF | [cgltf](https://github.com/jkuhlmann/cgltf) parses the file, [Draco](https://github.com/google/draco) decodes compressed meshes | Lila's own writer, Draco for compressed meshes |
| USD | [OpenUSD](https://github.com/PixarAnimationStudios/OpenUSD) | OpenUSD |
| Maya | Lila's own, no Maya needed | |
| Alembic | | [Alembic](https://github.com/alembic/alembic) (Ogawa) |
