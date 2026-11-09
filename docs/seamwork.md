# Seamwork (contacts)

Find every place a wall meets the terrain or two meshes cut through each other, then cover the joins with rubble, grime strips, material blends or a blend mesh. Everything renders the same in Unreal's deferred, desktop forward and mobile forward renderers.

<!-- capture: wall on terrain with a contact skirt and rubble, Contacts overlay on -->

## Get it working

1. Select the walls, rocks and props, then pick **Level > Contacts > Find Contacts**. Lila finds where they cut through the terrain and each other, and where they sit within 2 cm of it. **Display > Contacts** shows the joins: ground joins in orange, joins between objects in blue.
2. Cover them with one or more of:
   - **Scatter Along Contacts**: rubble, gravel, grass tufts, moss, roots, snow drifts or leaf litter wedged into the join.
   - **Contact Strips**: a grime or moss strip lying along the join.
   - **Contact Skirt**: a blend mesh that rounds over the join and fades from the wall's material into the ground's.
3. Move a wall: the contacts, strips, skirts and blend fields follow.
4. **Level > Contacts > Send Contacts to Unreal** sends the materials, a tagged spline per contact and PCG point data.

```python
seamFind(['Wall', 'Rock_01'])
seamScatter('contacts', preset='rubble')
seamSkirt('contacts', width=40)
seamSend('contacts')
```

Every command is undoable and returns stats: contact count and length, pairs found, instances placed, which skirt method ran on each contact.

## What a contact carries

`seamFind` makes a live `contacts` node with the joins as ordinary curves and a points mesh along them. Each point carries both objects and their normals, the wedge angle (90 for a wall on flat ground), how deep one goes into the other, the gap, how much it faces up, sky exposure and the terrain layer there. Seam Points and Distribute Along Seam in Geometry Nodes read them, so you can build your own scatter.

It also writes a blend weight into each mesh, in the red channel of its vertex colour by default (`field='uv'` writes a UV set instead), and a `contact` mask on the terrain that layer rules read like any other mask:

```python
terrainMaterialRules('Ground', set={'name': 'dirt', 'when': {'contact': [0.3, 1]}})
```

To keep a deliberate overlap out, select it and pick **Level > Contacts > Ignore in Contacts**. **Use as Ground** treats any mesh as ground, such as a floor slab.

## Contact skirts

The skirt is a mesh over the join, one per object. Its borders lie exactly on the wall and the ground and copy their normals, so it disappears at its edges. Each vertex carries `side` (0 at the wall, 1 at the ground) and the terrain's colour.

`method='auto'` sweeps a fillet along joins that turn less than 25 degrees (columns, rocks, straight walls) and uses a boolean union with a fillet for the rest, such as wall footprints with corners. A union skirt rounds each outer wall corner, as if a ball rolled round it. The result lists the method used on each contact, and why.

## Unreal

Rebuild LilaLink from Lila's `ue/LilaLink` once. For PCG data, also copy `ue/LilaLinkPCG` next to it and enable it.

`seamSend` builds a material function and a material for each feature. Drop the function into your own material, or use the generated one:

| Function | Generated material | Assign to |
| --- | --- | --- |
| `MF_LilaContactMask` | `M_LilaContactMask` | Meshes with a blend field: grime, moss or a wet line at the base. |
| `MF_LilaSeamStrip` | `M_LilaSeamStrip` (masked), `M_LilaSeamStripTranslucent` | Strip meshes (slot `LilaSeamStrip`). |
| `MF_LilaSkirtBlend` | `M_LilaSkirtBlend` | Skirt meshes (slot `LilaSkirtBlend`). Feed the wall's material into `WallBaseColor`. |

