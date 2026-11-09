# Bend Bones

A chain of joints becomes one smooth curve, and the mesh bound to it bends along that curve: the inside of a bend compresses evenly instead of pinching, stretching thins the mesh to keep its volume, and bone CVs reshape a bone without rebinding. Unreal gets plain joints and skin weights baked from it.

<!-- media: bend-bones.png, a bent tube bound to three joints beside the same tube on a linear skin -->

## Get it working

1. Select a chain's joints from top to end, then the mesh.
2. Run **Rig > Bind Bend Bones**. The mesh binds in its current pose.
3. Rotate a joint of the chain: the mesh bends round a smooth arc.

```python
bendBones("Leg", chains=[["thigh_l", "calf_l", "foot_l"], ["thigh_r", "calf_r", "foot_r"]])
```

Each chain is one influence, so a limb binds wholly to its chain and only the joins between chains blend. Spline chains and rubber hose limbs are bend-bone chains too, under the same **Rig > Bend Bones** section.

## Bone CVs

Select a joint and run **Add Bone CV**: a CV appears halfway along the bone to its child, and on the other side's bone (`thigh_l` and `thigh_r`). Move or key it to bow the bone; nothing is rebound. **Mirror Bone CVs** moves the other side's CVs to mirror the selected ones.

## Paint between chains

Select the mesh and open **Rig > Paint Skin Weights**. The influences listed are the chains, named after their first joint; paint the joins between them like skin weights. Inside a chain there is nothing to paint.

## Unreal

Run **Rig > Bake Bend Bones** as the last step before export. Each bone gets segment joints along its curve (3 by default), keyed on every frame of the playback range, and the mesh is skinned to them with weights fitted to the bend bones over the animation and random poses. The bend bones deformer is turned off, so the viewport shows what Unreal gets. Undo to go back to authoring.

```python
bakeBendBones("Leg", segments=4, maxInfluences=8)
```

The result reports the fit error (`rmse`, `maxError`, cm) and the Unreal round-trip check (`unrealCheck`), which flags any joint Unreal would move differently.

## Troubleshooting

**The bake's error is large.** Linear skinning can't hold the even inside of a tight bend or the volume of a stretch with few joints. Raise `segments` or `maxInfluences`.

**"is already skinned".** Bend bones bake onto a mesh they alone deform. Unbind the skin first, or bind bend bones on a copy.

**"the mesh changed since it was bound".** Its point count changed. Delete the deformer and bind again.

**"ends its chain, so it has no bone after it".** A bone CV goes on a bone's first joint; the last joint of a chain has no bone.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `volume` | `1.0` | 0 keeps the mesh's thickness as chains stretch, 1 thins it to keep the volume. |
| `evenBend` | `1.0` | 0 rides the curve, 1 spreads the inside and outside of a bend evenly. |
| `segments` (bake) | `3` | Segment joints per bone. |
| `poses` (bake) | `24` | Random poses added to the fit so the weights hold beyond the animation. |
