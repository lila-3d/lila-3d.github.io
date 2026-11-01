# Tailor garments

Make clothing from sewing patterns, drape it on a body and bake it to a skinned game mesh.

> **Experimental:** Tailor is subject to change and may lose data between versions. Feedback is welcome.

## Get it working

1. **Tailor > Mannequin** adds a stand-in body, or select your own character mesh standing in +Y, facing +Z.
2. With the body selected, **Tailor > Garment from Block** builds a garment from a block (tee, tunic, cloak and others), sized to the body, and drapes it. The garment settles in the viewport while the drape runs in the background.
3. **Tailor > Bake to Game Mesh** makes a plain mesh from the drape. If the body is skinned, the baked mesh is bound to the same joints with weights copied from the body.

```python
from lila import ops
body = ops.tailorMannequin(height=175, chest=100)
mesh, garment = ops.tailorCreateBlock(block='cloakTunicBelt', collider=body, wait=True)
ops.tailorBake(mesh, retopo=3000, lods=2)
```

## Edit the pattern

- **Tailor > Pattern Editor** shows the selected garment's panels flat. Drag points to reshape, double-click an edge to add a point, Delete removes the hovered point. Seams show in matching colours; a red label means the two sides differ in length.
- In **Sew** mode, click one edge and then another to sew them. Hold Shift on the second click to sew them the same way round. Right-click an edge to unsew it.
- **Tailor > Draw Panel on Body** draws a new panel straight onto the body: click around it, press Enter. M mirrors it across the body.
- **Tailor > Live Drape** keeps the garment simulating, so edits show as you make them. **Tailor > Grab Cloth** pulls it around in the viewport.

## Troubleshooting

**The garment doesn't fit the body.** Blocks read height and chest, waist, hip, neck and head girths from horizontal slices of the body. A body lying down, facing another axis, or with arms fused to the torso reads wrong. Stand it in +Y facing +Z, or pass `fit=False` and use the default 180 cm body.

**The mesh stays flat and undraped.** The drape is still running (see the progress bar), or **simulate** is off on the garment node. In scripts, pass `wait=True` to get the finished drape back.

**Cloth pokes through the body.** Lower **particleDistance** for a finer cloth mesh, or raise **frames** and drape again with **Tailor > Drape**.

**Bake didn't skin the mesh.** The body has no skinCluster. Skin the body first, then bake again.

**Retopo warns about folds.** Tight folds under the arms are hard to quad. Raise `retopo` or drape with a larger `particleDistance`.

## Options

Set these on the garment node in the Attribute Editor.

| Option | Default | What it does |
| --- | --- | --- |
| `particleDistance` | `2` cm | Cloth edge length. Smaller is finer and slower. |
| `frames` | `90` | Solver frames per drape. |
| `gpu` | on | Drapes on the GPU while the viewport runs; batch runs use the CPU. |
| `floor` | on | A ground at the body's feet the cloth rests on. |
| `weldSeams` | on | Merges sewn points so the garment is one connected mesh. |
| `thickness` | `0` cm | Grows a closed shell towards the body, with rims on open edges. |

A seam's `foldAngle` holds it pressed at that angle (a hem, a collar); `shrink` below 1 gathers it like elastic. Set both with `tailorSew`.

The output mesh has two UV sets: `uv0` packs the panels into 0 to 1 with the grain upright, and `uv1` is the flat pattern at 1 unit per metre, so a fabric texture tiles at its real size. Baked meshes also carry the point attribute `clothMaxDistance`, each point's distance from the body in cm, for a runtime cloth mask such as Chaos Cloth's Max Distance.

Patterns from GarmentCode or ChatGarment (pygarment JSON) import with **Tailor > Import GarmentCode Pattern...**.
