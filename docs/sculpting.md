# Sculpting

Sculpt any mesh at high resolution and come out with a game-ready low poly (same topology and UVs) and the high poly to bake from.

## Get it working

1. Select a mesh and pick **Sculpt > Sculpt**. Lila builds a subdivided copy to sculpt on and opens the Sculpt panel. The mesh itself is untouched until you exit.
2. Pick a brush in the panel and drag on the mesh.
3. Pick **Sculpt > Exit Sculpt**. You get:
    - `<mesh>`, the low poly, moved onto the sculpt.
    - `<mesh>_high`, the sculpt at its highest level, as a hidden child of the low poly.

**Sculpt > Cancel Sculpt** leaves without changing the mesh.

To sculpt again later, select the mesh and pick **Sculpt > Sculpt**. Every level comes back from `<mesh>_high`, and you land on the level you left from.

| Key | Does |
| --- | --- |
| D | Next finer level |
| Shift+D | Next coarser level |
| Ctrl+D | Add a level: subdivides the finest once more |
| Ctrl while stroking | Inverts: dig, unmask, unfreeze, magnify |
| Shift while stroking | Smooths for that stroke |
| F or B held + drag | Brush radius (F tapped still frames the selection) |
| M or Shift+F held + drag | Brush strength |
| Shift+F tapped | The wireframe on or off (the sculpt's, or the preview's while previewing) |
| Shift+V | Preview the low poly Exit would leave; again to sculpt on |
| `[` `]` | Radius smaller, larger |
| Esc | Leaves the tool; the sculpt stays open until Exit Sculpt |

The level keys work while the sculpt tool is active. Each stroke and each level change is one undo step. Tumbling orbits round your last stroke.

To make your own brushes, presets and alphas, see [Brushes, presets and alphas](sculpt-brushes.md).

## Subdivision levels

Level 0 is the mesh's own points and each level above has four times the faces, like ZBrush's subdivision levels. Block out broad forms on a low level and detail on a high one: when you step down and reshape, the finer detail follows the change when you step back up. The panel's **Level** row shows where you are and has the same steps as the keys, plus **Delete Higher** to drop the levels above the current one.

## Pick what Exit makes

**Low poly** decides what happens to the mesh you entered with:

| Pick | You get | Use it for |
| --- | --- | --- |
| **Game mesh** | Each point moved to the nearest spot on the sculpt, so the low poly lies on it | A game asset you bake normals onto (the default) |
| **Game mesh, along normals** | Each point moved straight in or out along its normal onto the sculpt | The same, when **Game mesh** slides points sideways into a crease |
| **Subdivision cage** | Points placed so that subdividing the low poly gives the sculpt back; they float off the surface | A mesh you subdivide afterwards, not one you bake |

The **Level** beside **Low poly** sets the topology it comes out at: 0 keeps the mesh's own, each level above subdivides it once more, UVs included. The kept high poly then has that many levels fewer the next time you sculpt.

To check before you commit, press **Preview** in the panel (**Sculpt > Preview Low Poly**, Shift+V): the view shows only the low poly Exit would leave. Shift+F shows its wireframe. Change **Low poly** to compare, then **Preview** again to sculpt on.

To keep a low poly without leaving sculpt mode, press the copy button at the end of the **Low poly** row (**Sculpt > Duplicate Low Poly**). It makes `<mesh>_low<level>` beside the mesh, at that row's choice and level; do it as often as you like, at different levels. **Show cage** draws the same low poly as lines over the sculpt while you work.

**High poly** decides which level `<mesh>_high` keeps: **Highest level**, **Below highest** (a lighter high poly, the number of levels below the highest beside it), a specific **Level**, or **Don't keep**. Whichever level it keeps, every level comes back the next time you sculpt; **Don't keep** loses the sculpt.

## Bake the low and high poly

1. Exit with **Low poly** on **Game mesh**.
2. In **Bake > Baker**, pick **Auto Group by Name**. A mesh and its `_high` pair up as low and high.

## Polypaint

Paint color onto a sculpt and bake it into the low poly's base color texture.

1. Pick the **Paint** brush, or tick **Paint while sculpting** to color as you shape. The mask shields points from paint.
2. Exit. The low poly gets a `polypaint` color set, and `<mesh>_high` keeps the full-detail paint.
3. In the baker, set the Base Colour map's **Source** to `vertexColor`.

## Troubleshooting

**Sculpt does nothing and the log says `select a mesh`.** Nothing selected is a mesh. Select the mesh itself, not its group.

**The low poly floats outside the sculpt after exit.** **Low poly** was on **Subdivision cage**. Undo, pick **Game mesh**, and exit again.

**D does nothing.** Levels need **Sculpt on** set to **Subdivision levels** when you enter; a voxel remesh or the mesh itself has no levels.

**Sculpting again starts from scratch.** The mesh's topology changed since the last exit, or `<mesh>_high` was renamed, moved or deleted. Lila only resumes from the `<mesh>_high` directly under the mesh, with matching topology.

**I want to start over instead of resuming.** Delete `<mesh>_high`, then sculpt.

**Auto Group by Name doesn't pair the mesh with its high.** The high must be named `<mesh>_high` for the mesh's current name. Rename one, or add the pair by hand.

**The baked base color is flat gray.** The high has no color set: check that **High poly** wasn't **Don't keep** when you exited, and that `<mesh>_high` is the group's high.

**Undo jumps the view.** Undoing a stroke puts the tumble point back where it was before a large move. Turn it off in **Preferences > Viewport > Brushes**.

## Options

| Option | What it does |
| --- | --- |
| **Sculpt on** | **Subdivision levels** keeps the mesh's layout, gives you levels, and fits back exactly. **Voxel remesh** gives even detail anywhere, fitted back by projection. **Mesh itself** sculpts the mesh's own points. |
| **Levels** | How many subdivision levels to start with. Greyed out when the mesh resumes a kept sculpt. |
| **Symmetry line** | The red line along the mesh's mirror plane. |
| **Shared** | Which brush settings follow you from brush to brush: **Radius**, **Strength**, **Stroke**. |
| **Display** | The preview material, the wireframe and its opacity. The mesh's own material comes back on exit. |
