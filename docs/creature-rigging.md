# Creature rigging

Tools for rigs beyond a plain biped: props pinned to moving surfaces, curves you pose with controls, spline IK for spines, tails and tentacles, rubber hose limbs and fingers, joint limits, rig math, follow-through on chains, and a check that everything reaches Unreal as you see it in Lila.

## Pin a prop to a mesh or curve

1. Select the prop (or joint), then the mesh or curve, and run **Rig > Pin**.
2. The prop follows that spot of the surface or curve as it deforms. Pin the same prop again to a second spot and the pins blend by weight, like a parent constraint with two targets.
3. Before sending to Unreal, select the pins and run **Rig > Bake Pins to Joints**. A pinned joint gets plain keys; a pinned prop gets a socket on the nearest bone (or a keyed bone if it moves against that bone), and LilaLink attaches it there.

```python
pin("sword", "Body", source="surface")
pin("lantern", "rope_curve", curveMode="fraction", along=0.75)
```

## Pose a curve with controls

Select a curve and run **Rig > Curve Controls**: a control appears at each point, and moving it moves the curve and everything built on it. **Remove Curve Controls** takes them away and keeps the shape. Dragging a driven point in component mode moves its control.

## Spline IK

1. Select the first and last joint of a run (a spine, tail or tentacle) and run **Rig > Spline Chain**. A curve with controls is made for it, or select a curve as well to use yours.
2. Move the controls; the joints follow the curve.
3. Tune it with `editSplineChain`: `lengthMode` (`keepLength` slides joints along the curve at their own length, `stretch` spreads them, `squash` stretches and thins), `slide`, `twistStart`, `twistEnd`, `roll`, `volume`.

```python
splineChain("tail_01", "tail_12", lengthMode="keepLength")
editSplineChain("tail_01_spline", twistEnd=90, slide=0.1)
```

### Follow-through

`splineDynamics("tail_01_spline")` makes the chain trail and overshoot as the body moves, on top of your animation. `mode="jolt"` simulates it as linked bodies that collide with the meshes in `colliders`; `drive="full"` lets it hang under gravity instead of following the animation. A chain on a riding character gets `carrier="saddle"`, so the horse's motion swings it. Record and bake it like the other simulations.

## Rubber hose limbs and fingers

1. Select the shoulder and the wrist (or hip and ankle) and run **Rig > Rubber Hose Limb**. A bendy chain of hose joints replaces the limb, and the mesh's weights move onto it.
2. **Hose** on the new `hoseLimb` blends between the jointed limb (0) and a smooth arc (1); **Auto Arc** bows the limb instead of folding it as the hand comes in. Move the bend control at the elbow to shape the arc.
3. Select the finger base joints and run **Rig > Rubber Hose Fingers** for `curl` and `spread` per finger, plus `curl`, `spread` and `fist` on the hand.

In the Rig Templates panel, the limbs dropdown next to Build Skeleton picks **Jointed Limbs** or **Rubber Hose Limbs** for a template's arms and legs.

## Joint limits

Select joints and set limits with `ikLimit`: `type="hinge"` with `axis`, `min` and `max` for knees and elbows, `type="cone"` with `cone` for shoulders and hips, plus `stiffness` and a preferred angle that picks the bend. Every IK solver and full-body posing keep to them. Selected joints show their limits; drag the dots to change them. **Rig > Show All IK Limits** shows every joint's. UE5 Manny's template comes with human limits.

```python
ikLimit("calf_l", "calf_r", type="hinge", axis="y", min=-150, max=5)
```

## Rig math

Every math function a rig needs, from Unreal's math library under Unreal's names, is a node: `mapRangeClamped`, `vlerp`, `quatToSwingTwist`, `evaluateCurveFloat` and the rest. Create them in the node editor or with `createNode`, and connect them like any node. `mathNodes(family="vector")` lists them.

## Check it reaches Unreal

Unreal can't show a skeleton whose parent scales unevenly while turned (it shears). FBX, glTF and Send to Unreal check each skeleton as Unreal would build it and refuse with the joint at fault. Run `unrealCheck()` to see the issues yourself; the fix bakes a clean copy with `bakeToDeformSkeleton`, which keeps uneven scale on leaf joints only.

## Troubleshooting

**Export refuses: "Unreal can't match this joint".** The joint inherits uneven scale. Bake with `bakeToDeformSkeleton` and export the baked copy, or pass `unrealCheck=False` to export anyway.

**A rubber hose limb deforms oddly.** The weights were moved with the limb off its bind pose; go to the bind pose and run `hoseReskin`.

**IK stops short of the target.** A joint limit holds it. Widen the limit, or let the chain stretch: `stretch` and `maxStretch` on the IK handle, `fullBodyIk(..., stretch=True)` for full-body posing.

**A limit edit doesn't take effect on an IK handle.** Edits made through `setAttr` reach the handle on `ikHandle(refresh=True)`; `ikLimit` and the viewport dots refresh it for you.

**A pinned prop arrives in Unreal without its socket.** Its skeletal mesh wasn't there yet when the prop synced; sync the character first, then the prop.

## Options

| Command | Option | Default | What it does |
| --- | --- | --- | --- |
| `pin` | `follow` | `translateRotate` | `translate`, `translateRotate` or `full` (scale too). |
| `pin` | `shape` | `final` | `rest` follows the mesh before its deformers. |
| `pin` | `upMode` | `curveFrames` | Curves: `upVector`, `upObject` or `aimCurve` for the frame's up. |
| `curveControls` | `handles` | off | Tangent controls on Bezier curves. |
| `curveControls` | `mirror` | off | Left and right names, so mirroring poses swaps them. |
| `splineChain` | `maxStretch` | `4.0` | How far stretch can lengthen the chain. |
| `hoseLimb` | `joints` | `12` | Hose joints per limb. |
| `hoseLimb` | `reskin` | on | Move the limb's weights onto the hose joints. |
| `splineDynamics` | `carrierInertia` | `1.0` | How much of the carrier's acceleration the chain feels. |
| `unrealCheck` | `tolerance` | `0.01` | Largest difference in cm still counted as a match. |
