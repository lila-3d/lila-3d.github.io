# Tutorial: import Lila scenes with a Unity script

Build a Unity editor script from an empty file that keeps an FBX beside each `.lila` file and exports it again each time you save in Lila, add **Send to Unity** to Lila, and turn on **Tools > Lila > Sync** to see objects move in Unity as you drag them in Lila. You end up with a smaller version of the [Unity example](unity-scenes.md), and the pattern to port to any engine.

You need Unity and Lila installed, and a Unity project open.

## 1. Export a scene from a terminal

Every engine integration comes down to one command: `lilabatch` opens the scene and exports a format the engine already reads.

1. In Lila, make a cube and save it in your Unity project as `Assets/Models/crate.lila`.
2. In a terminal in that `Models` folder, run:

```
"%LOCALAPPDATA%\Programs\Lila\lilabatch.exe" --quiet --export crate.lila crate.fbx --export-args "profile='unity', units='m', textures=True"
```

`crate.fbx` appears beside `crate.lila`, and Unity imports it when you switch back. `--export` picks FBX from the extension, and `--export-args` passes flags to `exportFbx`: `profile='unity'` writes Y up facing +Z, which Unity imports with no rotation on the root, and `units='m'` gives a scale of 1. Delete the FBX: the script makes its own from now on.

## 2. Notice .lila files

Create `Assets/Editor/MyLilaImporter.cs`. Unity calls `OnPostprocessAllAssets` after every import, with the paths it imported, including a `.lila` saved from Lila:

```csharp
#if UNITY_EDITOR
using System;
using System.Diagnostics;
using System.IO;
using UnityEditor;
using Debug = UnityEngine.Debug;

public class MyLilaImporter : AssetPostprocessor
{
    static void OnPostprocessAllAssets(string[] imported, string[] deleted, string[] moved, string[] movedFrom)
    {
        foreach (string asset in imported)
        {
            string ext = Path.GetExtension(asset).ToLowerInvariant();
            if (ext == ".lila" || ext == ".lilaa")
                Debug.Log("Lila scene: " + asset);
        }
    }
}
#endif
```

Save `crate.lila` in Lila again and click the Unity window. The Console shows `Lila scene: Assets/Models/crate.lila`.

## 3. Export with lilabatch

Add `Convert` to the class and call it in place of `Debug.Log`. It runs the command from step 1, writing to Unity's `Temp` folder so a half-written file never reaches `Assets`:

```csharp
    static void Convert(string asset)
    {
        string scene = Path.GetFullPath(asset);
        string temp = Path.Combine(Path.GetFullPath("Temp"), "Lila", Guid.NewGuid().ToString("N") + ".fbx");
        Directory.CreateDirectory(Path.GetDirectoryName(temp));

        string batch = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "Lila", "lilabatch.exe");

        var info = new ProcessStartInfo
        {
            FileName = batch,
            Arguments = "--quiet --export \"" + scene + "\" \"" + temp + "\" --export-args \"profile='unity', units='m', textures=True\"",
            UseShellExecute = false,
            CreateNoWindow = true,
            RedirectStandardError = true,
        };
        info.EnvironmentVariables["LILA_CRASH_NO_UI"] = "1";

        using (var process = Process.Start(info))
        {
            string log = process.StandardError.ReadToEnd();
            process.WaitForExit();
            if (process.ExitCode != 0 || !File.Exists(temp))
            {
                Debug.LogError("Lila: lilabatch couldn't export " + asset + "\n" + log);
                return;
            }
        }

        ImportFbx(asset, temp);
    }
```

The paths are quoted for spaces. `LILA_CRASH_NO_UI` stops a crash from opening a dialog that nobody sees. Lila writes its errors to standard error, so a failed export says why.

## 4. Hand the FBX to Unity

Add the last method. It puts the FBX beside the scene and tells Unity to import it:

```csharp
    static void ImportFbx(string asset, string temp)
    {
        string fbxAsset = Path.ChangeExtension(asset, ".fbx");
        File.Copy(temp, Path.GetFullPath(fbxAsset), true);
        File.Delete(temp);
        AssetDatabase.ImportAsset(fbxAsset);
    }
```

The FBX keeps its `.meta`, so rig, material and animation settings you make in the Inspector survive every export.

## 5. Try it

1. Click the Unity window. `crate.fbx` appears beside `crate.lila`. Drag it into your scene.
2. In Lila, scale the cube and save. Click the Unity window: the crate updates.

## 6. Add Send to Unity in Lila

Sending puts chosen objects into the project without saving a scene there. It's a Lila extension: one Python file that adds **File > Send to Unity** and **File > Connect to Unity...** under the Unreal rows. Unity imports the FBX it writes on its own, so the script doesn't change.

1. Save this as `unity_link.py` in `%APPDATA%\Lila\extensions`:

