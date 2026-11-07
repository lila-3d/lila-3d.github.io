# File formats

Which formats Lila reads and writes, and what to pick for each job.

> Need a format that isn't listed? Add it yourself, for import and export, with a [file translator](file-translators.md).

## Get it working

**File > Open**, **Import** and **Export** pick the format from the file extension. Open on anything but a Lila scene starts a new untitled scene with the file imported into it.

| Format | Extensions | Open / Import | Export |
| --- | --- | --- | --- |
| Lila scene | `.lila`, `.lilaa` | Yes | Save |
| FBX | `.fbx` | Yes | Yes |
| glTF 2.0 | `.gltf`, `.glb` | Yes | Yes |
| COLLADA | `.dae` | Yes | Yes |
| USD | `.usd`, `.usda`, `.usdc`, `.usdz` | Yes, as a live stage | Yes |
| OBJ | `.obj` | Yes | Yes |
| STL | `.stl` | Yes | Yes |
| 3MF | `.3mf` | Yes, with vertex colours | Yes, with units and vertex colours |
| PLY | `.ply` | Yes, including point clouds | Yes |
| DXF | `.dxf` | Curves and meshes | Curves and meshes |
| SVG | `.svg` | Curves | Curves |
| Maya | `.ma`, `.mb` | Yes, without Maya installed | No |
| Blender | `.blend` | Yes, without Blender installed | No |
| Alembic | `.abc` | Animated meshes | Animated meshes |
| MaterialX | `.mtlx` | Materials | Materials |
| ZBrush GoZ | `.GoZ` | Yes | Yes |

FBX, glTF and USD all carry the hierarchy, meshes with every UV and color set, material slots, skeletons, skin weights, morph targets, animation and cameras. glTF and USD also carry full PBR materials and their textures, unlit materials, and each texture's wrap and filter. Animated points in USD and Alembic files come in as a `meshCache` deformer that plays the samples back at the scene time. DXF brings each layer in as one curve and one mesh, with arcs, circles, ellipses and splines exact and blocks expanded where they are inserted. Maya files bring blendShapes in as morphs: targets stored in the file or still connected as meshes, in-betweens, painted target and base weights, keyed weights, and set driven keys as driven channels.

Blender files bring collections in as groups, collection instances as instances, and armatures, vertex groups and shape keys as joints, skins and morphs, with their keyframed animation. Materials come from the Principled BSDF, inside node groups too, and packed images are written to a `<file>.textures` folder beside the `.blend`. Mirror, Subdivision Surface, Bevel, Array, Triangulate, Solidify, Decimate and Weighted Normal modifiers come in as live Lila modifiers, and Smooth by Angle as hard edges. Files from Blender 3.6 onward open.

Which to use:

| Job | Use |
| --- | --- |
| Into Unreal | LilaLink (**Send to Unreal**), else FBX |
| Sculpting in ZBrush | **Send to ZBrush** ([ZBrush](zbrush.md)) |
| Studio pipelines, Houdini, Omniverse, Apple | USD |
| Web, Godot, Blender, Sketchfab | glTF (`.glb` for a single file) |
| Engines and tools built on Maya's COLLADA (PhyreEngine and others) | COLLADA |
| 3D printing | 3MF, or STL (see [3D printing](3d-printing.md)) |
| CAD drawings, laser cutting, CNC | DXF |
| Scans, photogrammetry, point clouds | PLY |
| CAD meshes, large worlds, anything that must stay exact | OBJ, FBX or a Lila scene |
| Niagara flipbooks, cached simulations | Mesh sequences or Alembic (`exportMeshSequence`, `exportAlembic`, `importAlembic`) |

COLLADA carries the hierarchy, meshes with their UV and color sets, material slots and simple materials, skeletons, skin weights and animation. Export writes the layout of Maya's COLLADA exporter: translate, jointOrient, rotate and scale on every node, each channel sampled every frame, so engines and tools built on Maya's `.dae` files read it.

### COLLADA animation for a game engine

Engines that take Maya's COLLADA animations (PhyreEngine games among them) want the skeleton and its animation, without meshes:

1. Import the rig from the engine's own `.dae`, or the `.fbx` or Maya file it came from.
2. Animate the joints.
3. Select the root joint and run:

