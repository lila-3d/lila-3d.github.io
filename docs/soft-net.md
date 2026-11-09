# Soft Net

A net of curves drawn on a skinned mesh shapes its surface: move, turn or scale a knot where curves meet, or pull one of its tangent handles, and the curves through it carry the surface with them, fading with distance. Use it for mouths, brows, cheeks and other soft shapes a skeleton doesn't reach.

> **Experimental:** Soft Net is subject to change and may lose data between versions. Feedback is welcome.

## Get it working

1. Select the skinned mesh and pick **Mesh > Plating > Layout Pencil**. In **Lines** mode, draw the net on the surface in the bind pose: where strokes meet or end becomes a knot. For a mouth or an eye, turn on **Loop Spokes** in the palette's **Pencil** section and draw a closed loop: spokes run out from it, crowded toward its corners.
2. Set the line set's output to **None**, so the lines shape the surface without cutting grooves into it.
3. With the mesh selected, pick **Rig > Soft Net** (also in **Deform**). The knots appear under `SoftNet_knots`, riding the surface.
4. Move a knot. Its Z is the surface normal and its X follows the lines through it: translating in Z lifts the surface along those lines.

```python
layout = panelLayout("Face", mirror="x")[0]
panelLayoutLineSet(layout, set="Major", output="none")
# draw the lines with the Layout Pencil, then:
net = softNet("Face", reach=4.0)
softNetPose(net["knots"][0], translate=[0, 0, 0.5], mirror=True)
```

The net sits on top of the stack, after the skin, so the knots follow the skinned surface and key like any control. The knots follow the mesh object when it moves.

## Knots and handles

- Junctions (three or more lines) and line ends show by default. Knots inside a line are hidden: **Rig > Show All Soft Net Knots** shows them, or set `showAllKnots` on `SoftNet_knots`.
- Each line end has a tangent handle under its knot, a third of the way along the line. Move it to bend the line between its knots like a Bezier handle.
- On a mirrored layout, knots pair across the mirror and end in `_l` and `_r`. **Rig > Mirror Soft Net Knots** copies the selected knots' poses to their partners; on the whole net it copies the + side over the - side.

## Garments and props

Bind other meshes to the same lines and they move with the body:

```python
softNet("Body", meshes=["Shirt", "Belt"])
```

Each mesh needs something in its stack under the net (a skin, a modifier or a Panel Layout).

## Limbs

**Rig > Soft Net Limb Stations** lays rings round a limb and rails along it, following a curve or a joint chain (select the mesh, then the chain). Then make the net as usual.

```python
softNetLimbStations("Body", spine="upperarm_l", rings=5, rails=4)
softNet("Body")
```

## Change the lines

Edit the Panel Layout, then pick **Rig > Rebind Soft Net**. Knots on junctions that are still there keep their values and keys; new junctions get knots and removed ones lose theirs.

## Unreal

**Rig > Soft Net to Unreal** offers three ways:

| Route | What Unreal gets | Use for |
| --- | --- | --- |
| **Bake** (default) | Knot and handle joints as bones, skin weights fitted to the net, helper joints and keyed morph correctives for what is left. Any export carries it. | Games |
| **Live** | The net runs on the GPU as the Lila Soft Net Deformer Graph, after linear skinning, driven by the knot bones. | Animating the net in Unreal |
| **Cache** | The deformed mesh as an Alembic or vertex animation cache. | Cinematics |

```python
softNetUnreal("Face", route="bake", helpers=4, correctives=8)
unrealSoftNet("Face", skeletalMesh="/Game/Face/Face")
```

Bake reports `rmse` and `maxError` in cm against the net, per-frame worst errors in `frameError`, and the Unreal round-trip check. For **Live**, export the skeleton with **deformOnly** off so the knot joints go too, then run it with Unreal connected: LilaLink binds every LOD and turns on high-precision skin weights.

## Troubleshooting

**"has no Panel Layout".** Draw the lines with the Layout Pencil first, or pass `layout=` the layout node.

**The lines cut grooves into the mesh.** The line set's output is still **Geometry**. Set it to **None**; the net never cuts the surface.

**"has nothing under the net to ride".** The mesh has no skin, modifier or layout under the net. Bind the skin first, or keep the Panel Layout on the mesh.

**Moving a knot moves too much or too little of the surface.** Lower or raise `reach`.

**"the mesh changed since the Soft Net was bound".** Its point count changed. Run **Rig > Rebind Soft Net**.

**The first knot move pauses.** The net works out each point's response the first time a knot leaves rest: about two seconds on a 50,000-point mesh. Later moves are quick.

**"has no skin to bake into".** Bake needs a skinned mesh. Use the **Cache** route for an unrigged one.

**Live: "has no bone named ..._frame".** The skeleton went out without the Soft Net joints. Export again with **deformOnly** off.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `reach` | `0` | How far from a line the surface follows it, cm; 0 is a sixth of the mesh's size. |
| `stiffness` | `1.0` | How closely the surface meets the lines. |
| `spacing` | `0` | Distance between line samples, cm; 0 is twice the layout's. |
| `maxDistance` | `0` | How far a garment may lie from a line and still follow it, cm; 0 is half the reach. |
