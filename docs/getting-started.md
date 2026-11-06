# Getting started

A cube in the viewport that you can orbit, select, move and save, using the same mouse and keys as Maya.

<!-- TODO image: persp view with a cube selected and the move manipulator showing (images/getting-started/first-cube.png) -->

## Get it working

1. Start Lila and click **New Scene** on the welcome screen. **Enter** reopens your last scene instead.
2. Choose **Create > Polygon Primitives > Cube**.
3. Hold **Alt** and drag with the left mouse button to orbit around it.
4. Press **W** and drag an arrow to move it.
5. Press **Ctrl+S** to save it as a `.lila` scene.

## Move the camera

| Do | To |
| --- | --- |
| **Alt+left-drag** | Orbit (pans in the front, side and top views) |
| **Alt+middle-drag** | Pan |
| **Alt+right-drag** or scroll | Zoom |
| **F** | Frame the selection |
| **A** | Frame everything |
| **[** and **]** | Undo and redo camera moves |
| **Space** (tap) | Switch between one view and four |

Dragging the view cube in the corner orbits too: left-drag orbits, middle-drag pans, right-drag zooms.

## Select

| Do | To |
| --- | --- |
| Click, or drag a box | Select |
| **Shift**+click | Toggle |
| **Ctrl**+click | Deselect |
| **Ctrl+Shift**+click | Add |
| **Shift+1**, **Shift+2**, **Shift+3** | Vertex, edge or face mode |
| **Shift+\`** | Back to object mode |
| Right-click an object | Marking menu with its component modes |

## Transform

| Press | Tool |
| --- | --- |
| **Q** | Select |
| **W** | Move |
| **E** | Rotate |
| **R** | Scale |
| **D** (hold) | Move the pivot |
| **X**, **C**, **V** (hold) | Snap to grid, edge or vertex while dragging |

Hold **W**, **E** or **R** and left-click for that tool's marking menu: world or object space, pivot editing, soft select.

## See it differently

| Press | Shows |
| --- | --- |
| **4** | Wireframe |
| **5** | Shaded |
| **6** | Textured |
| **7** | Scene lights on/off (environment stays) |
| **1**, **2**, **3** | Smooth preview off, cage, on |
| **Ctrl+1** | Only the selection (isolate) |
| **H** | Hide or show the selection |
| **Ctrl+Shift+H** | Show what you last hid |

## Find the rest

- **Ctrl+T** searches every menu command by name.
- Hold **F1** for every hotkey. **Edit > Hotkey Editor** changes them.
- Bring your Maya hotkeys: **Import from Maya** in the Hotkey Editor reads a hotkey set from `Documents/maya/<version>/prefs/hotkeys` (`.mhk`, or `userHotkeys.mel` from older Maya). Custom scripts and Maya-only commands are listed as skipped.
- Hold **Space** for the hotbox: every menu at the cursor.
- **Z** or **Ctrl+Z** undoes, **Shift+Z** redoes, **G** repeats the last command.

## Troubleshooting

**Alt+drag moves the window instead of the camera.** A window manager or tool such as AutoHotkey takes Alt+drag first. Turn off its Alt binding.

**The object vanished.** It's hidden (**Display > Show All**) or out of view (**A** frames everything).

**A key does something else.** A tool is active and claims it; press **Esc** or **Q**.

## Next

- [Essentials](essentials.md): snapping, pivots, symmetry, primitives at the cursor and the rest of day one.
- [Duplicate and instance](duplicate.md).