```python
exportCollada("C:/game/attack.dae", kind="animation")
```

Every joint the animation keys or moves gets all its channels, constant ones too, in centimetres, Y up. Unkeyed joints get none, so the game's own face and secondary animation still drives them. Run the file through the engine's converter as you would Maya's.

Lila stores vertex positions in double precision, and OBJ, FBX and Lila scenes carry every digit, so a mesh comes back out bit for bit however far it sits from the origin. STL, glTF, USD, Alembic and PLY store positions as 32-bit floats: about 7 significant digits, which moves points by up to 0.04 mm at 1 km from the origin and 0.3 mm at 10 km.

Lila saves its own `.lila` scenes and hosts USD as live stages, the way Maya and Houdini do ([FAQ](faq.md#why-does-lila-save-lila-instead-of-usd)).

### USD stages

**File > Open** or **Import** on a USD file makes a live stage, a `usdStage` node holding the composed stage. Nothing is flattened: variants, payloads, references and sublayers stay live, and your edits are written as overs to an edit layer. The source files are never changed.

- **Edits that are written:** moving objects, including animation, hiding them, deleting them (the prim is deactivated), moving them to another parent, editing meshes, joints, skin weights and blend shapes, assigning and editing materials, adding new objects under the stage, switching variants and loading or unloading payloads. Objects inside an LOD level are written into that level's variant, and so are variants switched on prims inside a level that isn't selected; the Attribute Editor lists those per level.
- **Instances:** an edit inside an instance, or an object added under one, makes that instance non-instanceable in the edit layer, and the stage warns. Undo those edits and it is instanced again. A point instancer's instances come in as transforms: moving one moves it on the instancer, deleting one hides it (`invisibleIds`), and editing or deleting part of a copy does so in its prototype, so every instance of it changes. An object added under an instance takes that instance out of the instancer: it is hidden there and written beside it as an Xform that references its prototype, holding the new object. Once it holds only its prototype again, it goes back into the instancer.
- **Joints:** poses are written on the skeleton's SkelAnimation, not its rest transforms. A skeleton made in Lila is written as a new Skeleton, with a SkelRoot above it and its skinned meshes bound to it. An object added under a joint is written beside the skeleton, following the joint.
- **Reparenting:** an object moved to another parent is written as a prim at its new place that references the original, which is deactivated. Moving an object out of the stage deactivates its prim.
- **The edit layer** is saved inside the `.lila` by default. Set the stage's **Edit layer** to a `.usda` file to share it, or to one of the stage's own sublayers to edit that file directly.
- **More layers:** **Add Layer...** in the stage's Attribute Editor section adds a layer under your edits and over the source. Pick a new `.usda` to create one, or an existing layer. Other tools can write into it while Lila is open, and **Write Shot...** keeps it. Scripts use `usdStageAddLayer` and `usdStageRemoveLayer`.
- **To hand edits to Houdini or Maya**, run `usdStageWriteShot` with a path. It writes a small `.usda` that layers your edits over the source. Payloads you unloaded are recorded in it, and Lila opens the shot with them unloaded.
- **Reload** (`usdStageReload`) reads the source files again and keeps your edits. A scene also reloads its stages on open when their source files have changed.
- **Any prim's other properties** show in the **USD Prim** section of the Attribute Editor when you select its object. Editing one writes an over. Scripts use `usdStagePrim` and `usdStageSetProperty`, or Pixar's own API: `lila.usd.stage("kitchen")` returns the `pxr.Usd.Stage`, whose edit target is the edit layer.
- **Changes made by other tools or scripts** to the stage's layers show up as they happen, on the prims they touch, without a reload.
- **To flatten instead**, run `importUsd`, which converts the stage into plain Lila objects.
- **MaterialX materials** (OpenPBR, Standard Surface, glTF PBR, also from referenced `.mtlx` files) come in as Lila materials, preferred over a `UsdPreviewSurface` beside them. Materials you add or edit get an OpenPBR network next to their `UsdPreviewSurface` when the stage already uses MaterialX; set the stage's **MaterialX** attribute to change that.

### USD components

API schemas Lila has no feature of its own for (your studio's `HealthAPI`, `PhysicsRigidBodyAPI`) and custom attributes come in as the object's own attributes, a section per schema below the **Added** line in the **Attributes** tab, named without the `API` suffix and tagged **USD**. The object's `usdApiSchemas` attribute lists the schemas. Export and live stages write both back, so they survive a round trip.

- **Your own schemas:** put their plugin folder (with `plugInfo.json` and `generatedSchema.usda`) under `usdPlugins` in an extension's `extension.json`, or on `PXR_PLUGINPATH_NAME`, and load it at startup. Without it, the attributes still come in, with no heading.
- **Add a component in Lila:** add its attributes with the schema's names and its name to `usdApiSchemas`:

```python
addAttr("Crate", longName="usdApiSchemas", dataType="stringArray")
setAttr("Crate.usdApiSchemas", ["HealthAPI"])
addAttr("Crate", longName="health:max", attributeType="double", defaultValue=100, category="HealthAPI")
```

- **Remove one:** click the **x** on its section header in the **Attributes** tab, or run `deleteAttr("Crate", category="HealthAPI")`. Both delete its attributes and take it out of `usdApiSchemas` in one undo step. In a live stage that deletes the schema from the prim and blocks the attributes. For a single attribute, right-click its label and choose **Delete Attribute**, or use **Delete Attributes** in the Channel Box's right-click menu.
- Values go out as they are, with no axis or unit conversion. Schema attributes left at the schema's default aren't written.
- To build an **Add Component** button into the Attribute Editor, see [Attribute Editor sections](cpp-extensions.md#attribute-editor-sections).

## Troubleshooting

**A schema's attributes import with no heading.** Lila didn't find the schema's plugin. Check that the extension listing it under `usdPlugins` loads at startup, or that `PXR_PLUGINPATH_NAME` was set before Lila started.

**The import report lists "attributes Lila has no attribute type for".** Lila holds bool, int, float, 3-vector, colour, matrix, string, token and asset attributes, and arrays of numbers, 3-vectors and strings. Others, such as `float2` or `quatf`, stay in the file and are left out of Lila.

**A USD stage edit isn't written.** The stage lists these as warnings when it saves: objects added where no prim can hold them (inside an LOD level, under a joint or a point instance's copy), deleting parts of what a prim built, and meshes skinned to a skeleton with no prim in the stage. Renaming an object keeps it linked to its prim.

**Modifiers or deformers on a stage's mesh are baked when it saves.** A layer holds only the result. The object keeps its stack in Lila, and when the stage changes it is built again under the same stack. To stop writing the result, run `usdStageExtract` on the object. That turns it into a plain Lila object and deactivates its prim.

**A stage warns that an instance was made non-instanceable.** An edit landed inside an instance, which USD only allows once the instance is no longer instanced. The other instances of its prototype stay instanced.

**Houdini or Maya loads payloads that the shot left unloaded.** USD keeps payload load state per open stage, not in layers, so neither reads the state `usdStageWriteShot` records. Set it where you open the shot: in Houdini, a Configure Stage LOP's load options or the Scene Graph Tree; in Maya, the Load Payloads option when creating the stage, or Unload on the prim.

**A mesh far from the origin moves slightly after export.** STL, glTF, USD, Alembic and PLY round positions to 32-bit floats. Export as OBJ or FBX to keep them exact.

**A COLLADA animation plays on the wrong joints or bends them the wrong way in the engine.** Engines match joints by name and expect each joint's own jointOrient. Import the rig from the engine's own `.dae` (or the Maya file it came from) rather than rebuilding it, so names and jointOrients match. COLLADA import keeps the file's jointOrients and rotate orders.

**COLLADA import skips visibility channels and physics.** Lila reads translate, rotate, scale and matrix animation; visibility curves and physics scenes are listed in the import report and left out.

**A glTF or USD import lists skipped items.** The import report lists everything that didn't come across and why.

**A value isn't the one you set.** A stronger opinion wins. Select the object and click **Opinions...** in its USD Prim section, or **...** beside one property: every layer's opinion is listed strongest first, with the arc it comes through, and the one the value comes from in bold. A property whose edit is hidden shows a warning icon, and setting it logs which layer wins. Scripts use `usdStageOpinions`.

**An edit written to a sublayer doesn't show.** With the Edit layer set to one of the stage's sublayers, the source file's own opinions are stronger than that sublayer's, so they win wherever both set the same property. The stage warns when it saves. Use an edit layer of its own (empty, or a separate `.usda`) for edits that must win.

**A USD opens with the wrong variant, or without its payloads.** Select the stage and switch them in the Attribute Editor, or with `usdStageVariant` and `usdStageLoad`.

**A USD export arrives in Unreal 5 rotated.** Keep the export's up axis on Z (the default). Unreal 5 reads Y-up USD files with +X forward.

**A glTF model from elsewhere has inverted-looking normal map lighting.** glTF normal maps are green-up. Lila marks them **OpenGL** on import; check that the material's normal format didn't get changed.

**An STL or PLY comes in 10x, 100x or 1000x the wrong size.** Neither format stores units. Lila reads STL as millimetres and PLY as metres; set `unit` on the import to match the file.

**An STL or PLY comes in lying on its side.** Lila reads both as Z up. Set `upAxis` to `y` on the import.

**A PLY point cloud has no surface.** Lila has no point cloud type, so a PLY without faces comes in as a mesh of loose points. Its colors, normals and extra values (`quality`, `intensity`) are kept on the points.

**A DXF comes in the wrong size.** Lila reads the unit from the file's `$INSUNITS` and takes millimetres when the file has none. Set `unit` on `importDxf` to override it.

**Parts of a DXF are missing.** Text, dimensions, hatches and points are skipped, and so are ACIS solids and regions (`3DSOLID`, `REGION`, `BODY`), which need Autodesk's own libraries to read. Export those from the CAD program as a mesh or polyface first. The import report lists everything skipped. Paper space is skipped too; only model space comes in.

**A DXF's splines need to be straight segments.** Import with `polylines` on, and `tolerance` sets how far the segments may stray from the curve. For curves already in the scene, run `convertCurve` with `type` set to `poly`.

**Laser or CNC software won't read Lila's DXF.** Export with `version` set to `r12`, which writes every curve as a polyline.

**An unlit material exports with a warning.** glTF's unlit materials have no emissive, so Lila drops it. A texture set to **black** wrap exports as clamp to glTF and FBX, which have no black border, and mirror exports as repeat to FBX.

**A Maya blendShape weight doesn't move in Lila.** Weights driven by expressions, by several set driven keys at once (a `blendWeighted` node), or by custom attributes on a control don't convert, and the import report lists each one. Rebuild those with a pose driver or a driven channel.

**A Maya character with a blendShape after its skinCluster poses differently.** Lila applies morphs before skinning, as Unreal does, and the import warns. In Maya, move the blendShape ahead of the skinCluster in the object's List of Input Operations before importing.

**A Blender object looks unfinished, and the Validation panel flags it.** Its modifier stack has one Lila can't rebuild, usually Geometry Nodes, so the mesh stops before it. With Blender installed, import with `evaluate` set to `unsupported`: Lila runs Blender in the background and bakes those objects' finished meshes. Objects with an armature or shape keys are never baked, so they stay animatable.

**Evaluate warns that no Blender was found.** Lila looks for the newest version under `C:/Program Files/Blender Foundation`, then on `PATH`. Point `blenderPath` at `blender.exe` for any other install.

**A Blender material is flat grey or missing its textures.** Only the Principled BSDF (or a Diffuse or Emission shader) is read; procedural textures, shader math and mix shaders are approximated, and the import report names each material. Image paths that pointed outside the `.blend` must still exist where the file says; the report lists any that don't.

**Grease pencil, hair curves, metaballs or text from Blender are empty groups.** These don't convert; the import report lists each one.

**An Alembic or USD mesh stops animating partway.** A mesh whose point count or faces change over time keeps its first sample, and the import warns. Mesh caches need the same topology on every sample.

## Options

Each format's options are on its import and export commands (`importGltf`, `exportGltf`, `importCollada`, `exportCollada`, `usdStageOpen`, `importUsd`, `exportUsd`, `importFbx`, `exportFbx`, `importStl`, `exportStl`, `importPly`, `exportPly`, `importDxf`, `exportDxf`, `importMaterialX`, `exportMaterialX`, `blendImport`). See the [Python API](python/lila.ops.md) for every flag. The ones worth knowing:

| Command | Option | What it does |
| --- | --- | --- |
| `exportGltf` | `draco` | Draco-compresses the meshes. Much smaller files; slightly lossy positions. |
| `exportGltf` | `embedImages` | Puts the textures inside the file. On by default for `.glb`. |
| `exportCollada` | `kind` | `skeletal` (default) writes meshes, skins and animation, `animation` only the skeleton and its animation, `static` meshes alone. |
| `exportCollada` | `bakeTransforms` | Writes each node's transform as one matrix instead of Maya's translate, rotate and scale. |
| `exportCollada` / `importCollada` | `takes` / `fps` | Several takes go out as animation clips and come back as takes. Import samples at the file's frame rate unless `fps` is set. |
| `exportUsd` | `splitLayers` | Writes geometry, materials and animation as separate layers under one root file. |
| `exportUsd` | `textures` | `relative`, `absolute` or `copy` texture paths. `.usdz` always packages them. |
| `exportFbx` | `textures` | Writes base color, normal and emissive maps with their wrap. Off by default, since LilaLink sends textures itself. |
| `importAlembic` | `profile` | `ue5`, `ue6` or `generic`, matching the profile the file was exported with. |
| `exportUsd` / `exportFbx` | `takes` | Several takes in one file. USD writes them as a `take` variant set. |
| `exportUsd` | `materialX` | Also writes each material as a MaterialX network: `openPBR` or `standardSurface`. With `previewSurface=False`, only that network. |
| `usdStageOpen` | `editLayer` | Where the stage's edits go: empty (inside the `.lila`), a `.usda` path, or one of its sublayers. |
| `usdStageOpen` / `importUsd` | `variants` | Variant selections, as `{"set": "variant"}` or per prim path. |
| `usdStageOpen` / `importUsd` | `loadPayloads` | Off opens the file without its payloads. |
| STL and PLY commands | `unit` | `mm`, `cm`, `m` or `in`. STL defaults to `mm`, PLY to `m`. |
| STL and PLY commands | `upAxis` | `z` (default) or `y`. |
| `importStl` | `hardAngle` | Edges bent more than this many degrees are hard. Default 30. |
| `exportStl` | `colors` | Writes the current color set as per-triangle colors (binary STL only). |
| `exportStl` / `exportPly` | `binary` | Off writes ASCII. |
| `importDxf` | `polylines` | Turns every curve into straight segments within `tolerance` (cm). |
| `importDxf` | `merge` | One curve and one mesh for the whole file instead of one per layer. |
| `exportDxf` | `version` | `2000` (default) writes splines and polyface meshes; `r12` writes polylines only. |
| `exportDxf` | `splines` | Off writes curves as polylines within `tolerance`. |
| `blendImport` | `evaluate` | `off` (default), `unsupported` bakes objects whose modifiers Lila can't rebuild, `all` bakes every object with modifiers. Needs Blender installed. |
| `blendImport` | `collections` | Off puts every object at the top instead of in a group per collection. |
| `blendConvert` | | Converts a `.blend` to a `.lila` in one step. `blendInfo` lists what a file holds without importing it. |

## What reads and writes each format

Lila does not use the Autodesk FBX SDK, so no Autodesk licence terms come with it.

| Format | Import | Export |
| --- | --- | --- |
| FBX | [ufbx](https://github.com/ufbx/ufbx) parses the file; Lila builds the scene from it | Lila's own binary FBX 7.4 writer |
| OBJ | Lila's own | Lila's own |
| COLLADA | Lila's own | Lila's own |
| STL | Lila's own | Lila's own |
| PLY | Lila's own | Lila's own |
| DXF | Lila's own | Lila's own |
| GoZ | Lila's own | Lila's own |
| glTF | [cgltf](https://github.com/jkuhlmann/cgltf) parses the file, [Draco](https://github.com/google/draco) decodes compressed meshes | Lila's own writer, Draco for compressed meshes |
| USD | [OpenUSD](https://github.com/PixarAnimationStudios/OpenUSD) | OpenUSD |
| Maya | Lila's own, no Maya needed | |
| Blender | Lila's own, no Blender needed; optional evaluation by an installed Blender | |
| Alembic | [Alembic](https://github.com/alembic/alembic) | [Alembic](https://github.com/alembic/alembic) (Ogawa) |
