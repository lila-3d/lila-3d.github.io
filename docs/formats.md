# File formats

Which formats Lila reads and writes, and what to pick for each job.

## Get it working

**File > Open**, **Import** and **Export** pick the format from the file extension. Open on anything but a Lila scene starts a new untitled scene with the file imported into it.

| Format | Extensions | Open / Import | Export |
| --- | --- | --- | --- |
| Lila scene | `.lila`, `.lilaa` | Yes | Save |
| FBX | `.fbx` | Yes | Yes |
| glTF 2.0 | `.gltf`, `.glb` | Yes | Yes |
| USD | `.usd`, `.usda`, `.usdc`, `.usdz` | Yes, as a live stage | Yes |
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

Lila saves its own `.lila` scenes rather than USD, because USD stores a scene's result and not the modifiers, rigs and node graphs that build it. It hosts USD as live stages instead, the way Maya and Houdini do ([FAQ](faq.md#why-does-lila-save-lila-instead-of-usd)).

### USD stages

**File > Open** or **Import** on a USD file makes a live stage, a `usdStage` node holding the composed stage. Nothing is flattened: variants, payloads, references and sublayers stay live, and your edits are written as overs to an edit layer. The source files are never changed.

- **Edits that are written:** moving objects, including animation, hiding them, deleting them (the prim is deactivated), editing meshes, assigning and editing materials, adding new objects under the stage, switching variants and loading or unloading payloads.
- **The edit layer** is saved inside the `.lila` by default. Set the stage's **Edit layer** to a `.usda` file to share it, or to one of the stage's own sublayers to edit that file directly.
- **To hand edits to Houdini or Maya**, run `usdStageWriteShot` with a path. It writes a small `.usda` that layers your edits over the source, ready to open or sublayer.
- **Reload** (`usdStageReload`) reads the source files again and keeps your edits. A scene also reloads its stages on open when their source files have changed.
- **Any prim's properties**, custom schemas included, show in the Attribute Editor when you select its object. Editing one writes an over. Scripts use `usdStagePrim` and `usdStageSetProperty`.
- **Changes made by other tools or scripts** to the stage's layers show up as they happen, on the prims they touch, without a reload.
- **To flatten instead**, run `importUsd`, which converts the stage into plain Lila objects.

## Troubleshooting

**A USD stage edit isn't written.** Joint, skin weight and blend shape edits, and moving an object to a different parent, have no override Lila writes yet. The stage lists them as warnings when it saves. Renaming an object keeps it linked to its prim.

**Modifiers or deformers on a stage's mesh are baked when it saves.** A layer holds only the result. To keep the modifier stack, run `usdStageExtract` on the object first. That turns it into a plain Lila object and deactivates its prim.

**A glTF or USD import lists skipped items.** Lights come in as empty transforms, because Lila has no lights. The import report lists everything that didn't come across and why.

**An edit written to a sublayer doesn't show.** With the Edit layer set to one of the stage's sublayers, the source file's own opinions are stronger than that sublayer's, so they win wherever both set the same property. The stage warns when it saves. Use an edit layer of its own (empty, or a separate `.usda`) for edits that must win.

**A USD opens with the wrong variant, or without its payloads.** Select the stage and switch them in the Attribute Editor, or with `usdStageVariant` and `usdStageLoad`.

**A USD export arrives in Unreal 5 rotated.** Keep the export's up axis on Z (the default). Unreal 5 reads Y-up USD files with +X forward.

**A glTF model from elsewhere has inverted-looking normal map lighting.** glTF normal maps are green-up. Lila marks them **OpenGL** on import; check that the material's normal format didn't get changed.

**An STL or PLY comes in 10x, 100x or 1000x the wrong size.** Neither format stores units. Lila reads STL as millimetres and PLY as metres; set `unit` on the import to match the file.

**An STL or PLY comes in lying on its side.** Lila reads both as Z up. Set `upAxis` to `y` on the import.

**A PLY point cloud has no surface.** Lila has no point cloud type, so a PLY without faces comes in as a mesh of loose points. Its colors, normals and extra values (`quality`, `intensity`) are kept on the points.

**Unlit glTF materials look different.** Lila has no unlit model, so they import as emissive.

## Options

Each format's options are on its import and export commands (`importGltf`, `exportGltf`, `usdStageOpen`, `importUsd`, `exportUsd`, `importFbx`, `exportFbx`, `importStl`, `exportStl`, `importPly`, `exportPly`). See the [Python API](python/lila.ops.md) for every flag. The ones worth knowing:

| Command | Option | What it does |
| --- | --- | --- |
| `exportGltf` | `draco` | Draco-compresses the meshes. Much smaller files; slightly lossy positions. |
| `exportGltf` | `embedImages` | Puts the textures inside the file. On by default for `.glb`. |
| `exportUsd` | `splitLayers` | Writes geometry, materials and animation as separate layers under one root file. |
| `exportUsd` | `textures` | `relative`, `absolute` or `copy` texture paths. `.usdz` always packages them. |
| `exportUsd` / `exportFbx` | `takes` | Several takes in one file. USD writes them as a `take` variant set. |
| `usdStageOpen` | `editLayer` | Where the stage's edits go: empty (inside the `.lila`), a `.usda` path, or one of its sublayers. |
| `usdStageOpen` / `importUsd` | `variants` | Variant selections, as `{"set": "variant"}` or per prim path. |
| `usdStageOpen` / `importUsd` | `loadPayloads` | Off opens the file without its payloads. |
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
