# Generated motion

Generate human motion on any humanoid character: fill the frames between your keys, walk or run a path, perform interactions such as picking something up, or steer the character live. The result is ordinary keys and takes, so it edits, layers and exports like hand-keyed animation.

<!-- media: Motion panel beside a character walking a drawn path into a Pick Up spot -->

## Get it working

1. Select the character (any joint of a humanoid skeleton: UE5 Manny or Quinn, Mixamo, MetaHuman, BVH) and open **Animation > Motion > Motion** to show the panel.
2. Key the poses you want, then put the time slider between two keys and press **Fill Gap**. The frames between fill with motion that starts from your first key and arrives at the next.
3. For travel, press **Draw Path**, click points on the ground and press Enter. Select the character and the curve, pick a **Style** and press **Follow Path**. The character walks it into a new **Path** take and stops at the end.

```python
motionFill("pelvis", all=True)
motionFollowPath("pelvis", path=[[0, 0, 400], [300, 0, 700]], style="run")
```

The first use loads the motion model, which takes a few seconds. The line at the bottom of the panel says whether it runs on the GPU or the CPU, and why.

## Fill between keys

Your keys never move or change. Fill keys the frames between them on twos and marks them `g` in the Stacker; filling again replaces those keys, and **New Variant** fills the same gaps with different motion through the same keys.

- **Timing**: by default each gap keeps its length. In the option box, **Timing** set to `model` lets the model choose each gap's length (0.6 to 1.9 s) and moves the later keys.
- Gaps longer than about 2 s fill in several steps.
- **Target Poses** above 1 also aims for the frames after the next key, so the motion carries into it.

## Paths and spots

A path is points, curves and spots, in the order you select them. Speed `Gait` uses the speed of the chosen style; set a speed in m/s to change it.

A spot is an interaction placed in the scene: target poses around an object that the character reaches in turn. Lila ships **Pick Up**, **Duck**, **Leap** and **Crouch**; each places ahead of the selected character. Move and turn the spot to where the object is, then include it in the path.

To make your own: place **New Empty Spot** on the object, pose the character where it should end up, select the spot and the character, and press **Capture Target**. Capture one target per step (reach, sit, stand up). **Save Spot** writes a `.lilaspot` file for reuse in other scenes, and **Load Spot** places one.

```python
motionSpot(preset="Pick Up", position=[0, 0, 300])
motionSpotTarget("chairSpot", capture="pelvis", time=2.0, name="Sit", hold=30)
motionSpotTarget("chairSpot", index=0, pins=["leftHand", "rightHand"])
```

**Pins** hold hands or feet on the target pose's positions as the character arrives, for contact with the object. **Hold** keeps the pose for a number of frames before the next target.

## Drive

**Drive** (in the **Live** section) steers the character live. Move with W A S D relative to the camera, or the left stick of a gamepad. Hold Shift (or the right trigger) to run, press C to crouch and F to strafe while facing one way. Enter keeps everything shown as a **Drive** take; Esc discards it.

```python
motionDrive("pelvis", start=True)
motionDrive(move=[0, 0, 1], step=90)
motionDrive(stop=True)
```

## Export

Generated motion is keys on the character's joints, in takes, so FBX and glTF export and **Send to Unreal** carry it like any other take. Follow Path and Drive move the root joint under the pelvis (root motion); turn `rootMotion` off to keep the root still.

## Troubleshooting

**"The motion model is missing".** The message names the path it looked for. Reinstall Lila, or set the `LILA_MOTION_MODEL` environment variable to a copy of `mmm_v6_soma_fp16.onnx`.

**The panel says the CPU, with "DirectML failed".** Lila could not run the model on the GPU and fell back to the CPU, which generates each step in about a second instead of about 0.1 s. Update the graphics driver. **Preferences > Motion > Device** picks the GPU or the CPU yourself.

**Feet slide.** Feet plant where the model predicts contact. If the character has IK legs, the foot lock channel is keyed too; check `plantFeet` is on.

**A fill passes through the floor or the keys look nothing alike.** The model works best between poses a person could hold. Keys far apart in pose need a key between them.

**"select a character".** The panel works on the character of the selection, or the last one selected. Select a joint of the skeleton.

## Options

| Command | What it does |
| --- | --- |
| `motionFill` | Fill gaps: `time`, `from`/`to`, `all`, `timing`, `every` (frames between keys), `targetPoses`, `variant` |
| `motionFollowPath` | Walk a path: `path`, `style`, `speed`, `stop`, `variant`, `take`, `rootMotion`, `plantFeet`, `lockFeet` |
| `motionGaits` | The styles and their speeds |
| `motionBuildGaits` | Build a gait library from your own BVH mocap |
| `motionStatus` | Where the model runs and why |
| `motionDevice` | `auto`, `gpu` or `cpu` |
| `motionSample` | The character's motion as the model sees it, per frame |

> **Note:** The motion model is MotionBricks by NVIDIA, licensed under the NVIDIA Open Model Agreement. Lila's gait and starter spot poses come from the ACCAD Open Motion Project (CC BY 3.0). See **Help > Licenses**.
