# Texture painting

Paint material channels straight onto a mesh, in texture space and across UV seams, with every stroke kept so the layer can be rebuilt at any resolution.

## Get it working

1. Select a mesh and run **Texture > New Texture Set**.
2. Run **Texture > Texture Paint**. The Texture Set dock opens its Brush page.
3. Pick a tool tile, set the channel values, and drag on the mesh.

Each stroke is one undo step. **Rasterize Layer** in the brush page's **...** menu rebuilds the layer from its strokes.

A stroke can run across several meshes, even with different texture sets: each gets its part, and one undo takes the whole stroke back.

## Stencils

A stencil is a picture pinned to the screen that every stroke paints through: a mask for grunge, a decal shape or a photo colour.

1. Click the **Stencil** row in the Brush page (or **Texture > Load Stencil...**) and pick an image.
2. Hold **S** and drag to move it. Add **Shift** to rotate, **Ctrl** to scale.
3. Paint. **Mask** paints only where the picture is bright. **Colour** paints the picture's own colours into Base Color, its alpha as the amount.

The stencil is stored with each stroke, so rebuilding the layer gives the same pixels even after you move or remove the stencil.

```python
texPaintStencil("C:/textures/grunge.png", mode="mask", scale=1.5, rotation=30)
```

A scripted stroke takes the same settings under `stencil`:

```python
texPaintStroke("Crate", points=[[300, 300, 1], [500, 300, 1]], view={"camera": "persp", "width": 1920, "height": 1080},
               stencil={"image": "C:/textures/grunge.png", "mode": "color", "tile": True})
```

## Path strokes

The **Path** tool paints one clean stroke along points you place: seams, panel lines, cables.

1. Pick the **Path** tile and click points on the mesh. Drag while placing a point to curve the path through it; **Backspace** removes the last point.
2. Press **Enter** to paint it.
3. Drag any point afterwards to move the path; the stroke repaints from the new points as one undo step. Clicking away starts a new path.

**Texture > Paint Along Curve** paints along the selected scene curve instead, projected onto the mesh, with the current brush and channels. The Path tool can then edit it like any other path.

```python
texPaintPath("Crate", curve="seamCurve", radius=0.5, payload={"channels": {"baseColor": [0.1, 0.1, 0.1]}})
```

## Picking channel values

The **Picker** tile takes every channel's value from the mesh (colour, roughness, metallic, height and the rest at once), as the texture set evaluates them, not as the screen shows them under lights.

1. Pick the **Picker** tile and click the mesh, the 2D View or the UV editor. The brush takes the values and goes back to the tool you had.
2. **Shift+click** keeps the values as a swatch under **Swatches** instead. Click a swatch to paint with it; right-click removes it.
3. Turn on **Layer only** to pick the active paint layer's own paint, ignoring the layers above and below.

```python
texSampleChannels("Crate", uv=[0.25, 0.5])
texSampleChannels("Crate", mesh="crate", position=[0, 10, 0], source="layer", layer="paint1")
```

## Selections, quick mask and locked faces

**Selection** draws a mask for the layer selected in the Texture Set dock:

1. Pick the **Selection** tile and a **Shape**: lasso, polygon (click corners, **Enter** closes) or rectangle.
2. Draw on the mesh. Only what the view sees is masked, unless **Only what the view sees** is off. **Shift** adds to the mask, **Ctrl** subtracts.
3. In the UV editor, drag a lasso in uv space to mask whole triangles.

A paint layer takes the selection in its own mask; any other layer gets a paint mask named Selection.

**Quick Mask** (Limit row) limits painting without touching any layer: turn it on and paint the area, turn it off, and every later stroke and fill stays inside it. The clear button removes it.

**Groups** are named face sets saved on the texture set. Select faces, then **...** > **New Group from Selected Faces**. From there a group can mask the active layer, be filled, or be locked: with **Lock** on, strokes and fills leave its faces alone.

```python
texFaceGroup("Crate", "lid", faces=[4, 5, 6])
texSelectionMask("Crate", "L3", group="lid", mode="add")
texSelectionMask("Crate", "L3", rect=[100, 100, 400, 300], view={"camera": "persp", "width": 1920, "height": 1080})
```

## Gradients

The **Gradient** tile fills the mesh with the brush's channel values, fading out along a drag.

1. Pick **Gradient** and a type: **Linear**, **Radial**, **Reflected** or **Angle**.
2. Drag on the mesh from where it should paint fully to where it fades out. **Ctrl** reverses it. In the 2D View or UV editor the drag is in uv space.
3. **Dither** breaks up banding in long, subtle gradients.

It paints into the active paint layer, or into the quick mask while Quick Mask is on. Locked groups stay untouched. Scripts can give a full ramp of values:

```python
texPaintStroke("Crate", "L2", stroke={"mesh": "crate", "payload": {"kind": "fill", "fillBy": "mesh", "gradient": {
    "type": "linear", "space": "uv", "start": [0, 0.5], "end": [1, 0.5],
    "stops": [{"position": 0, "channels": {"roughness": 0.2}}, {"position": 1, "channels": {"roughness": 0.9}}]}}})
```

