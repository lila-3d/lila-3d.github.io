# Lila scenes in Unity

A `.lila` file in your Unity project with a model beside it that updates each time you save in Lila, the way Unity treats `.blend` files.

This is a small example script for the community to build on, not a supported plugin. Lila's only official engine plugin is LilaLink for Unreal. To write one from scratch, follow the [tutorial](unity-plugin-tutorial.md).

## Get it working

1. Copy `LilaSceneImporter.cs` from `resources/engines/unity` in Lila's install folder (or from [the Lila repository](https://github.com/lila-3d/Lila/tree/main/resources/engines/unity)) into an `Editor` folder in your project, for example `Assets/Editor`.
2. In Lila, save a scene somewhere under `Assets`, for example `Assets/Models/crate.lila`.
3. Switch to Unity. `crate.fbx` appears beside `crate.lila`. Drag the FBX into your scene.
4. Change the scene in Lila and save. Switch back to Unity: the FBX is exported again and everything that uses it updates.

The script runs `lilabatch`, which is installed beside `lila`, to export the scene as FBX, and Unity's model importer does the rest:

```
lilabatch -c "openScene('crate.lila', force=True); exportFbx('crate.fbx', selectionOnly=False, profile='ue6', units='m', textures=True, unrealCheck=False)"
```

`profile='ue6'` writes a Y-up file facing +Z, which Unity imports with no rotation on the root. `units='m'` gives a scale of 1.

## Send and Sync

- **Send to Unity:** copy `unity_link.py` from `resources/engines/unity` into `%APPDATA%\Lila\extensions`, run `loadExtension("unity_link", autoload=True)` in Lila's script editor and restart Lila. Choose **File > Connect to Unity...**, pick the Unity project, then **File > Send to Unity** writes each selected object to `Assets/Lila/<name>.fbx`.
- **Sync:** copy `LilaSync.cs` into the same `Editor` folder, turn on **Preferences > General > Change Stream** in Lila, then choose **Tools > Lila > Sync** in Unity. Objects in models from `Assets/Lila` or beside a `.lila` file move as you move them in Lila.

The [tutorial](unity-plugin-tutorial.md) explains how both work.

## Troubleshooting

**"Lila: lilabatch wasn't found".** Lila isn't in its default install folder. Choose **Tools > Lila > Set lilabatch Location...** and pick `lilabatch.exe`, then right-click the `.lila` file and choose **Reimport**.

**"Lila: lilabatch couldn't export".** The rest of the Console message is Lila's log, and its `[error]` lines say why. Run the command above in a terminal to try it outside Unity.

**The FBX doesn't update after a save.** Unity looks for changed files when its window gets focus, and only with **Preferences > Asset Pipeline > Auto Refresh** on. Click the Unity window, or press Ctrl+R.

**Unity waits on "Exporting" for a long time.** The export runs before Unity carries on, and an animated scene is evaluated at every frame of its playback range. Shorten the range in Lila, or turn animation off (see Build on it).

**"Lila: nothing on port 8742".** The change stream is off in Lila, or on another port: set `Port` in `LilaSync.cs` to match.

**The `.lila` file shows a blank icon and can't be dragged into the scene.** That's expected: use the FBX beside it.

## Options

`lilabatch` is the first of these that exists:

| Where | Value |
| --- | --- |
| **Tools > Lila > Set lilabatch Location...** | Full path to `lilabatch.exe`, kept per machine |
| `LILA_BATCH` environment variable | Full path to `lilabatch.exe` |
| Default install folders | `%LOCALAPPDATA%\Programs\Lila`, `%ProgramFiles%\Lila` |
| `PATH` | The folder that holds `lilabatch.exe` |

Rig, material and animation settings are the FBX's own, in the Inspector. They live in `crate.fbx.meta` and survive every export.

## Build on it

Everything is in `LilaSceneImporter.cs`, about 120 lines.

- **Export settings:** add flags to the `exportFbx` call in `Convert`: `animation=False`, `kind='static'`, `maxInfluences=4`. The [exportFbx](python/lila.ops.md) reference lists them all.
- **Team without Lila:** commit the FBX and its `.meta` with the scene. People without `lilabatch` get a warning and keep the committed FBX.
- **Moves and deletes:** a moved or deleted `.lila` leaves its FBX behind. Handle `movedAssets` and `deletedAssets` in `OnPostprocessAllAssets`.
- **Collision:** add an `OnPostprocessModel` method that puts a `MeshCollider` on the meshes you choose, for example by name.
- **LODs:** name meshes `crate_LOD0`, `crate_LOD1` in Lila and Unity builds the LOD Group itself.
- **Your own materials:** remap them on the FBX's **Materials** tab, or add `OnAssignMaterialModel` to pick a project material by name.
- **Long exports:** the export blocks the editor. Start `lilabatch` without waiting and import the FBX when it exits.
