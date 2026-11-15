# Texture painting

Paint material channels straight onto a mesh, in texture space and across UV seams, with every stroke kept so the layer can be rebuilt at any resolution.

## Get it working

1. Select a mesh and run **Texture > New Texture Set**.
2. Run **Texture > Texture Paint**. The Texture Set dock opens its Brush page.
3. Pick a tool tile, set the channel values, and drag on the mesh.

Each stroke is one undo step. **Rasterize Layer** in the brush page's **...** menu rebuilds the layer from its strokes.

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

## Troubleshooting

**Paint Along Curve paints the wrong mesh.** It paints the first mesh using the texture set's material. From Python, pass `mesh=` to pick one.

**The stroke paints nothing with a stencil on.** The stencil is dark (or transparent) under the stroke, or it was moved off screen. Turn on **Tile** or hold **S** and drag it back.

**"its stencil needs the view it was painted in" in the log.** The stroke was scripted with dabs in surface space and no view. Give it screen `points` and a `view`.

**Colour mode looks washed out.** 8-bit images are read as sRGB and painted as linear colour; EXR and HDR files are taken as linear already.

**Layer only picks nothing.** The active layer has no paint at that spot; the log says so.

**A selection masks nothing.** No layer is selected in the Texture Set dock; the log says so. Select one and draw again.

## Options

| Option | What it does |
| --- | --- |
| Invert | Paints where the picture is dark instead. |
| Tile | Repeats the picture past its edges. |
