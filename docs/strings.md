# Strings

Pose a character by grabbing any joint and choosing how the body answers: the joint turns its children, the body swings from it, its limb reaches, or the whole body follows. Nothing is set up first and nothing is left behind; every drag is ordinary keys on the joints.

<!-- media: strings-modes.mp4, Manny posed in each mode from the Spinner arc -->

## Get it working

1. Make a character: select the top joint and run **Puppeteer > Create Character** (or `puppeteerCharacter("root", template="UE5_Manny")`). Templates bring the character's contacts and lines of action with them.
2. Switch to **Animate** mode and select a joint. The Spinner appears on it.
3. Click a segment of the arc on the Spinner's left to pick the mode, top to bottom: **Forward**, **Backward**, **IK**, **Full Body**. Or hold **U** and left-click in the viewport for the marking menu.
4. Drag the Spinner. With the feet as contacts, dragging the knee in **Backward** swings the body round the planted foot; dragging the hips in **IK** crouches over the feet.

```python
stringsPose("hips", mode="ik", by=[0, -10, 0])
```

| Mode | What moves |
| --- | --- |
| Forward | The joint turns, its children follow. |
| Backward | The hierarchy reverses at the joint: what holds stays put and the body swings. |
| IK | The joint's limb bends to put it where you drag. Scroll the wheel during the drag to bend more or fewer bones; the bending bones are drawn. |
| Full Body | The whole body moves to put the joint there, contacts and pins holding. |

## Contacts, limbs and glue

- **Contacts** hold still while you pose the rest; the feet by default. Select joints and run **Puppeteer > Strings > Contacts from Selection** to change them for this character. **Contacts Hold** turns them off for a while.
- **Limbs** are what bends together in IK: select a limb's top joint, then its end, and run **Limb from Selection**. **Reset Strings Rules** goes back to the template's.
- **Glue** keeps two or more things together for every pose (two hands on a prop). **Attach to Last Selected** makes the others follow the last one, like a space switch that is never keyed. **Unglue** frees them.
- The character's Attribute Editor has a **Strings** section listing its contacts and limbs.

## Across frames

Shift + drag on the time slider to select a range. A drag then lands on every key in the range, each frame solved on its own pose, so planted feet stay planted on every frame. The range's falloff eases the edit out either side.

- **Smooth Poses Over Range** averages whole poses with their neighbours, then puts pins and contacts back.
- **Overshoot** carries the motion since the previous key on past the pose.
- `stringsBlend(time=…)` blends toward another frame's pose, or toward zero without a time; `channels="translate"` resets only bone lengths.
- **Zero Pose** zeroes rotations in the current mode. **Zero Relative to Last** keeps the last selected joint where it is while the others zero.
- **Range Edits on a Layer** keys range edits onto the additive layer `StringsEdits` instead of the base animation: lower its weight to compare, delete it to drop the edit.
- **Motion Trail** draws the selected joint's path over the range. Drag a frame on the trail to put the joint there on that frame.

## Breakdowns and inbetweens

Drag the Spinner's bottom arc: left blends toward the previous key's pose, right toward the next, past the ends overshoots. Rotations blend in their parents' space, so hands travel on arcs instead of cutting across, and contacts blend in world, so planted feet stay planted.

```python
stringsBreakdown("hips", weight=0.5, favour=0.5, parts={"head": 0.2})
```

`favour` above 0 lets the hands, feet and head lag the body; below 0 they lead. `parts` gives a joint and everything below it its own weight.

**Fill Inbetweens** keys every frame between the keys of the range, spaced by a curve (linear, ease in, ease out, ease in and out), on ones, twos or threes.

## Line of action

Run **Puppeteer > Strings > Line of Action** and draw along the body or a limb. The nearest line bends to the stroke's shape, scaled to its length and starting from where it is; contacts and pins hold. The stroke stays as a curve while the selection holds: drag it to adjust.

- **L** picks the line instead of the nearest: the character's lines come from its template (Manny has body, spine, arms and legs). Add one with `stringsRules("manny", addLine=["tail", "tail_01", "tail_12"])`.
- With a range selected on the time slider, the stroke poses every key in it. **T** (Travel) instead slides the body along the stroke across the range, for a path of motion.
- Bone CVs and spline chain controls on the line move onto the stroke too, so [Bend Bones](bend-bones.md) and spline chains follow its curve.

```python
lineOfAction("manny", line="body", stroke=[[0, 95, 0], [0, 130, 12], [0, 160, 40]])
```

## Troubleshooting

**"posed Forward" after a Backward or IK drag.** The joint is above the hips, so there is no body to swing or limb to bend. Grab a joint at or below the hips, or use Full Body.

**A foot slides during a drag.** It isn't a contact or pinned. Add it with **Contacts from Selection**, pin it, or turn **Contacts Hold** back on.

**"no frames to pose in the range".** The range has no keys. Key the frames first, or run the command with `dense=True` to pose every frame.

**The line of action bends the wrong part.** It took the line nearest the stroke. Press **L** to pick the line, or select a joint of the character you mean first.

**A breakdown says there is no previous or next key.** The joints have no key on that side of the current frame.
