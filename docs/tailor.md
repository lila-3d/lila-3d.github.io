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

`onesie` is a one-piece suit: top, trousers, hood and booties sewn together, cut from the `Plush` fabric (`Fleece` is a lighter option). Seam 0 runs down the centre front, ready for a zip. `'tail': 1` adds a stuffed tail out of the small of the back; `tailStiffness` 0 lets it hang limp. `booties` makes the feet on their own.

```python
tailorCreateBlock(block='onesie', collider=body, params={'tail': 1, 'tailLength': 0.8}, frames=400, wait=True)
tailorAddZip('Onesie', seam=0, open=0.2)
```

## Check the pattern

**Tailor > Pattern Editor** lists what a pattern maker would flag, each with what to change: a sleeve cap shorter than its armhole or with too much ease, a flat dropped-shoulder cap on a shoulder that isn't dropped, seam sides that don't match, too little ease round the chest for the body, crossed outlines, panels too small for the cloth, grain off true. Click a finding to see the panel or seam. `tailorCheck` returns the same list, and the `tailor` validator puts it on the garment mesh as diagnostics.

## Edit the pattern

- **Tailor > Pattern Editor** shows the selected garment's panels flat. Drag points to reshape, double-click an edge to add a point, Delete removes the hovered point. Seams show in matching colours; a red label means the two sides differ in length.
- In **Sew** mode, click two edges to sew them; Shift on the second click sews them the same way round. Right-click an edge to unsew it.
- **Pen** draws a new panel: click points, drag to curve through one, then click the first point or press Enter. **Notch** marks a point on an edge; seams with the same number of notches on both sides sew notch to notch.
- Right-click an edge for **Add Dart Here**; right-click a panel for **Mirror Panel (Linked)**, a mirrored copy whose outline follows every edit to either one.
- **Auto-Sew** sews the unsewn edges that match in length and face each other where the panels are placed, plus edges that both open upwards over the body, like shoulders. Hems, necklines and armholes stay open.
- Clicking a panel selects its faces on the garment mesh; selecting faces there picks their panel here. The **Tailor** layout docks the editor beside the viewport with the Tailor shelf.
- **Tailor > Draw Panel on Body** draws a new panel straight onto the body: click around it, press Enter. M mirrors it across the body. The panel is flattened as the body curves under it, so its lengths are true on the body, and it is sewn to the panels it meets.
- **Tailor > Live Drape** keeps the garment simulating, so edits show as you make them. **Tailor > Grab Cloth** pulls it around in the viewport.

## Shape the drape

With a garment selected, paint on it in the viewport. **[** and **]** size the brush; Shift reverses it.

- **Pin Cloth** holds the cloth where it hangs, through every later drape. Pins ride the body, so on an animated garment they move with it.
- **Fold Cloth** presses a fold line along the stroke.
- **Shrink Cloth** gathers the cloth's rest shape (Shift stretches it).
- **Steam Cloth** smooths a live garment as you drag.

**Tailor > Clear Brushes** removes what they painted.

## Add details

```python
tailorAddTrim('Coat', shape='button', points=[[0, 130, 16], [0, 118, 17]])  # rigid pieces riding the cloth
tailorAddTrim('Onesie', mesh='Spine', along='Hood L:1:12', count=5)          # along an edge
tailorAddPocket('Shirt', panel='Front', position=[5, 30], flap=True)
tailorAddCollar('Shirt')                                                     # style='band' for a stand collar
tailorAddBeltLoops('Trousers', panel='Front L', height=68, count=2)
tailorAddDrawstring('Cloak', along='Hood L:5:9,Hood R:2:6', gather=0.7)     # with toggles on the tails
tailorAddLacing('Bodice', sideA='Back L:1:2', sideB='Back R:3:0', pairs=8)   # with grommets
tailorAddZip('Jacket', seam=4, open=0.3)                                     # teeth and slider, open past the slider
tailorDamage('Cloak', points=[[5, 90, -20]], radius=4)                       # kind='tear' for a slit
tailorStrap('Tunic', curve='BeltPath', closed=True, width=5)                 # a belt or sash along a path
tailorAddStitching('Jeans', preset='denim')                                  # topstitching on every seam
tailorAddStitching('Onesie', along='Hood L:2:5', pattern='blanket', inset=0) # round a hem
```

Built-in trims are `button`, `grommet`, `rivet`, `toggle`, `buckle`, `zipTooth` and `slider`. Your own trim (eyes, teeth, spines): model it at the origin, cm, with +Z facing out of the cloth, and pass `mesh=`. `along='Hood L:0:6'` spaces copies along edges instead of at points, each turned to follow the edge; `scale` sizes them. Each copy rides the cloth at its middle without bending. Pockets, belt loops and the collar are also on the Pattern Editor's right-click menu.

**Tailor > Add Stitching** sews thread along every seam of the selected garment, both sides, `inset` cm in from the seam; `seams=[0, 3]` and `seamSide='a'` narrow it down. Rows are laid out on the flat pattern, so their spacing holds however the cloth drapes, and the thread bends with the cloth. The stitch settings and presets are the same as **Curves > Stitch**. Sides like `'Hood L:5:9'` are panel, first and last outline point, as **Sew** mode and `tailorSew` use.

## Animate it

Turn on **animate** on the garment node to simulate it over the timeline against the body as it moves (skinned or keyed). It starts draped at **startFrame**, caches each frame like other simulations, and scrubs back from the cache. Export the result for a game or a cutscene:

