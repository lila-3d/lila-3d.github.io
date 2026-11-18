# Texture layers

Build a texture set from layers in the Texture Set dock: fills, paint, materials and filters stacked bottom to top, each with its own masks.

## Get it working

1. Select a mesh and run **Texture > New Texture Set**. The Texture Set dock shows its layer stack.
2. Add a layer with the stack's **+** button, or drag a material from the library onto the stack.
3. Select the layer to edit its channels and masks below the stack.

## Projections

A fill or material layer, and a generator or paint mask, can land on the mesh by projection instead of by uvs, so seams and stretched uvs don't show.

1. Select the layer (or mask) and set **Projection > Mode**: Planar, Triplanar, Spherical, Cylindrical or Warp.
2. Click **Place on Mesh**, then click the mesh where the projection should sit. Drag to move it over the surface, **Shift**+drag turns it, **Ctrl**+drag scales it. Press **Enter** when done.
3. Fine-tune the numbers under **Projection**: position, rotation and size are in the mesh's object space, in cm.

| Mode | Use it for |
| --- | --- |
| Planar | Decals, labels, anything seen from one side. **Follow** carries it over edges that turn away. |
| Triplanar | Tiling materials on any shape: three planar projections blended by the surface's facing (**Sharpness**). |
| Spherical, Cylindrical | Round props: barrels, pipes, domes. |
| Warp | Planar with its four corners pulled, to bend content onto a curved panel. |

Projections read where the surface is from the set's bake, so the set needs a bake project with the **Position** and **Object Normal** maps baked. Without them a projection falls back to the uvs. A projection moves with the mesh it was placed on: after moving the mesh, bake again and it lands on the same part of the surface.

A fill layer's channel can be an image file instead of a value; it is read through the layer's projection.

```python
texSetLayer("Crate", "L2", {"material": {"baseColor": "textures/label.png"},
                            "projection": {"mode": "planar", "positionY": 12, "sizeX": 20, "sizeY": 10, "follow": 1}})
```

## Decals, text and scatter

Three layer kinds place pictures on the mesh. Add them from the stack's **+** menu.

- **Decal Layer**: pick a picture; it lands where you place it (**Place on Mesh**), planar and following the surface over edges. Give it more pictures per channel (height, normal, roughness) in its properties. For an atlas, set **Atlas** columns, rows and the cell to show.
- **Text Layer**: type the words, pick a font, set tracking and outline. The letters take the layer's Base Color; the text stays editable.
- **Scatter Layer**: pick a pattern (its brightness is the shape) and optionally a picture each copy shows. Set how many across and down, size, jitter and seed. **Avoid overlap** keeps one copy per cell.

Masks on the layer limit where any of them show.

```python
texAddLayer("Crate", "text", text={"text": "FRAGILE", "outline": 0.05}, material={"baseColor": [0.8, 0.1, 0.05]},
            projection={"mode": "planar", "positionY": 30, "sizeY": 8})
texAddLayer("Crate", "scatter", scatter={"pattern": "textures/leaf.png", "countX": 8, "seed": 3, "avoidOverlap": True})
```

## Copy, merge and flatten

Right-click a layer in the stack:

- **Copy Layer** and **Paste Layers** move layers (masks, children, paint and all) between texture sets and scenes through the clipboard. Pasted layers get their own copy of the paint.
- **Merge Down** bakes the layer and the one below it into one paint layer. **Flatten Layer** bakes a layer or folder, with everything under it, into one. Either way the result looks the same as before, and undo brings the layers back.
- **Export Flattened...** writes what flattening would make as images, without changing the stack.

```python
texFlattenLayers("Crate", layers=["L1", "L2", "L3"], keep=True)
texExportFlattened("Crate", "L4", folder="C:/out", format="png")
```

## Materials from maps

Turn downloaded texture maps into library materials: **Texture > Material from Maps...** for some files, **Texture > Materials from Maps Folder...** for a whole folder tree.

Each file's channel comes from its name: base colour (BaseColor, Albedo, Diff, Color), roughness (Rough, or Gloss inverted), metallic, normal (Normal, Nrm; with DX it is flipped to OpenGL), height (Height, Disp), AO, emissive, opacity, and packed maps (ORM, ARM, RMA, MRA) split into their channels. Files that differ only by that word make one material, and a size in the name (200cm, 2m) sets its real-world scale. The materials land in the library under Imported.