```python
import os

import lila
from lila import extension, prefs
from lila.ops import exportFbx, ls

PROJECT_PREF = "/unityLink/project"


def unity_connect(project=""):
    if not os.path.isdir(os.path.join(project, "Assets")) or not os.path.isdir(os.path.join(project, "ProjectSettings")):
        raise lila.CommandError(f"{project} isn't a Unity project: it needs Assets and ProjectSettings folders")
    prefs.set("general", PROJECT_PREF, project)
    return project


def unity_send():
    project = prefs.get("general", PROJECT_PREF, "")
    if not project:
        raise lila.CommandError("choose the Unity project first: File > Connect to Unity")
    objects = ls(selection=True)
    if not objects:
        raise lila.CommandError("select the objects to send")
    folder = os.path.join(project, "Assets", "Lila")
    os.makedirs(folder, exist_ok=True)
    sent = []
    for obj in objects:
        path = os.path.join(folder, obj.split("|")[-1] + ".fbx")
        # The unity profile is Y up facing +Z, which Unity imports with no rotation on the root.
        exportFbx(path, obj, profile="unity", units="m", textures=True, unrealCheck=False)
        sent.append(path)
    return sent


def _pick_project():
    from PySide6 import QtWidgets

    from lila import ui

    folder = QtWidgets.QFileDialog.getExistingDirectory(ui.main_window(), "Unity project", prefs.get("general", PROJECT_PREF, ""))
    if folder:
        unity_connect(project=folder)


def initialize_extension():
    extension.register_command("unityConnect", unity_connect, "Choose the Unity project that Send to Unity writes into.",
                               flags=[("project", str, "", "Folder holding Assets and ProjectSettings.")])
    extension.register_command("unitySend", unity_send, "Export each selected object to <project>/Assets/Lila/<name>.fbx.", undoable=False)

    from lila import ui

    try:
        ui.add_action("unity.send", lambda: unity_send(), "Send to Unity", category="Unity",
                      doc="Export the selected objects into the Unity project chosen with Connect to Unity.")
        ui.add_action("unity.connect", _pick_project, "Connect to Unity...", category="Unity", doc="Choose the Unity project to send to.")
        section = ui.add_menu_item("File", kind="section", label="Unity", after="File/unreal.connect")
        send = ui.add_menu_item("File", action="unity.send", after=section)
        ui.add_menu_item("File", action="unity.connect", after=send)
    except RuntimeError:
        pass  # lilabatch has no menus
```

2. In Lila's script editor, run `loadExtension("unity_link", autoload=True)`. It loads now and at every start.
3. Restart Lila so the rows take their place in the **File** menu.
4. Choose **File > Connect to Unity...** and pick the project folder, the one holding `Assets`.
5. Select an object, for example `barrel`, and choose **File > Send to Unity**. Click the Unity window: `Assets/Lila/barrel.fbx` appears. Drag it into your scene.

Each send overwrites the FBX, and Unity updates everything that uses it. Registering commands as well as menu rows means scripts can call `unitySend()` too.

## 7. Sync: follow moves live

Saving and sending update meshes. To see objects move while you drag them in Lila, an editor script reads Lila's [change stream](change-stream.md): one JSON line per change over a local socket.

1. Create `Assets/Editor/LilaSync.cs`. A background thread reads the lines and the editor's update loop applies them:

