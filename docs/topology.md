# Topology

Hand retopology over a reference mesh, from the **Topology** menu or the **Topology Toolkit** (Windows > Topology Toolkit).

<!-- TODO image: a character half retopologised with patches, strips and cylinders (images/topology/overview.png) -->

## Get it working

1. Select the high-res reference mesh and pick a tool from **Topology**. The retopo mesh is made on your first edit as `<reference>_retopo`.
2. To resume later, select the retopo mesh (or the reference) and pick a tool again.
3. Set symmetry in the toolkit's Session section before you start: every tool builds both halves.

## Hotkeys

| Key | In every topology tool |
| --- | --- |
| **Shift**-drag | Live relax under the brush |
| **Shift**+scroll | Brush size |
| **Ctrl+Shift**-click | Delete the face, vertex, guide, knot or stroke under the cursor |
| Scroll over a live construct | Its main count: sides, quads along, points around |
| **Ctrl**+scroll over a live construct | Its second count: pattern, rows, row density |
| **Enter** | Freeze the active construct |
| **Esc** | Cancel, then leave the tool |

| Key | Tool |
| --- | --- |
| **Ctrl**-drag | Pencil: erase guides |
| **MMB**-drag | Pencil: move a guide |
| Drag inside a patch | Patch: pull its poles toward the cursor |
| Double-click a patch | Patch: reset the pull |
| Scroll / **Ctrl**+scroll over a knot | Strip: scale / twist there |
| Double-click a knot | Strip: corner on or off |
| Double-click inside a hole | Auto Region: mark the reference inside it |
| Scroll / **Ctrl**+scroll over a handle | Handles: scale / turn |

## Live constructs

Patches, strips, strokes, bridges, sweeps, cylinders and auto regions stay editable: scroll over them, or change their settings in the toolkit's Active Construct section. Editing their faces any other way (Retopo Draw, moving vertices, relaxing) freezes them into plain faces the next time you change a setting.

## What a stroke makes

| Drawn | Result |
| --- | --- |
| Free, alone | A waiting stroke; the next free stroke bridges to it |
| Along an existing border | A bridge from that border to the stroke |
| From a border point, ending free | A sweep: the border beside it carried along the stroke (scroll for how much border) |
| From a border point back to the border | A patch closing the gap |

## Auto Region

Paint the area of the reference to retopologise and press **Enter**. If a retopo border loop runs round the painted area, the result is stitched to it; otherwise its border is left open. Guides inside the area steer the edge flow.

## Troubleshooting

**"The border has an odd number of edges".** A quad-only fill needs an even edge count round the border. Add or remove one border edge, or scroll over a free side.

**"Edited by hand" in the constructs list.** The construct's faces changed outside its settings. The next setting change freezes it instead of regenerating; nothing is lost.

**A cylinder ring is missing.** The line has to cross the reference; its cut plane is the line and your view direction, so draw it across the limb, not along it.

**Auto Region ran over most of the reference.** Double-click only inside a hole closed by retopo faces all round.

**A region doesn't join its border.** Its edge length is far from the border's; set the toolkit's Edge length closer to the retopo mesh's.
