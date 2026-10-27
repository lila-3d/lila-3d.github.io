# Writing a file translator

Add any file format to File > Open and Import, in Python or C++.

These examples reads Blender 5.0's default scene: a cube, a camera and a point light in a collection.

Lila doesn't ship a Blender importer because `.blend` can change with every Blender release.

> Recommend exporting glTF from Blender for real work ([File formats](formats.md)).

> This guide is not specific to Blender, only used as an example.

## Get it working

The full sources are in the SDK's `examples` folder: `blend_scene_py.py` (Python) and `blend_scene/` (C++) - *Load one, not both.*

**Python:** copy `blend_scene_py.py` into `%APPDATA%/Lila/extensions` and run `loadExtension("blend_scene_py")`. Compressed `.blend` files need Lila's Python 3.14, for `compression.zstd`.

**C++:** build `blend_scene/` like any [C++ extension](cpp-extensions.md) and run `loadExtension("blendScene")`. It links zstd: add `zstd` to your `vcpkg.json`.

Then **File > Open** a `.blend`. The outliner shows a `Collection` group holding `Cube`, `Camera` and `Light`.

## How it works

A translator is a command that takes the path, registered against a file extension. Import-only is enough: Open then starts a new scene and imports into it.

Python:

```python
def initialize_extension():
    extension.register_command("importBlendPy", import_blend, positional="path")
    extension.register_file_translator("blendPy", [".blend"], label="Blender scenes", import_="importBlendPy")
```

C++:

```cpp
ctx.registerCommand({.name = "importBlend", .positionalDoc = "path", .run = importBlend});
io::translators::add(ctx, {.id = "blend", .label = "Blender scenes", .extensions = {".blend"},
                           .import = {.command = "importBlend"}});
```

Pass `export_=` (Python) or `.exportSelection` (C++) as well to support **Export**.

### Reading the .blend

A `.blend` is Blender's memory written to disk, so it needs no Blender to read:

1. If it starts with the zstd magic `28 B5 2F FD`, decompress it. Blender writes several frames, so decompress as a stream.
2. A Blender 5.0 header is 17 bytes, `BLENDER17-01v0500`. Blocks follow, each with a 32-byte header: code (4 bytes, `OB`, `ME`, `SC`, `DATA`...), struct index (4), address (8), size (8), count (8).
3. The `DNA1` block describes every struct: its field names, types and sizes. Compute field offsets from it instead of hard-coding them, and the reader keeps working when Blender adds fields.
4. Pointers are addresses of other blocks. Look them up in an address-to-block map.

What the example reads:

| Blender | Where | Lila |
| --- | --- | --- |
| Collections | `Scene.master_collection`, then `Collection.children` and `.gobject` | A group per collection |
| Object | `Object.type` (1 mesh, 10 light, 11 camera), `loc`, `rot` (XYZ Euler, radians), `size` | Translate, rotate, scale |
| Mesh | `Mesh.attribute_storage`: `position`, `.corner_vert`, `UVMap`; faces from `poly_offset_indices` | `createMesh` with `uvs=` |
| Camera | `lens`, `sensor_x`, `sensor_y`, `sensor_fit`, `clipsta`, `clipend` | `focalLength`, film aperture (inches), film fit, clip planes |
| Point light | `r`, `g`, `b`, `energy` (watts), `radius` | `light(type="point", units="watts")`, `sourceRadius` |

### Converting to Lila

- **Units:** Blender is in metres, Lila in cm. Multiply positions and distances by 100.
- **Axes:** Blender is Z up. In a Z-up Lila scene its coordinates carry over unchanged. In a Y-up scene, turn them -90° on X: `(x, y, z)` becomes `(x, z, -y)`. Check `lila.math.up_axis()` (Python) or `math::upAxis()` (C++).
- **Meshes:** turn the points onto Lila's axes, and the object's matrix with them (`axes * M * axesᵀ`).
- **Cameras and lights:** both look down their local -Z in Blender and Lila, so only the world axes turn (`axes * M`).

## Troubleshooting

**"not a Blender 5.0 file".** The header isn't `BLENDER17-01v`. Blender 4.x and older use a 12-byte header and 24-byte block headers. Supporting them means branching on the header.

**"compressed .blend files need Python 3.14 or later".** `compression.zstd` is missing. Run it in Lila's Python, or save the `.blend` uncompressed (**File > Save As > Compress** off in Blender).

**A field lookup fails ("Object has no field ...").** Blender renamed or moved it. Print the struct's fields from `DNA1` to find its new name.

**Mesh comes in with no faces.** Older Blender versions keep geometry in `vdata`/`ldata` (`CustomData`) rather than `attribute_storage`.

**Two translators claim `.blend`.** Both examples are loaded. Unload one, or give one a higher `priority`.
