# Viewport renderers and Hydra

Draw Lila's viewport with another renderer, such as your engine's, through Hydra or a C++ extension. Lila keeps its wires, selection, gizmos, tools and HUD on top, so you model, lay out and animate while seeing the scene as your engine draws it.

> Each viewport picks its own renderer, so one view can show your engine while another stays on Lila's.

## Get it working: Storm

1. In a viewport's toolbar, open the **Renderer** menu and pick **Hydra: Storm**.
2. The view redraws through Pixar's Storm. Move an object or change a material and the view follows.

Every Hydra render delegate Lila finds is listed in that menu as **Hydra: \<name\>**. Lila ships Storm and Embree.

## Get it working: your engine's render delegate

Your engine draws in Lila once it has a Hydra render delegate (an `HdRenderDelegate` and its `HdRendererPlugin`), the same plugin usdview, Houdini or Maya would load.

1. Build the delegate against OpenUSD **26.08** with Python 3.14 support, release (`/MD`) with MSVC 2022, and USD's default `usd_` library prefix. That is the build Lila ships, and a delegate built against another version won't load.
2. Lay it out as USD expects, with a `plugInfo.json` naming it a renderer plugin:

```
hdMyEngine.dll
hdMyEngine/resources/plugInfo.json
```

```json
{
    "Plugins": [
        {
            "Info": {
                "Types": {
                    "HdMyEngineRendererPlugin": {
                        "bases": ["HdRendererPlugin"],
                        "displayName": "My Engine",
                        "priority": 0
                    }
                }
            },
            "LibraryPath": "../hdMyEngine.dll",
            "Name": "hdMyEngine",
            "ResourcePath": "resources",
            "Root": "..",
            "Type": "library"
        }
    ]
}
```

3. Point `PXR_PLUGINPATH_NAME` at the folder holding `hdMyEngine/`, or at `hdMyEngine/resources` as other USD apps expect (several folders are separated by `;`), and start Lila. Set it machine-wide or in the shortcut that starts Lila; Lila reads it at startup.
4. Pick **Hydra: My Engine** from a viewport's **Renderer** menu, or in a script:

```python
lila.ops.viewportRenderers()          # [{id, name, doc}, ...]
lila.ops.viewportRenderer("hydraMyEngine")
```

The id is `hydra` followed by the letters and digits of `displayName`.

### What your delegate gets

- **Lila's objects** as prims under `/Lila`, flat, with world transforms: `mesh`, `basisCurves`, `camera`, and lights as `sphereLight` (point and spot, with shaping), `distantLight`, `rectLight`, `diskLight` and `domeLight`. Units are centimetres, in the scene's up axis.
- **Meshes** with face-varying `normals`, UVs (`st`, `st1`, ...), `displayColor` and `displayOpacity`. A mesh with smooth preview on comes refined, so you never need subdivision.
- **Materials** under `/LilaMaterials` as `UsdPreviewSurface` networks: a `UsdUVTexture` per map, read through `UsdPrimvarReader_float2` from `st`. Each mesh binds its material for every purpose (`allPurpose`, `preview` and `full`).
- **Live USD stages** through UsdImaging, under a prim per stage, so everything UsdImaging produces reaches you too, including your own schemas if your delegate handles them.
- **Edits as they happen**: a moved object dirties only its transform, a deformed mesh only its points, so a drag never rebuilds the scene.

### What Lila needs back

- A **`color` AOV**, linear, premultiplied alpha, cleared to 0 where nothing is drawn so Lila's background shows through. Lila reads it with `HdRenderBuffer::Map`, so the buffer must be readable on the CPU after `Resolve`.
- A **`depth` AOV** (optional), in Hydra's usual 0 to 1 window depth. With it, Lila's wires, gizmos and grid hide behind your surfaces. Without it they draw on top and the grid is hidden.
- **Progressive delegates** report `IsConverged() == false` until done; Lila draws again every 50 ms and shows each pass.

The camera is set with `SetFreeCameraMatrices` (OpenGL clip space) at the viewport's size in device pixels. Lila passes its Vulkan `Hgi` as the `renderDriver` in the render index's drivers, for delegates that want to share it; yours may ignore it.

## Troubleshooting

**My delegate isn't in the Renderer menu.** Lila lists delegates from `plugInfo.json` files without loading them: check `PXR_PLUGINPATH_NAME` was set before Lila started, that it points at the folder holding `hdMyEngine/` (or at the `plugInfo.json` itself), and that the type lists `HdRendererPlugin` in `bases`.

**Picking it logs "Hydra: My Engine: no render delegate ... on the plugin path".** USD couldn't load the DLL. Usually it was built against another OpenUSD version or build settings, or one of its dependencies isn't found: put your engine's DLLs on `PATH` or next to `lila.exe`.

**"Hydra: My Engine: it can't run here".** Your plugin's `IsSupported` returned false. Lila passes `gpuEnabled` true and its Vulkan `Hgi` as the render driver.

**The view stays black or empty.** Lila shows the `color` AOV only. Check your delegate supports it in `GetDefaultAovDescriptor` and that `Map` returns pixels (not a GPU-only buffer).

**Objects look upside down or mirrored.** Lila flips Hydra's bottom-up rows itself; don't flip them in the delegate.

**Gizmos draw through my surfaces.** Your delegate has no `depth` AOV, or writes it in another convention than 0 (near) to 1 (far).

**Lights are missing.** Without light prims, Lila adds a light at the eye through Hydra's simple lighting, which Storm reads but most delegates don't. Add a light in Lila, or give your delegate its own default.

## Without Hydra: a C++ extension

For a renderer with no Hydra delegate, register it straight from a [C++ extension](cpp-extensions.md) with `viewportRenderers::add(ctx, {id, name, doc, open})` from `<lila/ViewportRenderers.h>`. `open(panel)` returns a `Session`; Lila calls its `render(request)` whenever the camera, size, time or scene changes. Deliver a `Frame` (colour as `rgba8`, `rgba32f` or an image on Lila's device, plus optional depth in centimetres along the view axis) through `request.deliver`, from any thread and as often as you refine. Read the scene from `request.graph` on the main thread, or follow it from another process with the [change stream](change-stream.md).

The SDK's `examples/viewport_renderer` is a complete one: a CPU rasteriser on a worker thread that delivers a quarter-size frame, then the full one.
