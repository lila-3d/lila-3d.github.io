# Plating

Draw panel lines on any mesh and turn them into grooves, plates with gaps and bevels, rivets and bolts, and surface patterns, all kept live as you redraw the lines. Everything is in **Mesh > Plating**, also under **Sculpt > Hard Surface** and Shift+right-click while sculpting.

<!-- TODO image: a sci-fi shoulder plate with plates, gaps, rivets along the borders and a hex pattern (images/plating/overview.png) -->

## Get it working

1. Select a mesh and pick **Mesh > Plating > Layout Pencil**. Its palette opens with four modes: **Lines**, **Plates**, **Fasteners** and **Patterns**.
2. In **Lines**, draw on the surface. Strokes come out as clean straights, arcs and corners, join the lines they touch and close into panels. Lines are mirrored across X unless you untick **Mirror X**.
3. Switch to **Plates** and click **Make Plates**. Every closed panel becomes a thick plate split from its neighbours by a gap.
4. Switch to **Fasteners** and click **Add Fasteners**. Rivets line both sides of every line, sitting on the plates.
5. Switch to **Patterns** and click **Add Pattern** for a hex pattern pressed into every panel.

Each of these is a modifier on the mesh, so it updates whenever you redraw a line, and the Modifier Stack (Ctrl+M) turns it off or removes it.

## Drawing lines

- **Redraw a line:** start on it heading along it and draw the new shape. The section you draw over is replaced.
- **Straighten the end:** pause at the end of a stroke before letting go. Hold Shift while drawing to make every piece straight.
- **Erase:** Ctrl+drag across lines.
- **Smooth:** Shift+drag over lines; Shift+scroll sets the brush size.
- **Move a junction:** drag the dot that appears near the cursor. Double-click a junction to make it a sharp corner or a smooth one.
- **Select:** click a line; double-click selects every line it runs straight into. A selected line shows its points to drag and a handle that drags out a parallel copy.
- **Loosen (L):** frees the selected lines so **Cleanup** refits them as you drag it.

**Cleanup** sets how much each stroke is tidied: 0 keeps the hand-drawn wobble, 1 fits the fewest points.

**Loop Spokes** (in the **Pencil** section): a stroke that closes on itself also gets spokes running out across the surface, crowded toward the loop's corners as **Corner Bias** grows. Use it to lay out a mouth or an eye for a [Soft Net](soft-net.md).

## Line sets

Every line belongs to a line set, and each set has its own width, depth, profile and output:

| Output | What the lines become |
| --- | --- |
| Geometry | Grooves cut into the mesh, with new edges along the profile. For low and mid poly meshes. |
| Sculpt | Grooves sunk into the existing points. For dense sculpt meshes. |
| Texture | Nothing on the mesh; the grooves go into the height map (see Texture maps). |
| Decal | Strips along the lines on a `LilaPanelLine` material slot, for mesh decals in Unreal. Run **Unreal Panel Line Materials** from the palette's overflow menu once: meshes you send after that get `M_LilaPanelLine` on the slot, and `MF_LilaPanelLine` is there for your own material. |
| None | Lines that only divide panels, for plates and patterns. |

New strokes go to the highlighted set. Right-click a set to rename it, change its output or remove it. With lines selected, **Width**, **Depth** and **Profile** change those lines only, and **Set** moves them to another set.

## Plates

In **Plates** mode, click a panel to give it its own **Elevation** or **Thickness**, or **Hide** it to leave a hole. **Reset Panel** puts it back. **Keep Mesh Under** keeps the mesh beneath the plates, for armour over a body.

With **Keep Mesh Under** on, Geometry lines also groove the mesh beneath the plates; set their set to **None** if you only want the gaps.

## Fasteners and patterns

Fasteners sit on whatever is under them, plates included. **Place** sets where they go: on the lines, beside them on both sides, or in panel corners. **Lines** limits them to one line set. **Recess** presses a dip under each head on a dense mesh. **Convert to Instances** turns them into one fastener mesh placed many times, which Unreal gets as instanced static meshes.

Patterns follow each panel's own direction unless **Follow** is **Triplanar**. With **Where** set to **Picked**, click panels and tick **This Panel** to choose which ones get the pattern.

## Texture maps

**Bake Line Maps...** in the Lines palette's overflow menu writes three maps in the mesh's UVs: `_PanelHeight` (Texture lines as a height map), `_PanelId` (a flat colour per panel) and `_PanelLines` (a line mask). The baker offers the same as the **Panel Lines**, **Panel ID** and **Panel Line Height** maps, and the texture graph reads them through the **Panel Layout** node.

```python
panelLayoutBakeMaps("Hull", path="D:/textures", resolution=4096)
```

For geometry nodes, turn on **Write Attributes** on the layout modifier in the Attribute Editor: each point gets `panelId`, `panelRandom` (0 to 1) and `panelLineDistance` (cm), read with a Named Attribute node.

## Troubleshooting

**Nothing happens when I draw.** The pencil draws on the selected mesh. Select one and draw over it; the HUD at the top of the view says what the pencil is waiting for.

**Grooves look smeared on a low-poly mesh.** The line set is on **Sculpt**, which only moves existing points. Set it to **Geometry**.

**The layout says the mesh is too coarse.** Sculpt lines and patterns need points closer together than the line width or pattern scale. Add sculpt levels or subdivide under the layout, or use Geometry lines and a larger pattern scale.

**A plate is missing.** Its lines don't close: every panel needs a loop of lines all the way round. Draw the missing line so it touches both ends.

**Fasteners disappear into the gaps.** **Place** is set to **On Lines** while plates leave a gap there. Pick **Sides**.

## Python

```python
layout = panelLayout("Hull")[0]
panelLayoutStroke(layout, points=[[0, 10, 5], [20, 10, 5]])
plates("Hull", gap=0.4, thickness=1.5, bevel=0.2)
fasteners("Hull", kind="hexBolt", placement="corners")
surfacePattern("Hull", pattern="diamondPlate", scale=1.5)
platesPanel("Hull", point=[5, 12, 20], hidden=True)
```

`panelLayoutInfo` lists the lines, junctions, panels and warnings; `panelLayoutQuery` samples the layout at points.
