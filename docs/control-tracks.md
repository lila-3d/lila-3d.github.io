# Control tracks

In Puppeteer a key is a key for the whole character, and any control can also carry its own track on top: an offset you turn on and off, or keys with their own timing, merged down when you're happy.

<!-- media: control-tracks.mp4, Manny walking; the left arm gets an offset, toggled off and on, then a keyed wave on its own timing -->

## Get it working

1. Switch to **Animate** mode, select a joint of the character and press **S**. Every control the character animates gets a key at this frame, so the Stacker's rows are whole poses. Auto key does the same.
2. In the **Stacker**, set the key target to **Control** (or press **Alt+K**). The cursor shows a badge while posing goes to tracks.
3. Pose a control, say the left upper arm. It gets a track holding that change as an offset: the same amount added on every frame of the take. It shows under **Tracks** in the Stacker as **Offset**.
4. Click the track's eye to turn it off and on; the character keys under it don't change. The eye beside **All** turns every track of the character off and on at once.
5. To animate the track instead, press **S** while the target is **Control**: the control's track gets a key at this frame and becomes a keyed track. Pose and key it at other frames; with the control selected, the Stacker, time slider and Graph Editor list the track's keys, and Stacker gap edits retime the track alone.
6. When it's right, select the control and run **Merge Into Character Keys** from the Tracks **...** menu.

```python
keyTarget("root", target="control")
controlTrack("upperarm_l")              # an offset at zero
characterKey("upperarm_l")              # key the track at the current frame
mergeControlTrack("upperarm_l")
```

## Where an edit goes

| Key target | Posing a control | S |
| --- | --- | --- |
| **Character** | Keys the character keys. A control with a track keeps it on top, and the key is worked out so the pose you see is the pose you get. | Keys every control the character animates. |
| **Control** | Goes to the control's track, made on the first edit. An offset track moves its one value; a keyed track keys at the frame. | Keys the selected controls' tracks. |

The target is saved with the scene for each character. A Mixer layer you make active wins over both.

## Troubleshooting

**The Stacker is empty and says the control has no track.** The target is **Control** and the selected control has no track yet. Pose it to make one, or switch the target to **Character** to see the character keys.

**Posing changes every frame instead of this one.** The control's track is an offset. Press **S** with the target on **Control** to key it, or switch to **Character** to key the character keys.

**Merge warns that the control differs from its layered motion.** The merged control is keyed at the character keys and the track's keys only, so between them the curve approximates the sum. The warning gives the largest difference; add character keys where it shows, then merge again (undo first).

**Paste says the copied keys are a track's (or the character's).** Track keys add to a pose and character keys are one, so they paste only onto their own kind.

## Retiming, copying and mirroring

- Retiming the character keys (gaps, create, delete, insert) moves every track's keys with them, so accents stay on the motion they belong to. Retiming a track moves only that track.
- Copy, paste, insert and reset work on what the Stacker lists. Reset on a track sets it back to adding nothing.
- **Mirror** on a track writes the mirrored keys to the opposite control's track, making it if needed.
- Marks (breakdown, extreme) belong to the character keys.
- Exports (FBX, glTF, Unreal through LilaLink) are sampled from the evaluated skeleton, so they carry the character keys plus every track that's on.
- Each track is an additive animation layer named `<control>_track`. The Mixer leaves them out; the **Anim Layers** panel shows them.
