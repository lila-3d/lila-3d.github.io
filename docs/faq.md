# FAQ

## General

### Which platforms does Lila run on?

64-bit Windows 10 and 11. See [System requirements](requirements.md).

- **Linux** is planned. It needs only a small port, and Linux GPU drivers support everything Lila uses, including hardware ray tracing.
- **macOS** is harder. It has no native Vulkan, so Lila would run on Metal through MoltenVK. MoltenVK has no hardware ray tracing, so bakes would still run on the GPU, through Lila's software tracer, just slower than on a ray-tracing card.

The source opens at release, so macOS and Linux users can build it themselves.

### Can I try it?

Not yet. There's no public build. Follow [@Vaei00 on X](https://x.com/Vaei00) for the first release.

### What does Lila cost?

Nothing. Lila is free.

### Does Lila open Maya scenes?

Yes. It opens `.mb` and `.ma` files and converts them to Lila scenes, without Maya installed.

### Can I use Lila for film?

Yes, for modeling, UVs, sculpting, texturing, rigging and animation. Lila has no lighting or offline rendering, so final frames come from your existing renderer. Hand work over as USD, Alembic, FBX or OBJ, including animated meshes whose topology changes, and textures as EXR, TIFF, PNG or TGA.

### Which formats can Lila export?

- **FBX:** meshes, skeletons, skin weights, morph targets and animation, with a UE5 axis profile.
- **USD:** as files, or as live stages edited through a layer (see [File formats](formats.md#usd-stages)).
- **glTF and GLB**
- **OBJ**, **STL** and **PLY**
- **Alembic** (`.abc`, Ogawa): animated meshes, including changing topology.
- **Textures and bakes:** PNG, EXR, TGA or TIFF. Bakes can also write PSD.
- **For Unreal:** mesh sequences for Niagara flipbooks, vertex animation textures (including changing topology and rigid pieces for destruction), ML Deformer training data, and pose drivers as JSON.
- **LilaLink** sends meshes, textures and splines straight into a running Unreal editor, with no files in between.

## Technical

### Why does Lila save `.lila` instead of USD?

Because a `.lila` file saves how a scene is built, and USD stores the result. A Lila scene is a live graph: modifier stacks, generators, rigs, deformers, constraints and node graphs. Saving it as USD would bake all of that down, or wrap it in custom schemas that only Lila can evaluate. Houdini and Maya would see unknown prims, so the file would still really be Lila's own format.

Maya (`.ma`/`.mb`) and Houdini (`.hip`) take the same route: a native scene format that hosts USD stages. Lila opens a USD file as a live stage, never flattened. Your edits go to a layer as overs, and Houdini or Maya pick that layer up. See [USD stages](formats.md#usd-stages).


### Which renderer does Lila use?

Its own, on Vulkan 1.3.

- It requires dynamic rendering and timeline semaphores.
- It uses descriptor indexing (bindless textures and virtual texturing) and ray query (hardware ray-traced bakes) when the GPU supports them, and falls back without them.
- Shaders are written in Slang and compiled to SPIR-V.
- The UI is Qt. The viewport is a native window that Vulkan presents into directly.

### Does Lila support Hydra?

Not yet. Lila draws USD stages with its own renderer, so Hydra isn't needed to see or edit them. Hydra support is planned for later, for the things Lila can't draw itself: Hydra procedurals and prim types Lila has no equivalent for.

### Which physics engine does Lila use?

Jolt 5.6.

- Cross-platform determinism is on, so a simulation gives the same result on every machine. Jolt puts the cost at a few percent.
- It uses every CPU core but one.
- The simulation cache saves Jolt's state every frame, which adds cost in large scenes.

Benchmarks are coming.

### Can I write extensions in C++, and do they keep working after updates?

Yes. Extensions can be C++ or Python, and they register into the same places Lila's own features do.

A C++ extension is built against an SDK version, `major.minor`, and Lila checks it before loading:

- **Minor releases** only add to the SDK, so an extension built for 1.0 keeps working on any 1.x.
- **Major releases** can change it, so extensions need rebuilding. They'll be rare.
- An extension that needs a newer SDK than your Lila, or a different major version, isn't loaded, and Lila says which version it was built for.

C++ types cross the boundary, so build with MSVC, as Lila is.
