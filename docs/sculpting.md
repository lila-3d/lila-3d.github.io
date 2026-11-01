# Sculpting

Sculpt any mesh at high resolution, then fit its low-poly cage back onto the result.

## Get it working

1. Select a mesh and pick **Sculpt > Sculpt**. Lila builds a dense proxy and opens the Sculpt panel.
2. Pick a brush in the panel and drag on the mesh.
3. Pick **Sculpt > Exit Sculpt**. The cage moves onto the sculpt; **Sculpt > Cancel Sculpt** leaves without changing the mesh.

| Key | Does |
| --- | --- |
| Ctrl while stroking | Inverts: dig, unmask, unfreeze, magnify |
| Shift while stroking | Smooths for that stroke |
| F or B held + drag | Brush radius (F tapped still frames the selection) |
| M or Shift+F held + drag | Brush strength |
| Shift+F tapped | The sculpt's wireframe on or off |
| `[` `]` | Radius smaller, larger |
| Esc | Leaves the tool; the sculpt stays open until Exit Sculpt |

Each stroke is one undo step. Tumbling orbits round your last stroke.

To make your own brushes, presets and alphas, see [Brushes, presets and alphas](sculpt-brushes.md).

## Polypaint

Paint color onto a sculpt and bake it into the low poly's base color texture.

1. Pick the **Paint** brush, or tick **Paint while sculpting** to color as you shape. The mask shields points from paint.
2. Turn on **Keep sculpt proxy**, then exit sculpt. The low poly gets a `polypaint` color set, and the hidden `<mesh>_sculptProxy` child keeps the full-detail paint.
3. In **Bake > Baker**, use the proxy as the high and set the Base Colour map's **Source** to `vertexColor`.

## Troubleshooting

**Sculpt does nothing and the log says `select a mesh`.** Nothing selected is a mesh. Select the mesh itself, not its group.

**The baked base color is flat gray.** The high has no color set: check that **Keep sculpt proxy** was on when you exited, and that the proxy is the group's high.

**Undo jumps the view.** Undoing a stroke puts the tumble point back where it was before a large move. Turn it off in **Preferences > Viewport > Brushes**.

## Options

| Option | What it does |
| --- | --- |
| **Proxy** | **Subdivide** keeps the cage's layout and fits it back exactly. **Voxel remesh** gives even detail anywhere, fitted back by projection. **Direct** sculpts the mesh itself. |
| **Exit by** | How Exit Sculpt moves the cage. **Fit subdivision** solves for the cage whose subdivision matches the sculpt; the others project each cage point onto it. |
| **Keep sculpt proxy** | Stores the sculpt as a hidden child, so Enter Sculpt carries on from it and the baker can use it as the high. |
| **Shared** | Which brush settings follow you from brush to brush: **Radius**, **Strength**, **Stroke**. |
| **Display** | The preview material, the wireframe and its opacity. The mesh's own material comes back on exit. |
