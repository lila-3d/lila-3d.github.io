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
- **USD**
- **glTF and GLB**
- **OBJ**
- **Alembic** (`.abc`, Ogawa): animated meshes, including changing topology.
- **Textures and bakes:** PNG, EXR, TGA or TIFF. Bakes can also write PSD.
- **For Unreal:** mesh sequences for Niagara flipbooks, vertex animation textures (including changing topology and rigid pieces for destruction), ML Deformer training data, and pose drivers as JSON.
- **LilaLink** sends meshes, textures and splines straight into a running Unreal editor, with no files in between.

STL and PLY will come if people ask for them.

## Technical

### Which renderer does Lila use?

Its own, on Vulkan 1.3.

- It requires dynamic rendering and timeline semaphores.
- It uses descriptor indexing (bindless textures and virtual texturing) and ray query (hardware ray-traced bakes) when the GPU supports them, and falls back without them.
- Shaders are written in Slang and compiled to SPIR-V.
- The UI is Qt. The viewport is a native window that Vulkan presents into directly.

### Which physics engine does Lila use?

Jolt 5.6.

- Cross-platform determinism is on, so a simulation gives the same result on every machine. Jolt puts the cost at a few percent.
- It uses every CPU core but one.
- The simulation cache saves Jolt's state every frame, which adds cost in large scenes.

Benchmarks are coming.
