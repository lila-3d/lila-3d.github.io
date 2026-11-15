# Compositing passes

Write depth, normals, motion and Cryptomatte mattes beside the rendered picture in one multilayer EXR, for grading and compositing in Resolve, Nuke or Fusion.

## Get it working

1. Render to an `.exr` with the passes you want:

```python
render(path="shot010.exr", camera="shotCam", passes="all")
renderSequence(path="renders/shot010.####.exr", passes="depth,cryptoObject")
```

2. Open the EXR in your compositor. The picture is in R, G, B, A; each pass is a layer:

| Layer | Holds |
| --- | --- |
| `depth.Z` | Distance from the camera along its view, cm; 10000000000 where nothing was drawn. |
| `N.X`, `N.Y`, `N.Z` | World-space normals. |
| `motion.X`, `motion.Y` | How far each pixel moved since the previous frame, in pixels (x right, y up). Camera movement only. |
| `CryptoObject00`, `01` | Cryptomatte by object name. |
| `CryptoMaterial00`, `01` | Cryptomatte by material name. |

**Nuke:** a Read node of the EXR, then a **Cryptomatte** node; pick the layer CryptoObject or CryptoMaterial and click objects in the viewer to add them to the matte.

**Fusion (also inside Resolve):** a **Cryptomatte** tool after the Loader, the same way. The manifest travels in the EXR, so names show without extra files.

## Troubleshooting

**The passes are missing.** They are only written to `.exr`; a PNG or video gets the picture only, and the log says so.

**Matte edges are rough.** Cryptomatte coverage comes from up to 16 samples a pixel; render at a larger size for smoother edges.

**Motion vectors are zero on moving objects.** The motion pass holds the camera's movement only. For object motion blur, turn on **Motion blur** in Render Output instead.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `passes` | none | Comma separated: `depth`, `normal`, `motion`, `cryptoObject`, `cryptoMaterial`, or `all`. |
