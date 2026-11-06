# Topology

Retopologize by hand or automatically, from the **Topology** menu or the **Topology Toolkit** (**Windows > Topology Toolkit**).

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
| **Ctrl+Alt**-click | Delete the face, vertex, guide, knot or stroke under the cursor |
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

## Quad Remesh

**Topology > Quad Remesh** rebuilds the selected mesh as quads at about **Target Faces**; the source stays, hidden. For terrain tiles and other open sheets seen from one side, set **Method** to **Grid**: straight rows, no poles.

Steer it from Python:

```python
quadRemesh("Rock", targetFaces=2000,
    densityHandles=[{"position": [0, 120, 10], "radius": 15, "scale": 0.5}],
    featureGuidePoints=[[[0, 100, 0], [10, 110, 5], [20, 100, 0]]],
    guides=["flowCurve"])
```

- `densityHandles`: faces `scale` times as long within `radius` cm, easing out to the edge. Under 1 is denser.
- `featureGuides` (mesh nodes) or `featureGuidePoints` (world points): an edge loop lands on the curve, like a hard edge. `guides` only turns the flow along it.
- `poles`, from **Topology > Retopo Poles** or `retopoPoles`: the result's `poles` says where each one landed, with `valenceMatched` false where the valence came out different.

## Troubleshooting

**"The border has an odd number of edges".** A quad-only fill needs an even edge count round the border. Add or remove one border edge, or scroll over a free side.

**"Edited by hand" in the constructs list.** The construct's faces changed outside its settings. The next setting change freezes it instead of regenerating; nothing is lost.

**A cylinder ring is missing.** The line has to cross the reference; its cut plane is the line and your view direction, so draw it across the limb, not along it.

**Auto Region ran over most of the reference.** Double-click only inside a hole closed by retopo faces all round.

**Quad Remesh gave far more faces than Target Faces.** Parts thinner than a face (hair locks, fingers) fold at that size, so it retries finer, up to about four times the faces. Remesh thin parts separately at a higher count.

**Too few faces at the groin, armpits or hands to deform.** Raise **Joint Density** in the Density section of the options; 1 makes joints about three times as dense, at the cost of faces elsewhere.

**A pole sits in a joint (crotch, armpit, between fingers).** Raise **Joint Pole Avoidance** in the Edge Flow section of the options. Lower it if poles crowd onto flat areas nearby; 0 turns it off, for props.

**Method Grid gave flowing loops instead.** Grid needs an open sheet that never turns back on itself seen from one side, and no symmetry, guides or poles; anything else gets Field.

**A region doesn't join its border.** Its edge length is far from the border's; set the toolkit's Edge length closer to the retopo mesh's.
