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
ops.tailorBake(mesh)
```

## Troubleshooting

**The garment doesn't fit the body.** Blocks read height and chest, waist, hip, neck and head girths from horizontal slices of the body. A body lying down, facing another axis, or with arms fused to the torso reads wrong. Stand it in +Y facing +Z, or pass `fit=False` and use the default 180 cm body.

**The mesh stays flat and undraped.** The drape is still running (see the progress bar), or **simulate** is off on the garment node. In scripts, pass `wait=True` to get the finished drape back.

**Cloth pokes through the body.** Lower **particleDistance** for a finer cloth mesh, or raise **frames** and drape again with **Tailor > Drape**.

**Bake didn't skin the mesh.** The body has no skinCluster. Skin the body first, then bake again.

## Options

Set these on the garment node in the Attribute Editor.

| Option | Default | What it does |
| --- | --- | --- |
| `particleDistance` | `2` cm | Cloth edge length. Smaller is finer and slower. |
| `frames` | `90` | Solver frames per drape. |
| `weldSeams` | on | Merges sewn points so the garment is one connected mesh. |
| `thickness` | `0` cm | Grows a closed shell towards the body, with rims on open edges. |

The output mesh has two UV sets: `uv0` packs the panels into 0 to 1 with the grain upright, and `uv1` is the flat pattern at 1 unit per metre, so a fabric texture tiles at its real size. Baked meshes also carry the point attribute `clothMaxDistance`, each point's distance from the body in cm, for a runtime cloth mask such as Chaos Cloth's Max Distance.

Patterns from GarmentCode or ChatGarment (pygarment JSON) import with **Tailor > Import GarmentCode Pattern...**.
