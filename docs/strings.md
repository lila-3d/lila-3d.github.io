# Strings

Pose a character by grabbing any joint and choosing how the body answers: the joint turns its children, the body swings from it, its limb reaches, or the whole body follows. Nothing is set up first and nothing is left behind; every drag is ordinary keys on the joints.

<!-- media: strings-modes.mp4, Manny posed in each mode from the Spinner arc -->

## Get it working

1. Make a character: select the top joint and run **Puppeteer > Create Character** (or `puppeteerCharacter("root", template="UE5_Manny")`). Templates bring the character's contacts and lines of action with them.
2. Switch to **Animate** mode and select a joint. The Spinner appears on it.
3. Click a segment of the arc on the Spinner's left to pick the mode, top to bottom: **Default**, **Free**, **Forward**, **Backward**, **Bidirectional**, **IK**, **Full Body**. Right-click **Forward**, **Backward** or **Bidirectional** for its **All** variant (a bar along the segment shows it). Or hold **U** and right-drag in the viewport for the modes' marking menu, or use the hotkeys below.
4. Drag the Spinner. With the feet as contacts, dragging the knee in **Backward** swings the body round the planted foot; dragging the hips in **IK** crouches over the feet.

```python
stringsPose("hips", mode="ik", by=[0, -10, 0])
```

| Mode | Keys | What moves |
| --- | --- | --- |
| Default | Alt+Q | Each joint poses the way the character's rules say (the **Modes** layer of the Rules editor). Without a rule, a move bends the limb (IK) and a turn is Forward. The readout names the mode it picked. |
| Free | Alt+E | The joint alone. Its children keep their world rotation as it turns; on a move they keep their place too, so the bones either side change length. |
| Forward | Alt+A | The joint turns, its children follow. Pins and contacts below it outside its own limb hold: turn the chest and a pinned hand stays, turn the hips and the planted feet stay. |
| Forward All | Alt+Shift+A | Plain FK: everything below follows, nothing holds. |
| Backward | Alt+S | The hierarchy reverses at the joint: what holds stays put and the body swings. |
| Backward All | Alt+Shift+S | The body swings rigidly round the anchor; other contacts don't hold. |
| Bidirectional | Alt+D | Both sides give. A turn swings the parts below and the body above half each round the joint; a move carries the body half way and the limb reaches the rest. Holds outside the parts below stay. |
| All | Alt+Shift+Q | Bidirectional with nothing held: both sides turn rigidly, and a move carries the whole body. |
| IK | Alt+W | The joint's limb bends to put it where you drag. Scroll the wheel during the drag to bend more or fewer bones; the bending bones are drawn. |
| Full Body | Alt+Shift+W | The whole body moves to put the joint there, contacts and pins holding. |

**Isolate Rotation** (**U** + left drag, or **Puppeteer > Strings**) keeps the isolated joints' world rotation while a drag carries them, in Default, Forward, Backward and Bidirectional: the head stays level as the chest turns. The head and hands are isolated unless the character's rules say otherwise.

Zero, breakdowns, tweens and **Mirror Pose** go through the current mode too: **Mirror Pose** on a leg in Backward keeps its foot planted and swings the body instead, and a breakdown in **Forward All**, **All** or **Free** blends every joint in its parent's space with no contact held.

## Contacts, limbs and glue

- **Contacts** hold still while you pose the rest; the feet by default. Select joints and run **Puppeteer > Strings > Contacts from Selection** to change them for this character. **Contacts Hold** turns them off for a while.
- **Limbs** are what bends together in IK: select a limb's top joint, then its end, and run **Limb from Selection**. **Reset Strings Rules** goes back to the template's.
- **Glue** keeps two or more things together for every pose (two hands on a prop). **Attach to Last Selected** makes the others follow the last one, like a space switch that is never keyed. **Unglue** frees them.
- The character's Attribute Editor has a **Strings** section listing its contacts and limbs.

## Rules editor

Run **Puppeteer > Strings Rules** (or **Edit Rules** in the Attribute Editor) to see the selected character's joints from the front with its rules drawn on them. Pick what to edit on the strip at the top:

- **Contacts**: click a joint to make it a contact or stop it being one.
- **Isolate**: click a joint to isolate it (drawn squared) or stop isolating it.
- **Modes**: click a joint to pick the mode it poses in under Default.
- **Limbs** and **Lines**: drag from a joint to one below it (either way round) to add a limb or a line of action; click a limb or line to remove it.
- **Test**: drag a joint to pose the character through its rules in the current mode. The pose shows in the viewport while you drag and goes back on release, with nothing to undo.

