# Tailor garments

Make clothing from sewing patterns, drape it on a body and bake it to a skinned game mesh.

> **Experimental:** Tailor is subject to change and may lose data between versions. Feedback is welcome.

## Get it working

1. **Tailor > Mannequin** adds a stand-in body, or select your own character mesh standing in +Y, facing +Z.
2. With the body selected, **Tailor > Garment from Block** builds a garment from a block (tee, tunic, cloak and others), sized to the body, and drapes it. The garment settles in the viewport while the drape runs in the background.
3. **Tailor > Bake to Game Mesh** makes a plain mesh from the drape. If the body is skinned, the baked mesh is bound to the same joints with weights copied from the body.

```python
body = tailorMannequin(height=175, chest=100)
mesh, garment = tailorCreateBlock(block='cloakTunicBelt', collider=body, wait=True)
tailorBake(mesh, retopo=3000, lods=2)
```

## Pick a starting pattern

Blocks cover the common garments: `tee`, `tunic`, `robe`, `shirt`, `dropShoulderTop`, `peasantBlouse`, `puffBlouse`, `poetShirt`, `bellSleeveDress`, `flutterTop`, `capSleeveTop`, `batwingTop`, `legOfMuttonBlouse`, `raglanTee`, `marieBlouse`, `flounceSleeveTop`, `slitSleeveTop`, `tieredSleeveBlouse`, `petalSleeveTop`, `capeSleeveTop`, plus trousers, skirts, hoods, cloaks and more. Any top takes a `sleeveStyle`: 0 set-in, 1 cuffed, 2 bishop, 3 bell, 4 puff, 5 cap, 6 flutter, 7 leg-of-mutton, 8 poet, 9 drop-shoulder, 10 batwing, 11 raglan, 12 marie, 13 flounce, 14 slit, 15 tiered, 16 petal, 17 cape.

```python
tailorCreateBlock(block='tee', collider=body, params={'sleeveStyle': 9, 'dropShoulder': 0.1})
```

Sleeve caps are drafted to fit their armhole: the cap's length is the armhole's plus the style's ease, so a set-in sleeve eases in smoothly and a puff gathers.

## Check the pattern

**Tailor > Pattern Editor** lists what a pattern maker would flag, each with what to change: a sleeve cap shorter than its armhole or with too much ease, a flat dropped-shoulder cap on a shoulder that isn't dropped, seam sides that don't match, too little ease round the chest for the body, crossed outlines, panels too small for the cloth, grain off true. Click a finding to see the panel or seam. `tailorCheck` returns the same list, and the `tailor` validator puts it on the garment mesh as diagnostics.

## Edit the pattern

- **Tailor > Pattern Editor** shows the selected garment's panels flat. Drag points to reshape, double-click an edge to add a point, Delete removes the hovered point. Seams show in matching colours; a red label means the two sides differ in length.
- In **Sew** mode, click two edges to sew them; Shift on the second click sews them the same way round. Right-click an edge to unsew it.
- **Tailor > Draw Panel on Body** draws a new panel straight onto the body: click around it, press Enter. M mirrors it across the body.
- **Tailor > Live Drape** keeps the garment simulating, so edits show as you make them. **Tailor > Grab Cloth** pulls it around in the viewport.

## Animate it

Turn on **animate** on the garment node to simulate it over the timeline against the body as it moves (skinned or keyed). It starts draped at **startFrame**, caches each frame like other simulations, and scrubs back from the cache. Export the result for a game or a cutscene:

```python
tailorExportAnimation('Cloak', end=120, path='anim/cloak.abc')  # Unreal Geometry Cache
tailorExportAnimation('Cloak', end=120, format='vat')            # vertex animation textures
```

`tailorRefit(garment, collider='Hero')` moves a garment onto another body, grading the pattern by the two bodies' measurements.

## Troubleshooting

**The garment doesn't fit the body.** Blocks read height and chest, waist, hip, neck and head girths from horizontal slices of the body. A body lying down, facing another axis, or with arms fused to the torso reads wrong. Stand it in +Y facing +Z, or pass `fit=False` and use the default 180 cm body.

**The mesh stays flat and undraped.** The drape is still running (see the progress bar), or **simulate** is off on the garment node. In scripts, pass `wait=True` to get the finished drape back.

**Cloth pokes through the body.** Lower **particleDistance** for a finer cloth mesh, or raise **frames** and drape again with **Tailor > Drape**.

**Bake didn't skin the mesh.** The body has no skinCluster. Skin it, then bake again.

**A latched render mesh stopped following.** The garment was re-meshed after binding (a pattern edit or a new particle distance). Bind it again.

**An animated garment lags or stays put.** Frames simulate when Lila is idle; `simulate('TailorGarment', frame=120)` runs them now.

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
| `fitMap` | off | Colours the drape red where the cloth stretches past its pattern and blue where it bunches; show it with vertex colours. |
| `animate`, `startFrame` | off, `0` | Simulates over the timeline from that frame. |

A seam's `foldAngle` holds it pressed at that angle (a hem, a collar); `shrink` below 1 gathers it like elastic. Set both with `tailorSew`.

The output mesh has two UV sets: `uv0` packs the panels into 0 to 1 with the grain upright, and `uv1` is the flat pattern at 1 unit per metre, so a fabric texture tiles at its real size. Baked meshes also carry the point attribute `clothMaxDistance`, each point's distance from the body in cm, for a runtime cloth mask such as Chaos Cloth's Max Distance.

To dress the cloth in a thicker or separately modelled mesh (a sculpted coat, a retopologised game mesh), latch it to the cloth: `tailorBindRenderMesh('Cloak', mesh='SM_Cloak')`. Every point of the mesh follows its nearest cloth triangle with its offset kept, like APEX's latch to nearest, live drapes included. Freeze both meshes' transforms first.

Patterns from GarmentCode or ChatGarment (pygarment JSON) import with **Tailor > Import GarmentCode Pattern...**.
