# Sculpting

Sculpt any mesh directly, with subdivision levels that stay on the mesh between sessions, like a ZBrush subtool.

## Get it working

1. Select a mesh and pick **Sculpt > Sculpt**. The Sculpt panel opens and you sculpt the mesh itself, at level 0.
2. Press Ctrl+D (**Add Level** in the panel) for each subdivision level you want to sculpt detail on.
3. Pick a brush in the panel and drag on the mesh.
4. Pick **Sculpt > Exit Sculpt**. The mesh stays at the level you were sculpting, and keeps every level.

To sculpt again, select the mesh and pick **Sculpt > Sculpt**: every level comes back, on the level you left from. **Sculpt > Cancel Sculpt** leaves without changing the mesh.

| Key | Does |
| --- | --- |
| D | Next finer level |
| Shift+D | Next coarser level |
| Ctrl+D | Add a level: subdivides the finest once more |
| Ctrl while stroking | Inverts: dig, unmask, unfreeze, magnify |
| Shift while stroking | Smooths for that stroke |
| F or B held + drag | Brush radius (F tapped still frames the selection) |
| M or Shift+F held + drag | Brush strength |
| Shift+F tapped | The wireframe on or off |
| `[` `]` | Radius smaller, larger |
| Shift+right-click | Brushes, masks, levels and the hard-surface tools ([Plating](plating.md)) |
| Esc | Leaves the tool; sculpt mode stays open until Exit Sculpt |

The level keys work while the sculpt tool is active. Each stroke and each level change is one undo step. Tumbling orbits round your last stroke.

To make your own brushes, presets and alphas, see [Brushes, presets and alphas](sculpt-brushes.md).

## Subdivision levels

Level 0 is the mesh's cage and each level above has four times the faces. Block out broad forms on a low level and detail on a high one: when you step down and reshape, the finer detail follows when you step back up.

- **Delete Higher** drops the levels above the current one.
- **Delete Lower** makes the current level the new level 0.
- **Reconstruct** rebuilds a level below level 0 from a mesh that was already subdivided, so you can block out forms on it. It needs all quads, laid out the way a subdivision lays them out.
- **Sculpt > Voxel Remesh** (in the panel's **...** menu) replaces the sculpt with an even remesh, for when the topology is in the way. UVs and levels go; polypaint stays.

Moving points outside sculpt mode keeps the levels: the detail follows the moved shape. An edit that changes the mesh's topology, like an extrude, asks whether to undo it or delete the levels.

## Low and high poly

Keep your low poly as its own mesh: duplicate it and sculpt the copy. While sculpting:

- **Duplicate** copies the mesh at the current level beside it in the Outliner as `<mesh>_level<N>`, selects the copy and exits.
- **Duplicate and Hide** makes the same copy hidden and keeps you sculpting, for saving a level to bake from without losing your place.

To bake, name the high poly `<low>_high` and pick **Auto Group by Name** in **Bake > Baker**. To move a low poly onto a sculpt, select the sculpt, then the low poly, and pick **Sculpt > Transfer Shape (High to Low)**.

## Polypaint

1. Pick the **Paint** brush, or tick **Paint While Sculpting** to color as you shape. The mask shields points from paint. Add **Only Where It Digs** and the color goes only where a stroke cuts in, so Dam Standard lines come out painted along their grooves.
2. Exit. The mesh gets a `polypaint` color set at its current level.
3. To bake it, set the Base Colour map's **Source** to `vertexColor` in the baker.

## Troubleshooting

**Sculpt does nothing and the log says `select a mesh`.** Nothing selected is a mesh. Select the mesh itself, not its group.

**Sculpting again starts at level 0 with no levels.** The mesh's topology changed since you exited and you kept the edit, so the levels were removed. Undo back past that edit to get them.

**Reconstruct says the mesh isn't a subdivided mesh.** It has triangles, n-gons, or quads that don't follow a subdivision's pattern. Reconstruct only works on meshes made by subdividing.

**The sculpt draws in clay instead of its material.** **Display > Material** is set to a preview material. Pick **Mesh Material**.

**Auto Group by Name doesn't pair the low and high poly.** The high must be named `<low>_high` for the low poly's current name.

**Undo jumps the view.** Undoing a stroke puts the tumble point back where it was before a large move. Turn it off in **Preferences > Viewport > Brushes**.

## Options

| Option | What it does |
| --- | --- |
| **Symmetry Line** | The red line along the mesh's mirror plane. |
| **Shared** | Which brush settings follow you from brush to brush: **Radius**, **Strength**, **Stroke**. |
| **Display > Material** | **Mesh Material** draws the mesh's own materials; the others are preview materials for sculpting. |
| **Sculpt > Delete Sculpt Levels** | Removes the stored levels from the selected meshes, leaving each at its current level. |
