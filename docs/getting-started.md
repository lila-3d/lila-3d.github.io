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
- Keep several hotkey sets: the **Keymap** list at the top of the Hotkey Editor switches between them, and its **...** menu makes, renames, imports and exports them. A `.lilakeys` file shares one with someone else.
- Hotkeys follow the letters printed on your keys, so **Z** undoes on any layout. To keep them where they sit on a US keyboard instead, set **Preferences > Interface > Hotkeys follow** to **Key positions (US layout)**. The number keys always work by position, so AZERTY users press them unshifted.
- Hold **Space** for the hotbox: every menu at the cursor.
- The menu bar shows the menus for what you're doing: a sculpt tool brings up **Sculpt**, the UV editor **UV**, a joint selection **Rig**. **F3** to **F7** pin the Model, Rig, Animate, Texture or Level menus until you press the key again. **Preferences > Interface > Show all menus** keeps every menu up.
- The tabs at the top (**Model**, **UV**, **Sculpt**, **Texture**, **Bake**, **Rig**, **Animate**, **Level**, more under **+**) arrange the panels for that work. Every tool and menu works in any of them.
- Right-click the row along the top of a viewport and choose **Customize Header...** to put any command on it, or a menu of your own commands.
- A small triangle in the corner of a panel button means it has options: click the corner, right-click or **Shift**+click the button.
- **Z** or **Ctrl+Z** undoes, **Shift+Z** redoes, **G** repeats the last command.

## Troubleshooting

**Alt+drag moves the window instead of the camera.** A window manager or tool such as AutoHotkey takes Alt+drag first. Turn off its Alt binding.

**The object vanished.** It's hidden (**Display > Show All**) or out of view (**A** frames everything).

**A key does something else.** A tool is active and claims it; press **Esc** or **Q**.

**A menu is missing from the menu bar.** It belongs to other work. Hold **Space** for the hotbox or press **Ctrl+T**; both reach every menu.

**Text and icons are too small on a 4K screen.** Set **Preferences > Interface > UI scale** and restart Lila.

**The shelf is gone.** It's hidden by default: **\`** opens the floating shelf, and **Preferences > Interface > Show shelf** docks it.

## Next

- [Essentials](essentials.md): snapping, pivots, symmetry, primitives at the cursor and the rest of day one.
- [Duplicate and instance](duplicate.md).
