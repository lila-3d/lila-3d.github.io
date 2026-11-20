# Animated textures

A numbered image sequence playing on your mesh over the timeline, with its speed keyed, exported as a flipbook sheet that plays in Unreal.

## Get it working

1. Open the texture set in the Texture Graph and add an **Image Sequence** node.
2. In **File**, pick any one frame, such as `fire_0012.png`. Every file in that folder with the same name and a different number joins the sequence, in number order.
3. Link the node's **Out** to the Material Output's **Base Color**.
4. Scrub or play the timeline. The viewport shows the sequence's first file on **Start Frame** and moves one file per scene frame.

To key the speed, right-click **Speed** in the node's panel and choose **Make Keyable**. The texture set gains a **Seq Speed** channel (named after the node) that you key in the Channel Box and shape in the Graph Editor like any other. Any number parameter of any texture node takes **Make Keyable** the same way.

```python
texAddNode("FireTex", "imageSequence", name="Seq")
texSetValue("FireTex", "Seq.file", "C:/fx/fire_0001.png")
texConnect("FireTex", "Seq.out", "Output.baseColor")
texDriveValue("FireTex", "Seq.speed")
setKeyframe("FireTex.Seq_speed", time=0.0, value=1.0)
setKeyframe("FireTex.Seq_speed", time=2.0, value=0.25)
```

## Send it to Unreal

1. Set the playback range to the frames you want, then choose **Texture > Export Flipbook**. Lila writes one sheet per channel into `textures/<set>`, named `<set>_<channel>_flipbook_<columns>x<rows>.png`, and logs the columns, rows and fps.
2. Import the sheet into Unreal.
3. With Unreal connected, choose **Texture > Flipbook Materials in Unreal**. It creates the material function `MF_LilaFlipbook`, plus `M_LilaFlipbook` and `M_LilaFlipbookTranslucent` built on it.
4. Drop `MF_LilaFlipbook` into your own material, or make an instance of one of the two materials. Set **Flipbook** to the sheet, and **Columns**, **Rows** and **FPS** to what the export logged.

## Troubleshooting

**The node is black.** No file matches. A `#` pattern such as `fire_####.png` must have as many `#` as the files have digits, and the folder must resolve: relative paths are looked up in the workspace, then the scene's folder.

**The wrong files play.** The frame number is the last run of digits in the name. In `fire_v2_0012.png` that is `0012`; in `fire_0012_v2.png` it is `2`, so rename the files or use `#` to mark the number.

**The sequence jumps when the speed changes.** Key **Speed**, not **Offset**. A keyed speed adds up over the frames since **Start Frame**, so the sequence carries on from where it was. A speed typed into the field without **Make Keyable** applies to the whole shot.

**Slowed down, it steps.** Set **Interpolation** to **Blend** to crossfade between neighbouring frames. In Unreal, set **Blend** to 1.

**Export Maps writes a still.** It writes the current frame. Use **Export Flipbook** for the animation.

**The last cells of the sheet play as blank frames in Unreal.** The sheet has more cells than frames. Set **Frames** on `MF_LilaFlipbook` to the frame count the export logged.

## Options

Image Sequence node:

| Option | Default | What it does |
| --- | --- | --- |
| **Start Frame** | `1` | The scene frame the first file shows on. |
| **Offset** | `0` | Files into the sequence at **Start Frame**. |
| **Frames** | `0` | How many files play before **After End** applies; 0 plays them all. |
| **Speed** | `1` | Files per scene frame. Negative plays backwards. |
| **After End** | Loop | Loop, Hold on the end frame, or Ping Pong. |
| **Interpolation** | Hold | Hold shows one file at a time; Blend crossfades into the next. |

`texExportFlipbook`:

| Option | Default | What it does |
| --- | --- | --- |
| `startFrame`, `endFrame` | Playback range | The scene frames written. |
| `step` | `1` | Scene frames between cells; 2 writes every other frame and halves the fps. |
| `columns` | `0` | Cells per row; 0 makes the sheet as square as the frame count allows. |
| `cellSize` | `256` | Width of one frame in the sheet, in pixels. |
| `channels` | All | Which channels get a sheet. |

`MF_LilaFlipbook` also takes **FrameOffset**, **AfterEnd** (0 loop, 1 hold, 2 ping pong) and **Frame**, which shows that frame and ignores time, for driving the playhead from a parameter or curve.