```python
texMaterialFromMaps(folder="C:/textures/downloads")
texMaterialFromMaps("C:/maps/Rock_BaseColor.png", "C:/maps/Rock_ORM.png", set="Crate")
```

`set=` adds them straight to a texture set as material layers instead.

## Exporting maps

**Export Maps** in the Texture Graph (or `texExport`) writes the set's channels the way an engine reads them, by the set's export preset:

| Preset | What it writes |
| --- | --- |
| `unreal` | BaseColor, Normal (DirectX), ORM (occlusion, roughness, metallic). |
| `unrealCrm` | The same with cavity in place of occlusion. |
| `unityUrp` | Base Map, Metallic Map (smoothness in alpha), Normal, Occlusion. |
| `unityHdrp` | Base Map, Mask Map (metallic, occlusion, detail mask, smoothness), Normal. |
| `gltf` | baseColor, occlusionRoughnessMetallic, normal (OpenGL), emissive. |
| `godot` | albedo, orm, normal (OpenGL), height, emission. |
| `openpbr` | One map per OpenPBR parameter: base_color, base_metalness, specular_roughness, geometry_normal. |

```python
texExport("Crate", preset="unityHdrp", folder="C:/Project/Assets/Textures")
```

## Variants

Variants are versions of one texture set, such as a clean and a worn crate or team colours, kept as setting changes on its layers rather than copies of pixels.

1. In the Texture Set panel, open the variant list beside the set (it shows **Base**) and pick **New Variant...**.
2. Change layers as usual: hide one, change a fill's colour, move an opacity, reseed a mask. While a variant shows, every such change belongs to it and the base stays as it was.
3. Switch between **Base** and the variants from the same list.
4. **Texture > Export All Variants** writes the maps once per variant. The export preset's names take a `{variant}` token (`base` for the base); a preset without one gets `_{variant}` added.

Painted pixels are shared by every variant. To give a variant different paint, put the paint on its own layer and hide it in the others.

```python
texAddVariant("Crate", "Worn")
texSetVariant("Crate", "Worn", "L4", {"enabled": True})
texExport("Crate", variants=True, folder="C:/Project/Textures")
```

## Ptex

Open the texture set, select its mesh, and pick **Texture > Export Ptex...** to write one channel as a `.ptx` file with its own texels on every face. **Texture > Import Ptex...** reads one back onto the set as a fill layer, baked through the mesh's uvs.

Both need a mesh with uvs that is all quads or all triangles (written as Ptex triangle faces), and an import needs the mesh the file was painted on.

```python
texExportPtex("Crate", mesh="|crate", file="C:/maps/crate.ptx", faceResolution=7)
texImportPtex("Crate", mesh="|crate", file="C:/maps/crate.ptx", channel="baseColor")
```

`faceResolution` is the texels per face side as a power of two: 7 is 128 x 128.

## Troubleshooting

**A projection shows the content stretched or flat.** The texture set has no position and normal maps to project with. Set its bake project (**Baking**) so the mesh maps exist.

**The projection lands in the wrong place.** Position, rotation and size are in the mesh's object space, not world space; **Place on Mesh** sets them from a click. After moving the mesh, bake again.

**A text layer shows nothing.** The font has no glyphs for those letters, or the box sits away from the mesh. The stack lists a warning for the first; **Place on Mesh** fixes the second.

**Ptex says the mesh needs to be all quads or all triangles, or that the face counts differ.** Ptex stores texels per quad or per triangle, one kind per file. A mesh mixing them, or with n-gons, can't be written: triangulate or quadrangulate it first. An import only fits the mesh the file was made for, with the same faces in the same order.

**"is inside a folder; flatten the folder".** Flatten and merge work on the stack's top level. Flatten the folder holding the layer instead.

**Flatten warns about UDIM tiles.** Only the first tile is baked; the others keep showing the layers below.

**A map is left out.** Its name has no channel word; the command lists it in the warnings. Rename it (Rock_Roughness.png) and run it again.