## Across frames

Shift + drag on the time slider to select a range; Shift + click drops it. A drag then lands on every key in the range, each frame solved on its own pose, so planted feet stay planted on every frame. While you drag, the ghosts spread across the range (past frames in the before colour, later ones in the after colour, fading with the falloff) and the motion trail shows every frame's result.

<!-- media: strings-range.mp4, a range on the time slider with its ramps, the hips dragged across a walk with Pivot, ghosts and trail following -->

- **Falloff**: the range draws as a plateau with a ramp each side, as high as the share of the edit each frame takes. Drag a ramp's foot (bottom of the time slider) to set that side's falloff, **Ctrl** + drag for both; drag the range's edges (top) to resize it. Right-click the time slider for **Falloff Type**: **Smooth**, **Linear**, **Sharp** (drops fast from the range), **Soft** (holds, then drops) or **Constant**.
- **Key Every** (same menu): **Keys Only** moves the keys already there; **Frame** or **2 Frames** and up also keys every n frames across the range and its falloff, and the frames outside it keep their pose. Mocap and dense motion want **Frame**.
- **Rotation Type**: **Local** turns each frame about the joint where it is on that frame; **Pivot** swings each frame about where the joint is now, so its path turns too: turn the hips across a walk to change its direction. Pivot needs a joint the mode can move (the hips, or any joint in IK, Backward or Full Body); others turn in place and the result says so.
- **Tween**: with a range selected, the Spinner's bottom arc tweens the range instead of breaking down one frame: right takes every frame toward the inbetween of the poses either side of the range, left pushes them away from it. **Tween Range** does it as a command.

- **Smooth Poses Over Range** averages whole poses with their neighbours, then puts pins and contacts back.
- **Overshoot** carries the motion since the previous key on past the pose.
- `stringsBlend(time=…)` blends toward another frame's pose, or toward zero without a time; `channels="translate"` resets only bone lengths.
- **Zero Pose** zeroes rotations in the current mode. **Zero Relative to Last** keeps the last selected joint where it is while the others zero.
- **Range Edits on a Layer** keys range edits onto the additive layer `StringsEdits` instead of the base animation: lower its weight to compare, delete it to drop the edit.
- **Retime Range** retimes the motion inside the range in place: its option box sets **Ease In** and **Ease Out** (1 starts or settles slowly, -1 at double speed). Every frame in the range is keyed, so it works on mocap as well as keys; frames outside the range keep their poses. It is also on the time slider's right-click menu while a range is selected, with **Smooth Poses Over Range** and **Fill Inbetweens**.
- **Motion Trail** draws the selected joint's path over the range. Drag a frame on the trail to put the joint there on that frame.

### In the Curve Overlay

Press **Space** in Animate mode for the Curve Overlay; Ctrl + Shift + drag on its frame strip selects the same range as the time slider (Ctrl + Shift + click drops it), and Shift + drag moves its edges and ramp feet there too. With a range selected:

- Shift + drag a key or curve inside the range up or down: every frame of the range moves by the drag, eased across the falloff. Selected keys move all their curves together. To move keys in time, drop the range first.
- The row beside **Graph Editor** sets the falloff type (click to cycle), **Local** or **Pivot**, and **Keys** or **Every n** (click to cycle). Drag **Tween** right to put the range on the line between the values either side of it, left to exaggerate.

```python
curveRangeEdit(channels=["hips.translateY"], offset=-8, range=[0.5, 1.0], falloff=6, falloffType="linear", every=1)
```

## Breakdowns and inbetweens

Drag the Spinner's bottom arc: left blends toward the previous key's pose, right toward the next, past the ends overshoots. Rotations blend in their parents' space, so hands travel on arcs instead of cutting across, and contacts blend in world, so planted feet stay planted.

```python
stringsBreakdown("hips", weight=0.5, favour=0.5, parts={"head": 0.2})
```

While dragging the slider, move down to make the hands, feet and head lag the body, up to make them lead (`favour`). Their arcs from the previous key's pose to the next draw while you drag. `parts` gives a joint and everything below it its own weight.