```python
tailorExportAnimation('Cloak', end=120, path='anim/cloak.abc')  # Unreal Geometry Cache
tailorExportAnimation('Cloak', end=120, format='vat')            # vertex animation textures
```

`tailorRefit(garment, collider='Hero')` moves a garment onto another body, grading the pattern by the two bodies' measurements. Set-in sleeve caps keep their ease to the armhole.

## Send it to Unreal

With LilaLink connected, one command makes a Chaos Cloth Asset from the sewing pattern itself: the panels become its sim patterns, the seams are sewn, and the drape is its rest shape, with Max Distance painted from how far the cloth hangs off the body and the fabric's mass, stiffness, damping and friction. Open it in the Cloth Editor, or put it on your character with a Chaos Cloth Component:

```python
tailorSendToUnreal('Cloak', contentPath='/Game/Characters/Hero/CA_Cloak', skeletalMesh='/Game/Characters/Hero/SK_Hero')
```

`as='skeletalMesh'` instead bakes the garment, imports it as a skeletal mesh skinned like the body and adds clothing data to it; that needs a skinned body.

For a garment that holds its drape with no cloth at runtime (stylized characters), choose **Skinned Mesh, No Cloth** in the **Tailor > Send to Unreal** options, or pass `as='skinnedMesh'`. It's baked and skinned the same way, with no clothing data. To bake it in Lila without the cloth mask, turn off **Cloth Mask** in **Bake to Game Mesh** (`clothMask=False`).

### Wrinkles that follow the motion

Drapes carry a `wrinkle` colour set: compression along the pattern's U in red and V in green. Lila's tension deformer writes the same set on any skinned mesh. `tailorBakeWrinkleMaps` simulates the fabric squeezed each way and writes two tiling wrinkle normal maps; with `send=True` it imports them and builds `MF_LilaTensionWrinkles` in Unreal:

```python
tailorBakeWrinkleMaps('Coat', send=True)                  # material=True also builds M_LilaTensionWrinkles
```

Drop the function into your own material: connect your normal to **Normal** and the vertex colour's red and green to **Mask**, then its **Normal** output to the material's Normal. **Folds** says how folded the cloth is there, for darkening or roughening it. Alembic exports of animated garments carry the colour set per frame.

To bake texture maps from the drape onto the game mesh, pass `maps` to `tailorBake`: `tailorBake('Cloak', retopo=3000, maps=['normal', 'ao', 'id'])`. The `id` map colours each panel.

## Troubleshooting

**The garment doesn't fit the body.** Blocks read height and chest, waist, hip, neck and head girths from horizontal slices of the body. A big cartoon head is fine: the neck is found from the slices and everything below it is sized from there. If the garment still sits too high or low, give the neck's height above the feet: `tailorCreateBlock(block='onesie', collider=body, neck=62)`. A body lying down, facing another axis, or with arms fused to the torso reads wrong. Stand it in +Y facing +Z, or pass `fit=False` and use the default 180 cm body.

**The mesh stays flat and undraped.** The drape is still running (see the progress bar), or **simulate** is off on the garment node. In scripts, pass `wait=True` to get the finished drape back.

**Cloth pokes through the body.** Lower **particleDistance** for a finer cloth mesh, or raise **frames** and drape again with **Tailor > Drape**.

**Bake didn't skin the mesh.** The body has no skinCluster. Skin it, then bake again.

**A latched render mesh stopped following.** The garment was re-meshed after binding (a pattern edit or a new particle distance). Bind it again. Trims bind again on their own. Stitching is laid out on the pattern as it was: delete it and add it again.

**Auto-Sew misses a seam.** It sews edges that face each other within `maxGap` (8 cm) as placed, or that both open upwards with the body under them. Move the panels closer, or sew the pair in **Sew** mode. Edges that hang open facing each other, like a poncho's sides, get sewn: unsew them.

**A brush stroke does nothing.** The stroke missed the cloth, or the garment isn't selected. Pin, Fold and Shrink need the drape under the cursor; Steam needs the garment live.

**tailorSendToUnreal fails.** It needs LilaLink connected (`unrealConnect`) with a LilaLink build that has the cloth methods (rebuild the plugin after updating Lila). `as='skeletalMesh'` and `as='skinnedMesh'` also need a skinned body.

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
| `live` | off | Keeps the garment simulating in real time. |

A seam's `foldAngle` holds it pressed at that angle (a hem, a collar); `shrink` below 1 gathers it like elastic. Set both with `tailorSew`.

The output mesh has two UV sets: `uv0` packs the panels into 0 to 1 with the grain upright, and `uv1` is the flat pattern at 1 unit per metre, so a fabric texture tiles at its real size. Baked meshes also carry the point attribute `clothMaxDistance`, each point's distance from the body in cm, for a runtime cloth mask such as Chaos Cloth's Max Distance.

To dress the cloth in a thicker or separately modelled mesh (a sculpted coat, a retopologised game mesh), latch it to the cloth: `tailorBindRenderMesh('Cloak', mesh='SM_Cloak')`. Every point of the mesh follows its nearest cloth triangle with its offset kept, like APEX's latch to nearest, live drapes included. Freeze both meshes' transforms first.

Patterns from GarmentCode or ChatGarment (pygarment JSON) import with **Tailor > Import GarmentCode Pattern...**.