## When the mesh changes

Strokes remember where on the surface they were, so paint survives a new unwrap, a remesh or added edge loops: when the mesh's triangles or uvs change, each stroke is found again at the closest surface point and the layer repaints. Brush strokes and whole-mesh fills follow; fills of an island, polygon or selection don't, because those parts no longer exist as they were. The log counts anything left out.

To move a look onto a different mesh (an old version onto a new one, a high mesh onto its low one), select the source mesh, then the target, and run **Texture > Transfer Texture Set**. The target gets a paint layer with every channel taken from the closest point of the source.

```python
texTransferSet("Crate", source="crate_v1", onto="crate_v2")
```

## Painting in an image editor

From the **Projection** tile:

1. Click **Edit...**. What the view shows of Base Color opens in your image editor (the system's, or the one set with **...** > **Image Editor...** in the Brush page), unlit, at the buffer's resolution.
2. Paint in the editor and save. Each save projects the picture back onto the mesh from the view it was taken in, into the active paint layer.

Keep a view to project from again: click the camera button by **View** and name it. Picking it later moves the viewport there, and projections and edits use it exactly.

```python
texProjectionView("Crate", "front", view={"camera": "persp", "width": 1920, "height": 1080})
texCaptureView("Crate", view="front", file="C:/edits/front.png")
```

## Brush limits

Limits in the Brush page keep the brush where it belongs, whatever the stroke covers: tick **Cavity**, **AO** or **Height** and set the range it may paint in, pick a face group under **Only group**, or raise **Facing** to fade out surfaces turned away from the view. Cavity and AO read the set's bake project maps; height reads the set itself. Limits are saved with brush presets and with each stroke.

```python
texSaveBrushPreset("Edge Rust", payload={"channels": {"baseColor": [0.4, 0.15, 0.05]}, "limits": {"cavity": [0.6, 1.0]}})
```

## Particle brushes

With the Paint tile, **Particles** makes each dab release particles that move over the surface and paint as they go. **Drips**, **Rain** and **Sparks** run simple paths; the rest simulate on the mesh: gravity pulls them down in world space, they crawl along the surface, stick where it is too flat to slide, and pool where they stop.

| Particles | Looks like |
| --- | --- |
| Rust Run | Rust streaks pooling on ledges. |
| Leak | A wet run from each dab. |
| Rain Streaks | Thin grime washed down. |
| Dust Settle | Dust that slides off steep faces and stays on flat ones. |
| Burn | Charring clustered where you paint. |
| Scorch | Marks spreading out from a ring, fading at the tips. |

The library's Particles brushes set these up with fitting colours. The particles come from the stroke's seed, so a layer rebuilt from its strokes repaints them exactly.

## Mirroring in uv space

**UV mirror** in the Brush page mirrors every stroke in uv space as well: **U** across the left and right halves of the unwrap, **V** across top and bottom. **Per island** mirrors within each uv island instead, for parts unwrapped symmetric on their own. It works on top of **Mirror**, and on meshes that aren't symmetric in shape.

## Tiling textures

For a texture that repeats (a trim sheet, a tiling material), tick **Tileable** in the texture set's settings. Strokes that reach past an edge of the uv square come in on the opposite edge, in the 3D view and the UV editor, so the texture tiles without seams. The 2D View tiles it 3 x 3 so you see the wrap as you paint.

```python
texSetSettings("Trim", {"tileable": True})
```

## Troubleshooting

**Paint Along Curve paints the wrong mesh.** It paints the first mesh using the texture set's material. From Python, pass `mesh=` to pick one.

**The stroke paints nothing with a stencil on.** The stencil is dark (or transparent) under the stroke, or it was moved off screen. Turn on **Tile** or hold **S** and drag it back.

**"its stencil needs the view it was painted in" in the log.** The stroke was scripted with dabs in surface space and no view. Give it screen `points` and a `view`.

**Colour mode looks washed out.** 8-bit images are read as sRGB and painted as linear colour; EXR and HDR files are taken as linear already.

**Layer only picks nothing.** The active layer has no paint at that spot; the log says so.

**A selection masks nothing.** No layer is selected in the Texture Set dock; the log says so. Select one and draw again.

**"dabs found no surface on the changed mesh".** Part of the surface a stroke painted was deleted or moved further than the brush's radius. Repaint it there.

**Transfer leaves parts empty.** Those texels found no source surface within maxDistance; the log counts them. Raise maxDistance or line the meshes up first.

**A limit does nothing and the log says the map is missing.** Cavity and AO need the set's bake project to have those maps. Bake them (**Baking**) or untick the limit.

## Options

| Option | What it does |
| --- | --- |
| Invert | Paints where the picture is dark instead. |
| Tile | Repeats the picture past its edges. |
