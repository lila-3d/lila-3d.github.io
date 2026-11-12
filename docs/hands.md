# Hands

Put a character's hand into a fist, a point, a grip or any common shape in one click, shape it with a few sliders or by dragging the Hand Pad beside the hand, and close it onto a prop until the fingers touch. Keys land on the finger joints themselves, so takes export to Unreal as they are.

<!-- media: hands.mp4, Manny's hand going Relaxed > Fist > Point from the Hands panel, then a drag on the Hand Pad curling the index, then Grip closing onto a sword handle -->

## Get it working

1. Make a Puppeteer character for the skeleton (**Puppeteer > Create Character**, or enter Animate mode with a skinned skeleton selected). Its hands are found and set up as it is made: every hand joint with two or more finger chains under it, jointed or rubber hose fingers.
2. In Animate mode, click a finger or the hand on the mesh. The Hand Pad, a small hand diagram, appears beside it.
3. Open **Puppeteer > Hands > Hands** and click a pose tile, for example **Fist**. The selected hand takes the pose.
4. With auto key on, the pose is keyed at the current frame; otherwise click **Key**.

```python
puppeteerHandPose("hand_l", pose="fist")
puppeteerHandShape("hand_l", curl=0.4, spread=0.3)
puppeteerHandMirror("hand_l")
```

## Hand Pad

| Drag | Does |
| --- | --- |
| A finger, up or down | Curls it |
| A finger, sideways | Spreads it toward or away from the thumb |
| The palm | Curls (up or down) and spreads (sideways) every finger |
| The thumb | Swings it across the palm (up or down) or out from it (sideways) |
| Shift + drag | Fine steps |
| Ctrl + drag on a finger | The fingers either side follow by half |
| Right-click | Poses, Rest, Mirror to Other Hand, Key Hand |

Turn the pad off with **Puppeteer > Hands > Hand Pad**.

## Hands panel

- **Left**, **Right** and **Both** pick the hand; selecting a hand picks its side until you pick one here.
- The **Fingers** letters limit poses and sliders to some fingers: turn off all but **I** to point the index while the rest keep their pose.
- A pose tile applies at **Amount**. Drag a tile to the right to blend toward its pose as you go.
- **Shape** sliders read the pose on the current frame and change it from there: **Curl**, **Spread**, **Thumb** (-1 out, 1 across the palm), **Cup** (hollows the palm). **Relax** drags toward the relaxed pose (right) or the tense one (left) and springs back to 0.
- **Fingers** sets each finger's own curl and spread; **Blend** mixes two poses.
- **...** has **Swap Hands**, **Save Hand Pose** and **Set Up Hands**. Saved poses fit any hand of any character.

Every pose is also in **Puppeteer > Hands > Poses** and in search (Ctrl+T), for example "Fist (Hands)".

## Grip

1. Pose the hand open around the prop (**Flat** or **Relaxed**), close to it but not inside.
2. Select the hand, then Shift-select the prop mesh or the other character.
3. Click **Grip**. Each finger curls the natural way; as a bone touches, the joints before it stop and the rest carry on, so the finger wraps the surface.

```python
puppeteerHandGrip("hand_r", target="sword_grip")
```

## Troubleshooting

**The Hands panel says no hands were found.** A hand needs at least two finger chains of two or more joints. Hands are found by name first (`hand`, `wrist`, `palm`), then by layout (several short chains at the end of a limb). After adding or renaming finger joints, run **Set Up Hands**.

**Fingers curl the wrong way, or the thumb is taken for a finger.** The side comes from the joint name (`_l`, `left`, `L_`, `HandL`) or, without one, from which side of the character the hand is on; finger roles come from names (`thumb`, `index`, `middle`, `ring`, `pinky`, `Finger0` to `Finger4`) or from their order. `puppeteerHandInfo()` shows what was found and from what (`sideFrom`, `roleFrom`). Rename the joints and run **Set Up Hands**.

**Rest or Flat looks off.** The hand's rest is the pose it had when it was set up. Go to the bind pose and run **Set Up Hands**.

**A grip finger did not move.** It started inside the prop (`startedInside` in the result); open the hand or move the prop and grip again. When fingers stop short of the surface or sink in, give `thickness` (cm); by default it is measured from the character's own mesh.

**Rubber hose fingers.** Their poses key the hose's `curl` and `spread` instead of joints; bake with `bakeToDeformSkeleton` as for any hose limb ([Creature rigging](creature-rigging.md)).

## Options

| Command | Flag | Default | What it does |
| --- | --- | --- | --- |
| `puppeteerHandPose` | `pose` | | A built-in pose, a saved one, or `rest`. |
| `puppeteerHandPose` | `weight` | `1` | How far toward the pose. |
| `puppeteerHandPose` | `blendTo`, `mix` | `0.5` | Blend with a second pose first. |
| `puppeteerHandShape` | `curl`, `spread`, `thumb`, `cup`, `relax` | | Hand values; `add=True` makes them changes. |
| `puppeteerHandShape` | `fingerCurl`, `fingerSpread` | | Per finger, `{"index": 0.0}`. |
| all | `fingers` | all | Limit to `thumb`, `index`, `middle`, `ring`, `pinky`. |
| all | `side` | `selected` | `left`, `right`, `both` or `opposite`. |
| all | `key` | auto key | Key what changed at the current frame. |
| `puppeteerHandGrip` | `thickness` | from the mesh | Finger skin thickness, cm. |

Built-in poses: `relaxed`, `fist`, `point`, `grip`, `pinch`, `ok`, `flat`, `spread`, `claw`, `thumbsUp`, `peace`, `cup`, `hook`, `trigger`, `ball`, `pen`, `gun`, `blade`, `horns`, `tense`.
