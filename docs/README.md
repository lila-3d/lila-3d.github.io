# Lila Docs

Lila has no public build yet. These pages cover what's built so far. [Back to the Lila site](https://lila-3d.github.io/ ':ignore')

## Start here

- [System requirements](requirements.md): what Lila needs to run.
- [Essentials](essentials.md): what everyone should know on day one, especially coming from Maya.
- [FAQ](faq.md) and [Support](support.md): answers, help and bug reports.

## Modeling and scenes

- [Curves](curves.md): draw curves and turn them into meshes, text included.
- [Topology](topology.md): retopologize by hand.
- [Duplicate and instance](duplicate.md): shared meshes, repeated transforms and live arrays.
- [Node editor](node-editor.md): keys and gestures for geometry nodes and the texture graph.
- [Attributes and arrays](attributes.md): custom attributes on any node.
- [Scene origin](scene-origin.md): move the scene's origin for big worlds.
- [Lights](lights.md): placing and exporting lights.

## Animation and simulation

- [Animation](animation.md): posing heavy characters, and the stand-ins that keep it fast.
- [Destruction](destruction.md): break meshes apart, simulate the fall, bake it for Unreal.

## World building

- [Masonry](masonry.md): brick and stone walls along any line or loop.
- [Settlement](settlement.md): villages, towns and cities on any ground.
- [Stagehand](stagehand.md): set dressing with physics.

## Pipeline

- [File formats](formats.md): what Lila reads and writes, and what to pick for each job.
- [Performance](performance.md): timed against Maya on the same machine and files.
- [Change stream](change-stream.md): scene changes as JSON to your own process.

## Scripting and extensions

- [Python API](python/): every command, plus `lila.nodes`, `lila.math`, `lila.ui` and more.
- [Threads and big meshes](python-threads.md): millions of points through numpy on every core.
- [Debug drawing](debug-drawing.md): draw lines, shapes and text in the viewport from code.
- [C++ extensions](cpp-extensions.md): build against the SDK.
- [File translators](file-translators.md): add any file format in Python or C++.
