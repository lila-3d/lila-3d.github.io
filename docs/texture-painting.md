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

## Troubleshooting

**The stroke paints nothing with a stencil on.** The stencil is dark (or transparent) under the stroke, or it was moved off screen. Turn on **Tile** or hold **S** and drag it back.

**"its stencil needs the view it was painted in" in the log.** The stroke was scripted with dabs in surface space and no view. Give it screen `points` and a `view`.

**Colour mode looks washed out.** 8-bit images are read as sRGB and painted as linear colour; EXR and HDR files are taken as linear already.

## Options

| Option | What it does |
| --- | --- |
| Invert | Paints where the picture is dark instead. |
| Tile | Repeats the picture past its edges. |
