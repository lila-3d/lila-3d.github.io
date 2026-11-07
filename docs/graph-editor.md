# Graph Editor

Edit animation curves, and see the speed and acceleration they produce. Open it with **Animation > Graph Editor**; it shows the animated channels of the selection.

<!-- media: Graph Editor in Stacked view with the Speed and Acceleration strips on -->

## Get it working

1. Select an animated object. Its channels list on the left; pick some to show only those.
2. Click a key, Shift-click to add, or drag a box. A click on a curve picks all its keys.
3. Drag a picked key to move it. MMB-drag anywhere does the same with whichever tool is on.

MMB on the frame ruler (or the time slider) moves the time but keeps the pose, so the next key you set copies it there. Alt+C and Alt+B step to the previous and next key, beside Alt+V for play.

Navigation is Maya's: Alt+MMB pans, Alt+RMB zooms (sideways for time, up and down for value), the wheel zooms both, F frames the selection, A frames everything.

### Tools

| Key | Tool | Drag |
| --- | --- | --- |
| W | Move | Keys move; Shift keeps them on one axis. With several keys picked, a box surrounds them: drag its edges or corners to scale the selection from the opposite side, drag inside it to move. |
| E | Rotate | Sideways turns every picked key's tangents about its own key. |
| R | Scale | Sideways scales time, up and down scales value, about the pivot. |

Hold W, E or R and move the mouse to drag the selected keys with that tool without clicking; release to place them. A quick tap only switches the tool. Turn this off in **Preferences > Graph Editor**.

The pivot button sets where Scale works from. Value pivots are per curve: with **Selection Centre**, each curve scales about the middle of its own picked keys.

**Falloff** (tap B) makes unpicked keys near the selection follow value changes, less the further they are. Hold B and drag to set the radius in frames (MMB drags it from zero), as with soft select in the viewport. Keys it moves tint orange while you drag.

### Tween slider

Pick keys, choose a mode, and drag the slider; it springs back to the middle on release, as one undo. **Neighbour** blends towards the key before (left) or after (right) the run of picked keys; the rest blend between those two keys or towards the channel's default.

### Views

The three view buttons: **Absolute** (curves at their values), **Stacked** (each curve in its own band, real range at the band's right) and **Normalized** (every curve scaled to -1..1 on top of the others). Edits work the same in all three.

### Speed and acceleration

The activity button turns on strips under the curves, sharing their time axis:

- **Curves**: each shown curve's rate of change.
- **World Speed**: how fast each selected object moves through the world in cm/s, parent motion included.
- **World Angular Speed**: how fast each selected object turns, in degrees per second, from its rotation as a whole, so no Euler flips show up as speed.

**Target Speed** draws a reference line, such as a locomotion speed to match. Orange ticks above the acceleration strip mark pops: frames far above the acceleration around them.

### Curves menu

- **Filters**: Butterworth (smooths jitter, a key per frame), Gaussian Smooth (same keys, smoothed values), Simplify (the fewest keys within a tolerance), Resample, Euler Filter. They work on the picked keys' span, or whole curves when nothing is picked. The square opens each one's settings.
- **Modifiers**: Noise, Stepped and Limits change a curve's output without touching its keys. A curve with modifiers lists them after its name.
- **Buffer**: **Snapshot Buffer** keeps the curves as they are, drawn dashed behind them; **Swap Buffer** trades the curves with the snapshot, so you can flip between two versions.

### Tangents

The tangent buttons set the picked keys' tangents. **Break** lets a key's in and out handles move apart (square handles); **Unify** joins them again. On a weighted curve (right-click > **Tangents > Weighted**) dragging a handle also sets its length.

The Frame and Value fields take `+=`, `-=`, `*=` and `/=`: `+=5` in Frame shifts every picked key five frames; `*=2` in Value doubles each key's own value.

## Troubleshooting

**Keys move but the curve doesn't follow them.** The curve has a modifier; its name in the channel list says which. Remove it from **Curves > Modifiers > Remove Modifiers**.

**The speed strip is empty.** World Speed and World Angular Speed read the selected objects, not the curves shown; select a transform.

**Frame says "mixed" and won't take a number.** The picked keys are at different frames; use `+=` or `-=` to shift them together.

**Swap Buffer does nothing.** Those curves have no snapshot yet: run **Snapshot Buffer** first.

**Exported FBX has a key on every frame.** Curves with modifiers export sampled, so the modifiers come through.

## Options

| Command | What it does |
| --- | --- |
| `transformKeys(keys=..., timeScale=2, timePivot=1)` | Move and scale keys, as the tools do. |
| `blendKeys(mode="ease", amount=0.5)` | The tween slider. |
| `filterCurve(filter="simplify", tolerance=0.05)` | The filters. |
| `curveModifier("ball_translateY", type="noise", amplitude=2, period=12)` | Add or edit a modifier. |
| `keyTangent("ball.ty", time=1.0, lock=False)` | Break (or unify) a key's handles. |
