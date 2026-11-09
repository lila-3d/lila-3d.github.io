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

On a spline chain, **Add Bone CV** puts a point into the chain's curve at the bone's middle and gives it a control like the others; the curve's controls are rebuilt, so it refuses while one is keyed. On a rubber hose limb it selects the hose's bend control, which already does this job.

## Paint between chains

Select the mesh and open **Rig > Paint Skin Weights**. The influences listed are the chains, named after their first joint; paint the joins between them like skin weights. Inside a chain there is nothing to paint.

## Unreal

Run **Rig > Bake Bend Bones** as the last step before export. Each bone gets segment joints along its curve (3 by default), keyed on every frame of the playback range, and the mesh is skinned to them with weights fitted to the bend bones over the animation and random poses. The bend bones deformer is turned off, so the viewport shows what Unreal gets. Undo to go back to authoring.

```python
bakeBendBones("Leg", segments=4, maxInfluences=8)
```

The result reports the fit error (`rmse`, `maxError`, cm) and the Unreal round-trip check (`unrealCheck`), which flags any joint Unreal would move differently. A mesh skinned to spline chain or hose joints is already joints: **Bake Bend Bones** on it runs the Unreal check alone.

### Live in Unreal

To bend the mesh in Unreal exactly as it bends here, rather than with the baked skin, run `unrealBendBones` after exporting the baked mesh. LilaLink binds every LOD of the skeletal mesh to the chains and makes the **Lila Bend Bones** Deformer Graph (`/Game/Lila/DG_LilaBendBones`) its default deformer. The baked skin stays the fallback wherever the deformer doesn't run.

```python
exportFbx("Leg.fbx", "root", "Leg", kind="skeletal", deformOnly=False)
unrealBendBones("Leg", skeletalMesh="/Game/Characters/Leg")
```

Export with `deformOnly=False`: the bake leaves the chain joints and bone CVs unskinned, and the deformer needs them in Unreal. Each bone CV goes as a bone named after it, so moving or keying it bends the mesh there as it does here. The result reports how many vertices were bound and matched a Lila point (`matched`, and per LOD in `lods`), and how far the reference pose sits from Lila's rest (`restError`, cm).

## Troubleshooting

**The bake's error is large.** Linear skinning can't hold the even inside of a tight bend or the volume of a stretch with few joints. Raise `segments` or `maxInfluences`.

**"is already skinned".** Bend bones bake onto a mesh they alone deform. Unbind the skin first, or bind bend bones on a copy.

**"the mesh changed since it was bound".** Its point count changed. Delete the deformer and bind again.

**"has no bone named ... export the skeleton with deformOnly off".** The chain joints didn't reach Unreal. Export again with `deformOnly=False`.

**unrealBendBones warns that vertices have no Lila point.** The mesh in Unreal isn't the exported bind pose mesh (it was edited, or exported in another pose). Those vertices take the nearest chains' weights. Export the mesh again in its bind pose.

**A lower LOD bends a little differently.** Its vertices that aren't on a Lila point take the nearest point's chain weights; `lods` in the result says how many matched. Generate LODs from the bind pose mesh to keep them close.

**"bone CV ... isn't in the skeleton".** The CV didn't reach Unreal, so it rides its bone as at rest. Export again with `deformOnly=False`.

**"ends its chain, so it has no bone after it".** A bone CV goes on a bone's first joint; the last joint of a chain has no bone.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `volume` | `1.0` | 0 keeps the mesh's thickness as chains stretch, 1 thins it to keep the volume. |
| `evenBend` | `1.0` | 0 rides the curve, 1 spreads the inside and outside of a bend evenly. |
| `segments` (bake) | `3` | Segment joints per bone. |
| `poses` (bake) | `24` | Random poses added to the fit so the weights hold beyond the animation. |
