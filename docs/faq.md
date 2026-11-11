# FAQ

## General

### Which platforms does Lila run on?

64-bit Windows 10 and 11. See [System requirements](requirements.md).

- **Linux** is planned. Linux GPU drivers support everything Lila uses, including hardware ray tracing.
- **macOS** has no native Vulkan, so Lila would run on Metal through MoltenVK, which has no hardware ray tracing: bakes would run on Lila's GPU software tracer, slower than on a ray-tracing card.

The source opens at release, so macOS and Linux users can build it themselves.

### Can I try it?

Not yet. Follow [@Vaei00 on X](https://x.com/Vaei00) for the first release.

### What does Lila cost?

Nothing. To support development, use [GitHub Sponsors](https://github.com/sponsors/Vaei) or [Ko-fi](https://ko-fi.com/jaredtaylor).

### Does Lila use AI?

Only when you ask it to.

- **Your work stays on your machine.** Lila never uploads your scenes, assets or files, and has no setting that would.
- **Nothing trains on your work.** Lila collects no data to train on. If you choose to train auto-pose on your own mocap, the trained model is yours and stays with you.
- **No generated meshes.** Lila has no text-to-3D or image-to-3D. Its MCP server lets an AI assistant drive Lila's own tools, such as geometry nodes and material nodes, the way a script does. Whatever that assistant sees goes to the provider you chose.

### Was Lila built with AI?

Yes, as a coding assistant. Lila's creator designed its architecture, tools and workflows, and every feature was tested and reworked by hand. AI made a tool of this scope possible for one person. More in [AI position](ai.md).

### Does Lila open Maya scenes?

Yes. It opens `.mb` and `.ma` files and converts them to Lila scenes, without Maya installed.

### When are preferences saved?

Right away. Every change to preferences, hotkeys, marking menus, shelves and layouts is written to disk within a fraction of a second, so a crash loses nothing. Maya saves them when it quits, and loses them when it crashes.

The files are plain JSON in `%APPDATA%/Lila/prefs`. Edit one in a text editor while Lila runs and the change applies live: hotkeys rebind and menus rebuild. A workspace can override any of them in its own `.lila` folder, so a project can share hotkeys or settings through source control. A studio can serve and lock them for everyone from a network folder; see [Studio setup](studio-setup.md).

### Can I use Lila for film?

Yes, for modeling, UVs, sculpting, texturing, rigging and animation. Lila has no lighting or offline rendering, so final frames come from your existing renderer. Hand work over as USD, Alembic, FBX or OBJ, including animated meshes whose topology changes, and textures as EXR, TIFF, PNG or TGA.

### Which formats can Lila export?

- **FBX:** meshes, skeletons, skin weights, morph targets and animation, with a UE5 axis profile.
- **USD:** as files, or as live stages edited through a layer (see [File formats](formats.md#usd-stages)).
- **glTF and GLB**
- **OBJ**, **STL** and **PLY**
- **DXF** and **SVG:** curves for CAD, laser cutting and CNC. DXF also carries meshes.
- **Alembic** (`.abc`, Ogawa): animated meshes, including changing topology.
- **Textures and bakes:** PNG, EXR, TGA or TIFF. Bakes can also write PSD.
- **For Unreal:** mesh sequences for Niagara flipbooks, vertex animation textures (including changing topology and rigid pieces for destruction), ML Deformer training data, and pose drivers as JSON.
- **LilaLink** sends meshes, textures and splines straight into a running Unreal editor, with no files in between.

## License

The full text is in [LICENSE](https://github.com/lila-3d/Lila/blob/main/LICENSE).

### Can I fork Lila?

Yes, to read, build and change it for yourself or inside your studio, contractors included. You can't publish builds, modified versions or forks, or host Lila for others: point people to the official download. Extensions built against the SDK aren't forks, so you can share or sell them under any terms.

### Do you take pull requests?

No pull requests, patches or outside code. Lila's code has one owner, which keeps its license and IP simple for the studios that use it.

### How do I get a fix or feature in?

Ask for it with **Help > Request a Feature** (see [Support](support.md)). A diff that shows the idea is welcome as a pointer, and I'll write the change.

### What if Lila stops being developed?

If 24 months pass with no official release, the source of the last release also becomes Apache 2.0, and anyone can fork and distribute it.

## Technical

### Why does Lila save `.lila` instead of USD?

Because a `.lila` file saves how a scene is built, and USD stores the result. A Lila scene is a live graph: modifier stacks, generators, rigs, deformers, constraints and node graphs. Saving it as USD would bake all of that down, or wrap it in custom schemas that Houdini and Maya see as unknown prims, so the file would still be Lila's own format.

Maya (`.ma`/`.mb`) and Houdini (`.hip`) take the same route: a native scene format that hosts USD stages. Lila opens a USD file as a live stage, never flattened. Your edits go to a layer as overs, and Houdini or Maya pick that layer up. See [USD stages](formats.md#usd-stages).

### Which renderer does Lila use?

Its own, on Vulkan 1.3.

- It requires dynamic rendering and timeline semaphores.
- It uses descriptor indexing (bindless textures and virtual texturing) and ray query (hardware ray-traced bakes) when the GPU supports them, and falls back without them.
- Shaders are written in Slang and compiled to SPIR-V.
- The UI is Qt. The viewport is a native window that Vulkan presents into directly.

### Does Lila support Hydra?

Yes, as a viewport renderer. Any Hydra render delegate, Storm or your own engine's, can draw a viewport while Lila keeps its gizmos and selection on top, and it sees both Lila's objects and live USD stages. See [Viewport renderers and Hydra](viewport-renderers.md).

### Is Lila built on a dependency graph?

Yes, like Maya: nodes, typed attributes, connections, and dirty propagation, so only what changed recomputes. Construction history, rigs, deformers and procedural setups all live in it. Two things work differently from Maya:

- **One evaluator, parallel by default.** Maya has the serial DG plus the Evaluation Manager, with modes to pick and a fallback when a node isn't safe for parallel. Lila has one evaluator: it walks the graph in dependency order and computes independent nodes across cores. There's nothing to switch on.
- **No cycles.** A connection that would make a loop is refused when you make it, so evaluation order is always defined.

### How does undo work?

Every command, tool drag and selection change is one undo step. Selection steps don't mark the scene as unsaved. **Windows > Editors > Scene > Undo History** lists the steps; click one to jump there.

Undo is unlimited by default, within a 2 GB memory budget: past that, the oldest steps drop. A mesh shared by several steps counts once. Change the budget, or set a step limit instead, in **Preferences > General > Undo**. Opening or creating a scene clears the history.

In a script, group edits into one step with `with`; the step closes even if the script fails:

```python
with lila.undo_chunk("Build arm"):
    ...
```

It also works as a decorator: `@lila.undo_chunk("Build arm")`. If a script opens a chunk with `undoInfo(openChunk=True)` and never closes it, Lila closes it when the script ends and logs a warning.

### Which physics engine does Lila use?

Jolt 5.6.

- Cross-platform determinism is on, so a simulation gives the same result on every machine. Jolt puts the cost at a few percent.
- It uses every CPU core but one.
- The simulation cache saves Jolt's state every frame, which adds cost in large scenes.

### Can I write extensions in C++, and do they keep working after updates?

Yes. Extensions can be C++ or Python, and they register into the same places Lila's own features do.

A C++ extension is built against an SDK version, `major.minor`, and Lila checks it before loading:

- **Minor releases** only add to the SDK, so an extension built for 1.0 keeps working on any 1.x.
- **Major releases** can change it, so extensions need rebuilding. They'll be rare.
- An extension that needs a newer SDK than your Lila, or a different major version, isn't loaded, and Lila says which version it was built for.

C++ types cross the boundary, so build with MSVC, as Lila is.

### Can scripts use threads?

Yes. Meshes come out as numpy arrays (`Node.points_array()`) that any thread can read, and numpy releases the GIL, so worker threads from `threading` or `concurrent.futures` run on every core. `lila.run_in_background` runs a job with progress and Cancel and calls you back on the main thread. Scene commands stay on the main thread. See [Threads and big meshes](python-threads.md).
