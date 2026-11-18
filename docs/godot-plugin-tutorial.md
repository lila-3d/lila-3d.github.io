# Tutorial: import Lila scenes with a Godot plugin

Build a Godot 4 editor plugin from an empty folder that imports `.lila` files as scenes and re-imports them each time you save in Lila, add **Send to Godot** to Lila, and turn on **Lila Sync** to see objects move in Godot as you drag them in Lila. You end up with a smaller version of the [Godot example](godot-scenes.md), and the pattern to port to any engine.

You need Godot 4 and Lila installed, and a Godot project open.

## 1. Export a scene from a terminal

Every engine integration comes down to one command: `lilabatch` opens the scene and exports a format the engine already reads.

1. In Lila, make a cube and save it in your Godot project as `models/crate.lila`.
2. In a terminal in that `models` folder, run:

```
"%LOCALAPPDATA%\Programs\Lila\lilabatch.exe" --quiet --export crate.lila crate.glb
```

`crate.glb` appears beside `crate.lila`. Delete it: the plugin makes its own from now on.

## 2. Create the plugin

1. In your project, create `addons/my_lila/plugin.cfg`:

```ini
[plugin]

name="My Lila Import"
description="Imports Lila scenes"
author="Me"
version="1.0"
script="plugin.gd"
```

2. Create `addons/my_lila/plugin.gd`. It registers the importer you write next:

```gdscript
@tool
extends EditorPlugin

var _importer: EditorImportPlugin


func _enter_tree() -> void:
	_importer = preload("lila_import.gd").new()
	add_import_plugin(_importer)


func _exit_tree() -> void:
	remove_import_plugin(_importer)
	_importer = null
```

## 3. Claim the .lila files

Create `addons/my_lila/lila_import.gd`. These functions tell Godot which files the importer takes and what it makes of them, a `PackedScene`:

```gdscript
@tool
extends EditorImportPlugin


func _get_importer_name() -> String: return "my.lila.scene"
func _get_visible_name() -> String: return "Lila Scene"
func _get_recognized_extensions() -> PackedStringArray: return PackedStringArray(["lila", "lilaa"])
func _get_save_extension() -> String: return "scn"
func _get_resource_type() -> String: return "PackedScene"
func _get_priority() -> float: return 1.0
func _get_import_order() -> int: return IMPORT_ORDER_SCENE
func _get_preset_count() -> int: return 0
func _get_preset_name(_i: int) -> String: return ""
func _get_import_options(_path: String, _i: int) -> Array[Dictionary]: return []
func _get_option_visibility(_path: String, _name: StringName, _options: Dictionary) -> bool: return true
```

## 4. Export with lilabatch

Add `_import` to the same file. It runs the command from step 1, writing the `.glb` under `.godot` so it stays out of your project:

```gdscript
func _import(source_file: String, save_path: String, _options: Dictionary, _variants: Array[String], _gen: Array[String]) -> Error:
	var temp_dir := ProjectSettings.globalize_path("res://.godot/lila")
	DirAccess.make_dir_recursive_absolute(temp_dir)
	var glb := temp_dir.path_join("%s.glb" % source_file.md5_text())
	var scene := ProjectSettings.globalize_path(source_file)

	var batch := OS.get_environment("LOCALAPPDATA").path_join("Programs/Lila/lilabatch.exe")
	OS.set_environment("LILA_CRASH_NO_UI", "1")
	var output: Array = []
	var code := OS.execute(batch, PackedStringArray(["--quiet", "--export", scene, glb]), output, true)
	if code != 0 or not FileAccess.file_exists(glb):
		push_error("Lila: lilabatch couldn't export %s\n%s" % [source_file, "\n".join(output)])
		return ERR_CANT_CREATE

	return _save_scene(glb, source_file, save_path)
```

`LILA_CRASH_NO_UI` stops a crash from opening a dialog that nobody sees. `output` holds Lila's log, so a failed export says why.

## 5. Load the glTF into a scene

Add the rest. Godot's glTF loader builds the scene, then the importer packs it and saves it where Godot asked:

```gdscript
func _save_scene(glb: String, source_file: String, save_path: String) -> Error:
	var document := GLTFDocument.new()
	var state := GLTFState.new()
	state.handle_binary_image = GLTFState.HANDLE_BINARY_EMBED_AS_UNCOMPRESSED
	var err := document.append_from_file(glb, state)
	DirAccess.remove_absolute(glb)
	if err != OK:
		return err

	var root := document.generate_scene(state)
	root = _to_mesh_instances(root)
	root.name = source_file.get_file().get_basename()
	_own(root, root)
	var packed := PackedScene.new()
	err = packed.pack(root)
	root.free()
	if err != OK:
		return err
	return ResourceSaver.save(packed, "%s.scn" % save_path)


# During an import the loader builds ImporterMeshInstance3D nodes, which a saved scene can't hold.
func _to_mesh_instances(node: Node) -> Node:
	for child: Node in node.get_children():
		_to_mesh_instances(child)
	var importer := node as ImporterMeshInstance3D
	if importer == null:
		return node
	var instance := MeshInstance3D.new()
	instance.name = importer.name
	instance.transform = importer.transform
	if importer.mesh != null:
		instance.mesh = importer.mesh.get_mesh()
	instance.skin = importer.skin
	instance.skeleton = importer.skeleton_path
	importer.replace_by(instance)
	importer.free()
	return instance


# PackedScene.pack keeps only the nodes the root owns.
func _own(node: Node, root: Node) -> void:
	for child: Node in node.get_children():
		child.owner = root
		_own(child, root)
```

`HANDLE_BINARY_EMBED_AS_UNCOMPRESSED` keeps textures inside the scene rather than writing them out beside the `.glb`.

## 6. Try it

1. Open **Project > Project Settings > Plugins** and enable **My Lila Import**.
2. `crate.lila` shows in the FileSystem dock as a scene. Drag it into a 3D scene.
3. In Lila, scale the cube and save. Click the Godot window: the crate updates.

## 7. Add Send to Godot in Lila

Sending puts chosen objects into the project without saving a scene there. It's a Lila extension: one Python file that adds **File > Send to Godot** and **File > Connect to Godot...** under the Unreal rows. Godot imports the `.glb` it writes on its own, so the plugin doesn't change.

1. Save this as `godot_link.py` in `%APPDATA%\Lila\extensions`:

```python
import os

import lila
from lila import extension, prefs
from lila.ops import exportGltf, ls

PROJECT_PREF = "/godotLink/project"


def godot_connect(project=""):
    if not os.path.isfile(os.path.join(project, "project.godot")):
        raise lila.CommandError(f"{project} has no project.godot")
    prefs.set("general", PROJECT_PREF, project)
    return project


def godot_send():
    project = prefs.get("general", PROJECT_PREF, "")
    if not project:
        raise lila.CommandError("choose the Godot project first: File > Connect to Godot")
    objects = ls(selection=True)
    if not objects:
        raise lila.CommandError("select the objects to send")
    folder = os.path.join(project, "lila")
    os.makedirs(folder, exist_ok=True)
    sent = []
    for obj in objects:
        path = os.path.join(folder, obj.split("|")[-1] + ".glb")
        exportGltf(path, obj, unrealCheck=False)
        sent.append(path)
    return sent


def _pick_project():
    from PySide6 import QtWidgets

    from lila import ui

    folder = QtWidgets.QFileDialog.getExistingDirectory(ui.main_window(), "Godot project", prefs.get("general", PROJECT_PREF, ""))
    if folder:
        godot_connect(project=folder)


def initialize_extension():
    extension.register_command("godotConnect", godot_connect, "Choose the Godot project that Send to Godot writes into.",
                               flags=[("project", str, "", "Folder holding project.godot.")])
    extension.register_command("godotSend", godot_send, "Export each selected object to <project>/lila/<name>.glb.", undoable=False)

    from lila import ui

    try:
        ui.add_action("godot.send", lambda: godot_send(), "Send to Godot", category="Godot",
                      doc="Export the selected objects into the Godot project chosen with Connect to Godot.")
        ui.add_action("godot.connect", _pick_project, "Connect to Godot...", category="Godot", doc="Choose the Godot project to send to.")
        section = ui.add_menu_item("File", kind="section", label="Godot", after="File/unreal.connect")
        send = ui.add_menu_item("File", action="godot.send", after=section)
        ui.add_menu_item("File", action="godot.connect", after=send)
    except RuntimeError:
        pass  # lilabatch has no menus
```

