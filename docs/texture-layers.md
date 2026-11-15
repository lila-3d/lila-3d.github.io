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
3. Fine-tune the numbers under **Projection**: position, rotation and size are in the mesh's object space.

| Mode | Use it for |
| --- | --- |
| Planar | Decals, labels, anything seen from one side. **Follow** carries it over edges that turn away. |
| Triplanar | Tiling materials on any shape: three planar projections blended by the surface's facing (**Sharpness**). |
| Spherical, Cylindrical | Round props: barrels, pipes, domes. |
| Warp | Planar with its four corners pulled, to bend content onto a curved panel. |

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

## Troubleshooting

**A projection shows the content stretched or flat.** The texture set has no position and normal maps to project with. Set its bake project (**Baking**) so the mesh maps exist.

**The projection lands in the wrong place.** Position, rotation and size are in the mesh's object space, not world space; **Place on Mesh** sets them from a click.

**A text layer shows nothing.** The font has no glyphs for those letters, or the box sits away from the mesh. The stack lists a warning for the first; **Place on Mesh** fixes the second.

**"is inside a folder; flatten the folder".** Flatten and merge work on the stack's top level. Flatten the folder holding the layer instead.

**Flatten warns about UDIM tiles.** Only the first tile is baked; the others keep showing the layers below.

**A map is left out.** Its name has no channel word; the command lists it in the warnings. Rename it (Rock_Roughness.png) and run it again.