- Strip and skirt meshes sent after `seamSend` get the generated material in those slots on their own; send them again to pick it up.
- None of them read the GBuffer, DBuffer, scene colour or depth. On mobile (ES3.1) the skirt drops its noise and the contact mask drops its depth dither; the rest is identical.
- The skirt's ground side uses the terrain colour baked into its vertices. To blend with a Runtime Virtual Texture instead, feed an RVT sample into `GroundBaseColor`.
- Skirts get non-Nanite LODs and collision; Nanite follows the object's own setting.
- To match the contact mask to Lila's field: `field='color'` with channel `r` is `ContactChannel` 0; `field='uv'` with `uvSet=2` is `ContactFromUV` 1.
- Each contact arrives as a spline actor under `Lila/Contacts/<name>`, with tags such as `lila.kind:ground`, `lila.a:Wall` and `lila.angle:90.00`.
- The PCG asset `/Game/LilaLink/Contacts/PCG_<name>` has a Points pin (rotated into the join, with every contact attribute) and a Splines pin. Load it with a Load Data Asset node in your PCG graph to spawn along contacts.
- `terrainSendToUnreal` sends the terrain's `contact` mask as its own paint layer, `contact`, for your landscape material or PCG to read.
- Each object gets a blend ID in custom primitive data, so a project already using a screen-space mesh blending tool needs no setup; the result names the slot.

### Decal strips

Strips are meshes by default and work in every renderer. `decals='dbuffer'` sends decal actors instead, for desktop forward and deferred only. `decals='actor'` sends decal actors for mobile forward and needs a [ForwardLevelUp](https://github.com/Vaei/ForwardLevelUp) engine build with `r.Mobile.ClusteredDecals 1`; without it the command says so and sends nothing.

### Godot, Unity, USD

`seamExport('contacts', file='contacts.json')` writes every contact with its per-point facts; a `.usda` file gives one BasisCurves prim per contact and a Points prim with primvars.

## Troubleshooting

**A contact is missing.** Joins further apart than `gap` (2 cm) aren't contacts. Raise `gap`, or check the object isn't tagged with **Ignore in Contacts**.

**Strips, skirts or fields didn't follow a move in a script.** Fields refresh when the app is idle. In scripts and batch, call `seamUpdate()` after moving things.

**`seamSend` skipped the PCG data.** LilaLinkPCG isn't enabled, or LilaLink is older than this version of Lila. The result says which.

**The skirt says a union failed and it swept instead.** The union can't fillet against one huge face, such as a floor slab made of a single polygon. Subdivide the floor or use `method='sweep'`.

**The skirt shows the wall in grey or the wrong colour.** `MF_LilaSkirtBlend` needs the wall's material in `WallBaseColor`. Build the skirt material from a copy of the wall material.

**Large terrains are slow.** Terrains over 4 million samples are read as a mesh, which is exact but slower; the result says so.

**Floating props.** `seamCheck()` lists objects hovering over the ground by more than `tolerance`, and joins nothing covers.

## Options

| Option | Command | What it does |
| --- | --- | --- |
| `width`, `falloff`, `noise` | Find Contacts | Blend band width in cm, its falloff and world-space noise. Each mesh can override them on its contact field modifier, and painted vertex alpha hides the blend. |
| `crease` | Find Contacts | Also find concave corners that touch without crossing (rock stacks, wall corners). Traced on the GPU with the Baker's ambient occlusion; batch runs trace on the CPU and say so. |
| `terrainWidth` | Find Contacts | Width of the terrain's `contact` mask (100 cm). |
| `preset`, `items`, `density`, `side`, `settle` | Scatter Along Contacts | What to place, how much, which side, and whether Stagehand settles it. |
| `side`, `blend`, `tile` | Contact Strips | Ground, wall or both; masked or translucent; cm per texture repeat. |
| `width`, `radius`, `method` | Contact Skirt | Band width, fillet radius, and `auto`, `union` or `sweep`. |

`scatterProximity` repels, shrinks, tilts or culls any scatter's instances near chosen objects, Stagehand's included:

```python
scatterProximity('Rocks', rules=[{'kind': 'repel', 'target': 'Wall', 'radius': 150}])
```

In a terrain spec, `seams` finds and covers contacts once the terrain is built: `seams: {objects: ['Wall', 'Rock_01'], skirt: {width: 40}, decal: true, scatter: {preset: 'rubble'}}`, or `seams: true` for every visible mesh.