2. In Lila's script editor, run `loadExtension("godot_link", autoload=True)`. It loads now and at every start.
3. Restart Lila so the rows take their place in the **File** menu.
4. Choose **File > Connect to Godot...** and pick the folder that holds `project.godot`.
5. Select an object, for example `barrel`, and choose **File > Send to Godot**. Click the Godot window: `res://lila/barrel.glb` appears. Drag it into your scene.

Each send overwrites the `.glb`, and Godot updates every instance of it. Registering commands as well as menu rows means scripts can call `godotSend()` too.

## 8. Sync: follow moves live

Saving and sending update meshes. To see objects move while you drag them in Lila, the plugin reads Lila's [change stream](change-stream.md): one JSON line per change over a local socket.

1. Create `addons/my_lila/lila_sync.gd`. It connects, asks for world matrices, and turns each one into a `Transform3D`:

```gdscript
extends RefCounted

var port := 8742
var _tcp := StreamPeerTCP.new()
var _buffer := PackedByteArray()
var _subscribed := false
var _started_msec := 0


func start() -> void:
	_started_msec = Time.get_ticks_msec()
	_tcp.connect_to_host("127.0.0.1", port)


func stop() -> void:
	_tcp.disconnect_from_host()
	_buffer.clear()
	_subscribed = false


# True once Lila didn't answer within 3 seconds or went away.
func has_failed() -> bool:
	match _tcp.get_status():
		StreamPeerTCP.STATUS_ERROR:
			return true
		StreamPeerTCP.STATUS_CONNECTING:
			return Time.get_ticks_msec() - _started_msec > 3000
		StreamPeerTCP.STATUS_NONE:
			return _subscribed
	return false


# Object name -> Transform3D for everything that moved since the last call.
func poll() -> Dictionary:
	var moved := {}
	_tcp.poll()
	if _tcp.get_status() != StreamPeerTCP.STATUS_CONNECTED:
		return moved
	if not _subscribed:
		_send({"op": "subscribe", "snapshot": true, "world": true, "live": true, "types": ["transform"]})
		_subscribed = true
	var available := _tcp.get_available_bytes()
	if available > 0:
		_buffer.append_array(_tcp.get_data(available)[1])
	var end := _buffer.find(10)
	while end != -1:
		var message: Variant = JSON.parse_string(_buffer.slice(0, end).get_string_from_utf8())
		_buffer = _buffer.slice(end + 1)
		if message is Dictionary:
			_read(message, moved)
		end = _buffer.find(10)
	return moved


# Moves the nodes with those names inside every scene sent from Lila.
static func apply(root: Node, moved: Dictionary) -> void:
	for instance: Node in _sent_instances(root, []):
		for object_name: String in moved:
			var node := instance.find_child(object_name, true, false) as Node3D
			if node != null:
				node.global_transform = moved[object_name]


func _read(message: Dictionary, moved: Dictionary) -> void:
	match message.get("type"):
		"snapshot":
			for node: Dictionary in message["nodes"]:
				if node.has("world"):
					moved[_name(node["path"])] = _to_transform(node["world"])
		"group", "live", "frame":
			for change: Dictionary in message["changes"]:
				if change["kind"] == "world":
					moved[_name(change["path"])] = _to_transform(change["matrix"])
		"resync":
			_send({"op": "snapshot"})


func _send(request: Dictionary) -> void:
	_tcp.put_data((JSON.stringify(request) + "\n").to_utf8_buffer())


func _name(path: String) -> String:
	return path.get_slice("|", path.get_slice_count("|") - 1)


# Lila's matrices are column by column in centimetres, Y up: the same axes as Godot.
func _to_transform(m: Array) -> Transform3D:
	var basis := Basis(Vector3(m[0], m[1], m[2]), Vector3(m[4], m[5], m[6]), Vector3(m[8], m[9], m[10]))
	return Transform3D(basis, Vector3(m[12], m[13], m[14]) / 100.0)


static func _sent_instances(node: Node, found: Array[Node]) -> Array[Node]:
	if node.scene_file_path.begins_with("res://lila/"):
		found.append(node)
	for child: Node in node.get_children():
		_sent_instances(child, found)
	return found
```

