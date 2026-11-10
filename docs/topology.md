# Topology

Retopologize by hand or automatically, from the **Topology** menu or the **Topology Toolkit** (**Windows > Topology Toolkit**).

<!-- TODO image: a character half retopologised with patches, strips and cylinders (images/topology/overview.png) -->

## Getting started

1. Select the mesh to retopologize and click **Set Reference** in the toolkit, or pick a tool from **Topology**.
2. To resume later, select either the retopo or reference mesh and pick a tool again.

> Set symmetry in the toolkit's Session section before you start.

## Hotkeys

| Key | In every topology tool |
| --- | --- |
| **Shift**-drag | Live relax under the brush |
| **Shift**+scroll | Brush size (over a strip knot: its width) |
| **Shift**-click in a gap | Fill it with a face between the retopo vertices around the cursor |
| **B**-drag | Brush size |
| **Ctrl+Shift**-click | Delete the face, vertex, guide, knot or stroke under the cursor (**Ctrl+Alt**-click too) |
| **Ctrl**+scroll over a live construct | Its main count: sides, quads along, points around |
| **Ctrl+Alt**+scroll over a live construct | Its second count: pattern, rows, row density |
| **Enter** | Freeze the active construct |
| **Esc** | Cancel, then leave the tool |

| Key | Tool |
| --- | --- |
| Drag from a guide's end | Pencil: continue that guide |
| **Ctrl**-drag | Pencil: erase guides |
| **MMB**-drag | Pencil: move a guide |
| Drag inside a patch | Patch: pull its poles toward the cursor |
| Double-click a patch | Patch: reset the pull |
| **Shift**+scroll / **Ctrl+Shift**+scroll over a knot | Strip: width / twist there |
| Double-click a knot | Strip: corner on or off |
| Click an open border | Cap: fill it with a quad grid that follows the surface; **Ctrl**+scroll over it for the next layout |
| Double-click inside a hole | Auto Region: mark the reference inside it |
| **Ctrl**+scroll / **Ctrl+Alt**+scroll over a handle | Handles: scale / turn |

## Quad Remesh

**Topology > Quad Remesh** rebuilds the selected mesh as quads automatically; see [Quad Remesh](quad-remesh.md).

## Troubleshooting

**"The border has N edges; quads need an even count".** Add or remove one point on the border, or **Ctrl**+scroll over a free side.

**"Edited by hand" in the constructs list.** The construct's faces changed outside its settings. The next setting change freezes it instead of regenerating; nothing is lost.

**A cylinder ring is missing.** The line has to cross the reference; its cut plane is the line and your view direction, so draw it across the limb, not along it.

**Auto Region ran over most of the reference.** Double-click only inside a hole closed by retopo faces all round.

**A region doesn't join its border.** Its edge length is far from the border's; set the toolkit's Edge length closer to the retopo mesh's.

**"Over the region limit".** The edge length would make more than 50,000 faces. Set the region's **Faces**, or raise its **Edge Length**.