```csharp
#if UNITY_EDITOR
using System;
using System.Collections.Concurrent;
using System.IO;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

// Tools > Lila > Sync: moves the objects inside every model from Lila (sent to Assets/Lila, or beside a .lila file)
// as they move in Lila.
public static class LilaSync
{
    const string MenuPath = "Tools/Lila/Sync";
    public static int Port = 8742;

    // Filled by JsonUtility.
#pragma warning disable 0649
    [Serializable] class Message { public string type; public Node[] nodes; public Change[] changes; }
    [Serializable] class Node { public string path; public float[] world; }
    [Serializable] class Change { public string kind; public string path; public float[] matrix; }
#pragma warning restore 0649

    static TcpClient client;
    static Thread reader;
    static readonly ConcurrentQueue<string> lines = new ConcurrentQueue<string>();

    [MenuItem(MenuPath)]
    static void Toggle()
    {
        if (client == null)
            Start();
        else
            Stop();
        Menu.SetChecked(MenuPath, client != null);
    }

    public static void Start()
    {
        try
        {
            client = new TcpClient("127.0.0.1", Port);
        }
        catch (SocketException)
        {
            Debug.LogWarning("Lila: nothing on port " + Port + ". Turn on Preferences > General > Change Stream in Lila.");
            client = null;
            return;
        }
        Send("{\"op\":\"subscribe\",\"snapshot\":true,\"world\":true,\"live\":true,\"types\":[\"transform\"]}");
        var stream = new StreamReader(client.GetStream(), Encoding.UTF8);
        reader = new Thread(() =>
        {
            try
            {
                string line;
                while ((line = stream.ReadLine()) != null)
                    lines.Enqueue(line);
            }
            catch (IOException) { }
            catch (ObjectDisposedException) { }
        }) { IsBackground = true };
        reader.Start();
        EditorApplication.update += Update;
    }

    public static void Stop()
    {
        EditorApplication.update -= Update;
        client?.Close();
        client = null;
    }

    static void Send(string json)
    {
        byte[] bytes = Encoding.UTF8.GetBytes(json + "\n");
        client.GetStream().Write(bytes, 0, bytes.Length);
    }

    // Applies everything that arrived since the last editor update, on the main thread.
    public static void Update()
    {
        while (lines.TryDequeue(out string line))
        {
            var message = JsonUtility.FromJson<Message>(line);
            if (message.type == "resync")
                Send("{\"op\":\"snapshot\"}");
            if (message.nodes != null)
                foreach (Node node in message.nodes)
                    Move(node.path, node.world);
            if (message.changes != null)
                foreach (Change change in message.changes)
                    if (change.kind == "world")
                        Move(change.path, change.matrix);
        }
    }

    static bool FromLila(string asset)
    {
        return asset.StartsWith("Assets/Lila/") || File.Exists(Path.ChangeExtension(asset, ".lila")) || File.Exists(Path.ChangeExtension(asset, ".lilaa"));
    }

    static void Move(string path, float[] m)
    {
        if (m == null || m.Length != 16)
            return;
        string name = path.Substring(path.LastIndexOf('|') + 1);
        foreach (GameObject root in UnityEngine.Object.FindObjectsByType<GameObject>(FindObjectsInactive.Include))
        {
            if (!PrefabUtility.IsOutermostPrefabInstanceRoot(root))
                continue;
            if (!FromLila(PrefabUtility.GetPrefabAssetPathOfNearestInstanceRoot(root)))
                continue;
            foreach (Transform t in root.GetComponentsInChildren<Transform>(true))
            {
                if (t.name != name)
                    continue;
                // Lila is right-handed Y up in centimetres; Unity mirrors X and works in metres, as its FBX importer does.
                var x = new Vector3(m[0], -m[1], -m[2]);
                var y = new Vector3(-m[4], m[5], m[6]);
                var z = new Vector3(-m[8], m[9], m[10]);
                t.position = new Vector3(-m[12], m[13], m[14]) / 100f;
                t.rotation = Quaternion.LookRotation(z, y);
                t.localScale = new Vector3(x.magnitude, y.magnitude, z.magnitude);
                EditorSceneManager.MarkSceneDirty(t.gameObject.scene);
            }
        }
    }
}
#endif
```

Lila is right-handed and Unity left-handed, so `Move` mirrors X the way Unity's FBX importer does, and turns centimetres into metres. World matrices are absolute, so the newest one for each object is all that matters: no ordering or undo bookkeeping. The `snapshot` puts everything in place the moment you connect.

2. In Lila, turn on **Preferences > General > Change Stream**.
3. In Unity, choose **Tools > Lila > Sync**. The barrel jumps to where it is in Lila.
4. Drag the barrel in Lila. It moves in Unity as you drag.

Sync places objects where they are in Lila, wherever you dropped them in Unity. Save the Unity scene to keep the positions.

## Troubleshooting

**`Win32Exception: The system cannot find the file specified`.** Unity couldn't start `lilabatch`. Lila isn't in its default install folder: put the full path in `batch`.

**"Lila: lilabatch couldn't export".** The rest of the Console message is Lila's errors. Run the command from step 1 in a terminal to try it outside Unity.

**Nothing updates after a save or a send.** Unity looks for changed files when its window gets focus, and only with **Preferences > Asset Pipeline > Auto Refresh** on. Click the Unity window, or press Ctrl+R.

**The script never runs.** It has to be under a folder named `Editor`.

**Send to Unity isn't in the File menu.** `loadExtension` reported an error in the script editor, or the file isn't in an extension folder: `listExtensions(searchPaths=True)` lists them. Loaded without a restart, the rows sit at the end of the **File** menu.

**"Lila: nothing on port 8742".** The change stream is off, or on another port. Turn it on in Lila's **Preferences > General > Change Stream**, and match `Port` in `LilaSync.cs` to the port there.

**An object doesn't move with Sync on.** Sync matches objects by name, inside models in `Assets/Lila` or beside a `.lila` file. An object renamed in Lila since the last send has no match: send it again.

## Where to go next

- Compare your script with the [Unity example](unity-scenes.md) in `resources/engines/unity`. It adds **Tools > Lila > Set lilabatch Location...**, a search through `LILA_BATCH`, the install folders and `PATH`, a progress bar, a timeout, and a warning instead of an error when `lilabatch` is missing, for teammates without Lila. Its Build on it section covers collision, LODs and your own materials.
- Sync more than transforms: subscribe with `"evaluated": true` and re-send when a mesh's `outMesh` hash changes, or follow `selection` and `time` changes. The [change stream](change-stream.md) page lists every message.
- Another engine: the same three parts apply. Hook the engine's asset pipeline, run `lilabatch`, hand the export to the engine's importer. The [Godot tutorial](godot-plugin-tutorial.md) does it with glTF. AI coding agents can use the `lila-engine-plugin` skill in [`resources/agents/skills`](https://github.com/lila-3d/Lila/tree/main/resources/agents/skills/lila-engine-plugin), which **Help > Set Up Agent Integration...** installs in your project.