World matrices are absolute, so the newest one for each object is all that matters: no ordering or undo bookkeeping. The `snapshot` puts everything in place the moment you connect.

2. Replace `plugin.gd` with this version, which adds a **Lila Sync** switch to the editor toolbar:

```gdscript
@tool
extends EditorPlugin

const LilaSync := preload("lila_sync.gd")

var _importer: EditorImportPlugin
var _sync := LilaSync.new()
var _button := CheckButton.new()


func _enter_tree() -> void:
	_importer = preload("lila_import.gd").new()
	add_import_plugin(_importer)
	_button.text = "Lila Sync"
	_button.toggled.connect(_on_toggled)
	add_control_to_container(CONTAINER_TOOLBAR, _button)
	set_process(false)


func _exit_tree() -> void:
	remove_import_plugin(_importer)
	_importer = null
	_sync.stop()
	remove_control_from_container(CONTAINER_TOOLBAR, _button)
	_button.queue_free()


func _on_toggled(on: bool) -> void:
	if on:
		_sync.start()
	else:
		_sync.stop()
	set_process(on)


func _process(_delta: float) -> void:
	var moved := _sync.poll()
	if _sync.has_failed():
		push_warning("Lila: can't reach Lila. Turn on Preferences > General > Change Stream in Lila.")
		_button.button_pressed = false
		return
	var root := EditorInterface.get_edited_scene_root()
	if root != null and not moved.is_empty():
		LilaSync.apply(root, moved)
		EditorInterface.mark_scene_as_unsaved()
```

3. In Lila, turn on **Preferences > General > Change Stream**.
4. In Godot, turn on **Lila Sync** in the toolbar. The barrel jumps to where it is in Lila.
5. Drag the barrel in Lila. It moves in Godot as you drag.

Sync places objects where they are in Lila, wherever you dropped the instance in Godot. Save the Godot scene to keep the positions.

## Troubleshooting

**`crate.lila` shows a red cross in the FileSystem dock.** The import failed. The Output panel has the error and Lila's log under it; its `[error]` lines say why.

**`OS.execute` returns -1.** Godot couldn't start `lilabatch`. Lila isn't in its default install folder: put the full path in `batch`.

**Parse errors after pasting.** GDScript needs tabs. Re-indent the pasted code with tabs.

**Nothing updates after a save or a send.** Godot looks for changed files when its window gets focus. Click it.

**Send to Godot isn't in the File menu.** `loadExtension` reported an error in the script editor, or the file isn't in an extension folder: `listExtensions(searchPaths=True)` lists them. Loaded without a restart, the rows sit at the end of the **File** menu.

**Lila Sync turns itself off and the Output panel says "can't reach Lila".** The change stream is off, or on another port. Turn it on in Lila's **Preferences > General > Change Stream**, and match `port` in `lila_sync.gd` to the port there.

**An object doesn't move with Sync on.** Sync matches objects by name, inside scenes under `res://lila/`. An object renamed in Lila since the last send has no match: send it again.

## Where to go next

- Compare your plugin with the [Godot example](godot-scenes.md) in `resources/engines/godot`. It adds an Editor Setting for the `lilabatch` path, a search through `LILA_BATCH`, the install folders and `PATH`, and a separate message when `lilabatch` is missing, and its Sync also follows `.lila` scenes. Its Build on it section covers collision, LODs and your own materials.
- Sync more than transforms: subscribe with `"evaluated": true` and re-send when a mesh's `outMesh` hash changes, or follow `selection` and `time` changes. The [change stream](change-stream.md) page lists every message.
- Another engine: the same three parts apply. Hook the engine's asset pipeline, run `lilabatch`, hand the export to the engine's importer. The [Unity tutorial](unity-plugin-tutorial.md) does it with FBX. AI coding agents can use the `lila-engine-plugin` skill in [`resources/agents/skills`](https://github.com/lila-3d/Lila/tree/main/resources/agents/skills/lila-engine-plugin), which **Help > Set Up Agent Integration...** installs in your project.
