# Topology

Retopologize by hand. Available from the **Topology** menu or the **Topology Toolkit** (Windows > Topology Toolkit).

<!-- TODO image: a character half retopologised with patches, strips and cylinders (images/topology/overview.png) -->

## Getting started

1. Select the mesh to retopologize and pick a tool from **Topology**.
2. To resume later, select either the retopo or reference mesh and pick a tool again.

> Set symmetry in the toolkit's Session section before you start.

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

## Troubleshooting

**"The border has an odd number of edges".** A quad-only fill needs an even edge count round the border. Add or remove one border edge, or scroll over a free side.

**"Edited by hand" in the constructs list.** The construct's faces changed outside its settings. The next setting change freezes it instead of regenerating; nothing is lost.

**A cylinder ring is missing.** The line has to cross the reference; its cut plane is the line and your view direction, so draw it across the limb, not along it.

**Auto Region ran over most of the reference.** Double-click only inside a hole closed by retopo faces all round.

**A region doesn't join its border.** Its edge length is far from the border's; set the toolkit's Edge length closer to the retopo mesh's.
