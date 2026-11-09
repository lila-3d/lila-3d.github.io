# Soft Net

A net of curves drawn on a skinned mesh shapes its surface: move, turn or scale a knot where curves meet and the curves through it carry the surface with them, fading with distance. Use it for mouths, brows, cheeks and other soft shapes a skeleton doesn't reach.

> **Experimental:** Soft Net is subject to change and may lose data between versions. Feedback is welcome.

## Get it working

1. Select the skinned mesh and pick **Mesh > Plating > Layout Pencil**. In **Lines** mode, draw the net on the surface in the bind pose: where strokes meet or end becomes a knot.
2. Set the line set's output to **None**, so the lines shape the surface without cutting grooves into it.
3. With the mesh selected, pick **Rig > Soft Net** (also in **Deform**). Each knot gets a control, `SoftNet_knot1`, `SoftNet_knot2` ..., riding the surface.
4. Move a knot control. Its Z is the surface normal: translating it in Z lifts the surface along the lines through it.

```python
layout = panelLayout("Face", mirror="x")[0]
panelLayoutLineSet(layout, set="Major", output="none")
# draw the lines with the Layout Pencil, then:
net = softNet("Face", reach=4.0)
setAttr(net["knots"][0] + ".translate", 0.0, 0.0, 0.5)
```

The net sits on top of the stack, after the skin, so the knots follow the skinned surface and key like any control.

## Unreal

Bake the net into the skin before export: key the knots through a range of motion, then fit with helper bones.

```python
bakeSkinWeights("Face", source="animation", helpers=4)
```

Helper bones carry what the joints can't. The result reports the fit error (`rmse`, `maxError`, cm); add helpers until it is small enough.

## Troubleshooting

**"has no Panel Layout".** Draw the lines with the Layout Pencil first, or pass `layout=` the layout node.

**The lines cut grooves into the mesh.** The line set's output is still **Geometry**. Set it to **None**; the net never cuts the surface.

**"has nothing under the net to ride".** The mesh has no skin, modifier or layout under the net. Bind the skin first, or keep the Panel Layout on the mesh.

**Moving a knot moves too much or too little of the surface.** Lower or raise `reach`.

**"the mesh changed since the Soft Net was bound".** Its point count changed. Delete the net and its knots and make it again.

**The knot controls stay behind when the mesh object moves.** Knot frames are placed with the mesh's transform at the moment the net was made. Make the net with the mesh in its final place, usually at the origin under its skeleton.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `reach` | `0` | How far from a line the surface follows it, cm; 0 is a sixth of the mesh's size. |
| `stiffness` | `1.0` | How closely the surface meets the lines. |
| `spacing` | `0` | Distance between line samples, cm; 0 is twice the layout's. |
