# Lila scenes in Godot

A `.lila` file in your Godot 4 project that works as a scene, and updates each time you save it in Lila.

This is a small example importer for the community to build on, not a supported plugin. Lila's only official engine plugin is LilaLink for Unreal. To write one from scratch, follow the [tutorial](godot-plugin-tutorial.md).

## Get it working

1. Copy the `addons/lila_scene` folder from `resources/engines/godot` in Lila's install folder (or from [the Lila repository](https://github.com/lila-3d/Lila/tree/main/resources/engines/godot)) into your project's `addons` folder.
2. In Godot, open **Project > Project Settings > Plugins** and enable **Lila**.
3. In Lila, save a scene somewhere in the Godot project, for example `res://models/crate.lila`.
4. Switch to Godot. `crate.lila` appears in the FileSystem dock as a scene. Drag it into a 3D scene.
5. Change the scene in Lila and save. Switch back to Godot: it re-imports the file and every instance updates.

The importer runs `lilabatch`, which is installed beside `lila`, to export the scene as glTF, then loads that with Godot's glTF loader:

```
lilabatch --quiet --export crate.lila crate.glb
```

**No script:** in Lila, choose **File > Export on Save...** and set **File** to `crate.glb`. Every save then writes the glTF, and Godot imports it like any other ([File formats](formats.md#export-on-every-save)).

## Send and Sync

- **Send to Godot:** copy `godot_link.py` from `resources/engines/godot` into `%APPDATA%\Lila\extensions`, run `loadExtension("godot_link", autoload=True)` in Lila's script editor and restart Lila. Choose **File > Connect to Godot...**, pick the Godot project, then **File > Send to Godot** writes each selected object to `res://lila/<name>.glb`.
- **Sync:** turn on **Preferences > General > Change Stream** in Lila, then **Lila Sync** in Godot's toolbar. Objects in scenes from `res://lila/` and `.lila` files move as you move them in Lila.

The [tutorial](godot-plugin-tutorial.md) explains how both work.

## Troubleshooting

**"Lila: lilabatch wasn't found."** Lila isn't in its default install folder. Set the path to `lilabatch.exe` in **Editor > Editor Settings > Lila > Batch Path**, then right-click the file in the FileSystem dock and choose **Reimport**.

**"Lila: lilabatch couldn't export".** The lines under the error in the Output panel are Lila's log, and its `[error]` lines say why. Run the command above in a terminal to try it outside Godot.

**The file doesn't update after a save.** Godot looks for changed files when its window gets focus. Click the Godot window.

**Godot freezes while a scene imports.** The export runs on the editor's main thread, and an animated scene is evaluated at every frame of its playback range. Shorten the range in Lila, or turn animation off (see Build on it).

**Lila Sync turns itself off and the Output panel says "can't reach Lila".** The change stream is off in Lila, or on a port other than 8742: set `port` in `lila_sync.gd` to match.

**Materials look different from Lila.** They arrive as glTF metallic-roughness materials with their textures inside the imported scene.

## Options

`lilabatch` is the first of these that exists:

| Where | Value |
| --- | --- |
| **Editor > Editor Settings > Lila > Batch Path** | Full path to `lilabatch.exe` |
| `LILA_BATCH` environment variable | Full path to `lilabatch.exe` |
| Default install folders | `%LOCALAPPDATA%\Programs\Lila`, `%ProgramFiles%\Lila` |
| `PATH` | The folder that holds `lilabatch.exe` |

## Build on it

Everything is in `addons/lila_scene/lila_scene_import.gd`, about 150 lines.

- **Export settings:** add `"--export-args", "animation=False, draco=True"` to the `OS.execute` arguments in `_import`. The [exportGltf](python/lila.ops.md) reference lists them all.
- **Per-file options:** return entries from `_get_import_options` and read them in `_import`. They show in Godot's Import dock.
- **Collision:** in `_import`, call `create_trimesh_collision()` or `create_convex_collision()` on the `MeshInstance3D` nodes you choose, for example by name.
- **LODs:** call `generate_lods` on each `ImporterMesh` before `_to_mesh_instances` turns it into a mesh.
- **Your own materials:** in `_to_mesh_instances`, set `surface_set_material` from a material in your project whose name matches.
- **Many scenes at once:** the export blocks the editor. Run `lilabatch` on a thread, or return `true` from `_can_import_threaded` and read the path setting before the import starts.
