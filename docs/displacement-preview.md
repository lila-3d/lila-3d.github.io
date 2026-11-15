# Displacement preview

Displacement preview subdivides a mesh in the viewport and moves it by its texture set's height channel, so painted height shows as real relief and silhouettes, updating as you paint.

## Get it working

1. Give the mesh's material a texture set with a `height` channel (the standard channels include it), and show materials in the viewport.
2. Select the mesh and choose **Texture > Displacement Preview**.
3. Paint or fill height: the surface rises above 0.5 and sinks below it.

```python
displacementPreview("rock", enable=True)
```

How far height 0 to 1 moves the surface is the set's **Height Depth** (cm), the same value its normals from height use.

## Troubleshooting

**Nothing moves.** Run `displacementPreview("rock")`: its `status` says why. Common answers:

- `materials hidden`: turn on textured display (**Display > Textured**).
- `no height channel`: add a `height` channel to the set.
- `height not evaluated as whole images`: the set is paged (large sets show through virtual texturing). Lower the tile sizes, or turn virtual texturing off: `lila.prefs.set("general", "/texture/virtualTexturing", "off")`.

**Cracks along UV seams.** Each side of a seam reads its own texels, so a height that differs across the seam opens a gap. Paint across the seam in 3D so both sides match.

**The viewport slows down when close.** Subdivision follows the mesh's size on screen. Raise the detail value (pixels per edge) to subdivide less: `displacementPreview("rock", detail=12)`.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `enable` | | Turns the preview on or off for the named meshes (the selection when none are named). Undoable, saved with the scene as the mesh's **Displacement Preview** attribute. |
| `detail` | `6` | Target edge length in screen pixels. Smaller subdivides more, up to six levels or about four million triangles per mesh. |

> **Note:** Displacement preview changes only what the viewport draws. Selection, snapping, bakes and exports use the mesh as modelled.
