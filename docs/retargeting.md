# Retargeting

Copy animation from one skeleton onto another: a mocap file onto your character, a UE5 Manny clip onto a cartoon rig, or a person's walk onto a dog or a spider. The result is plain keys on the target's joints, in a take, ready for Unreal.

## Get it working

1. Have both skeletons in the scene, or only the target if the animation is in `.bvh` or `.fbx` files.
2. Select a joint of the source, then a joint of the target, and run **Animation > Retarget Animation**.
3. Pick **Files...** instead of a source skeleton to retarget files: each becomes its own take, named after the file.
4. Press **Preview**. The target is keyed and the dialog stays open; scrub to check. **Retarget** keeps it, **Close** takes it back.

The first run characterizes both skeletons (finds the pelvis, spine, limbs, fingers and tail from joint names, else from shape), maps their chains, lines the target's pose up with the source's and plants the feet. It leaves a retargeter node behind, so later runs reuse it and **Open Retargeter** shows every setting.

```python
retarget(source="Hips", target="pelvis")
retarget(target="pelvis", folder="D:/mocap/walks")
```

## Different bodies

When the source and target have different numbers of legs, Lila retargets the motion as a gait: the body moves as the source's does, scaled to the target's legs, and each leg takes a source leg's steps shifted in time. A biped walk on a dog trots or walks; on a beetle it becomes tripods; on a spider, alternating groups of four.

Set **Bodies** to **Different body** to force it, and **Gait** to choose: `walk`, `trot`, `pace`, `canter`, `gallop`, `tripod`, `tetrapod` or `wave`. Spines, necks, heads and tails bend as the source's do; tails and parts the source doesn't have keep their pose.

```python
retarget(source="Hips", target="dog_pelvis", gait="trot")
```

## Troubleshooting

**A chain is missing or wrong.** Select the skeleton in the pose you want compared (standing, arms out or down) and run **Animation > Characterize Skeleton** again. Fix single chains on the **Rigs** tab of the Retargeter panel, or with `editRetargetRig("pelvis", chain={"name": "Tail", "role": "tail", "start": "tail_01", "end": "tail_08"})`. The report lists what characterizing found doubtful.

**The report says a limb misses its goal.** The target's arm or leg is shorter, relative to its size, than the source's. Lower **Extension** on that chain's IK, raise **Blend to source**, or leave **Full body** on so the pelvis and spine give.

**Arms bend the wrong way.** Turn up **Pole matching** on the chain's FK.

**The target's arms are off by a constant angle.** The two skeletons were in different poses when compared. Press the align button in the Retargeter panel, or pose both the same and press the capture button.

**Feet slide.** Feet plant where the source's slow down near the floor. Raise **Speed threshold** or **Height tolerance** on the leg's **Plant** settings.

**A BVH comes in the wrong size.** BVH files have no units. Pass `scale` (`importBvh(path, scale=2.54)` for inches).

## Options

The Retargeter panel (**Windows > Editors > Retargeter**) holds every setting of a retargeter, in the same terms and order as Unreal's IK Retargeter: chain mapping, FK and IK per chain, root, stride warping, pinned bones, hand contacts and curve copying. `editRetargeter(name, query=True)` returns them as JSON; `editRetargeter(name, chain={"target": "LeftLeg", "ik": {"extension": 0.97}})` changes one.

| Setting | Default | What it does |
| --- | --- | --- |
| `fk.rotation` | `interpolated` | How a target chain samples the source's: by length fraction, joint by joint, or not at all. |
| `fk.translation` | `none` | `globallyScaled` copies the source's bone offsets scaled; `stretchUniform` stretches the target's bones. |
| `ik.extension` | `1.0` | Below 1 keeps the limb bent short of its goal. |
| `plant.enabled` | on for legs | Holds a foot still while the source's is planted, and keys the lock channel of the target's IK chain. |
| `root.affectIkVertical` | off | Off keeps feet relative to the floor rather than the pelvis. |
| `fullBody` | on | Where a limb can't reach, solves the whole body with every goal pinned. |
| `warp.warpForwards` | `1.0` | With stride warping on, lengthens or shortens steps around the pelvis. |
| `scale` | `0` | Target size over source size; `0` measures it from the legs. |