**Breakdown Parts** sets that per part by brushing: brush over the mesh and the part under the brush (the joint that dominates the skin there, with its children) takes the brush's share of the slider. **Ctrl + wheel** sets the share, 0% holding the part still; **Ctrl + drag** clears. **Clear Breakdown Parts** clears them all.

**Fill Inbetweens** keys every frame between the keys of the range, spaced by a curve (linear, ease in, ease out, ease in and out), on ones, twos or threes.

## Line of action

Run **Puppeteer > Strings > Line of Action** and draw along the body or a limb. The nearest line bends to the stroke's shape, scaled to its length and starting from where it is; contacts and pins hold. The stroke stays as a curve while the selection holds: drag it to adjust.

- **L** picks the line instead of the nearest: the character's lines come from its template (Manny has body, spine, arms and legs). Add one with `stringsRules("manny", addLine=["tail", "tail_01", "tail_12"])`.
- **Shift + drag** from one joint to another along the body uses that path for the next strokes, any joint down to any joint below it. A path that starts below the hips bends alone; nothing above it turns.
- **Ctrl + wheel** turns the plane strokes are drawn on about the world's up, 15 degrees a step, for staging a pose away from the camera.
- With a range selected on the time slider, the stroke poses every key in it. **T** (Travel) instead slides the body along the stroke across the range, for a path of motion.
- Bone CVs and spline chain controls on the line move onto the stroke too, so [Bend Bones](bend-bones.md) and spline chains follow its curve.

```python
lineOfAction("manny", line="body", stroke=[[0, 95, 0], [0, 130, 12], [0, 160, 40]])
```

## Unreal

To pose the character in Unreal the same way, map its root to the skeletal mesh (`unrealMap`) and run `unrealStringsRig("manny")`. LilaLink makes a Control Rig `CR_<mesh>_Strings` beside the mesh with a control on the hips, each limb and line end and each contact (`LS_<bone>`); dragging one poses its bone through a **Lila Strings** node, contacts holding. Each control has a **Mode** channel (every mode above) and an **Isolate Rotation** channel; set or key them in the Control Rig's animation details. They start at the current mode and Isolate Rotation setting, or pass `mode="ik"`, `isolate=True`. The nodes solve exactly as Lila does, joint limits and the rules' per-joint modes included, so the same drag gives the same pose in both. A control still where it started leaves its bone to the others; a control you moved holds its bone where you put it. `stringsRuleWeb("manny", file="manny_rules.json")` writes the rules the nodes read.

## Troubleshooting

**"posed Forward" after a Backward or IK drag.** The joint is above the hips, so there is no body to swing or limb to bend. Grab a joint at or below the hips, or use Full Body.

**A foot slides during a drag.** It isn't a contact or pinned. Add it with **Contacts from Selection**, pin it, or turn **Contacts Hold** back on.

**"no frames to pose in the range".** The range has no keys. Set **Key Every** to **Frame** on the time slider's right-click menu, or pass `every=1`.

**A Pivot turn left the path where it was.** The joint can't move in the current mode (a spine joint in Forward), so it turned in place. Turn the hips, or switch to a mode that moves the joint.

**Isolate Rotation does nothing.** The mode is IK, Full Body or an All variant, which ignore it; or the joint isn't isolated: check the Rules editor's **Isolate** layer.

**The line of action bends the wrong part.** It took the line nearest the stroke. Press **L** to pick the line, or select a joint of the character you mean first.

**A breakdown says there is no previous or next key.** The joints have no key on that side of the current frame.

**"nothing given is animated" from Retime Range.** The selected joints have no keys. Select the character or its keyed joints.

**Dragging one control in Unreal pulls another limb back.** That limb's control was moved earlier and holds its place. Move it with the limb, reset it to where it started, or remove its node from the rig.

**"No bone named ..., which the rule web poses" in the Control Rig.** The skeletal mesh lacks a joint Lila poses. Export the skeleton with every deform joint, then run `unrealStringsRig` again.

**Old rigs show deprecated Lila Strings Forward, Backward, IK or Full Body nodes.** They still pose as before. Run `unrealStringsRig` again to rebuild the rig with **Lila Strings** nodes and mode channels, or upgrade the nodes in the Control Rig editor (Forward becomes **Forward All**).

**"give skeletalMesh" from unrealStringsRig.** The character's root isn't mapped to a skeletal mesh. Map it with `unrealMap`, or pass `skeletalMesh="/Game/..."`.
