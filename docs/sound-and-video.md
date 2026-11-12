# Sound and video

Dialogue, music and reference footage on the timeline: heard while you play and scrub, shown in the time slider, and lined up with each take.

<!-- TODO image: the time slider with its media lane, a reference clip's thumbnails and waveform above the ruler, the footage on an image plane behind the character (images/sound-and-video/media-lane.png) -->

## Get it working

1. Run **Animation > Import Footage...** and pick a video or a sound file. A video becomes an image plane on the active view, and its sound an audio node; both start on the active take's first frame (or the playback start without a take).
2. A bar for the footage appears above the time slider's ruler, with its thumbnails and waveform. Press play: the sound plays and the video follows it.
3. Line it up: scrub to the frame of a key moment in your animation, play the reference to the same moment, then drag the bar until they meet. Right-click the bar for **Start at Playhead** to put its first frame on the current frame.

```python
importFootage("ref/shot010.mov", camera="shotCam")
slideMedia("shot010", "shot010Ref", frames=-6)
```

For a sound file alone, **Create > Audio...** does the same without the image plane. The time slider's right-click **Audio** menu picks what you hear: **All**, or one audio node alone.

## The media lane

One bar per file of the media playing now, above the ruler and on the same frames.

- Drag a bar to slide it in time; the readout shows the frames moved. A video and its sound share one bar and move together.
- Drag either end of a bar with sound to trim it. The rest of the sound stays where it plays.
- Right-click a bar for **Takes** (which takes it belongs to), **Sound Track** (for files with several), **Mute**, **Hear Alone**, **Select** and **Delete**. Right-click empty lane to import.
- Double-click a bar to select its nodes; the Attribute Editor shows their attributes and a **Takes** section.

The lane hides when no media plays.

## Media per take

Media bound to takes plays only while one of them is active, and counts its start from that take's first frame. Switching takes switches the footage and sound with it. Unbound media always plays, timed from frame 0.

- Check takes in the **Takes** section of the audio node's or image plane's Attribute Editor, or in the bar's **Takes** menu.
- Duplicating a take shares its media.

```python
bindMedia("Walk", "walkVO", "walkRef")
bindMedia("Walk", "walkVO", remove=True)
```

## Video on image planes

An image plane plays any video file (MP4, MOV, MKV, WebM, AVI) frame-accurately at the scene time. Its `startFrame` is the frame the video's first picture shows on, `fps` overrides the file's rate (0 keeps it), and `frameOffset` adds frames. Before its start and past its end it holds the first and last picture.

Reference windows and overlays play videos too; see [Reference images](reference-images.md#video-references).

## Sound cues

A sound cue plays sounds when a simulation's pieces hit or break, picking one file at random per event and getting louder the harder the event. It reads only frames the simulation has cached, so playback never runs the simulation.

```python
soundCue(eventType="break", targets="Wall", sounds=["sfx/crack1.wav", "sfx/crack2.wav"], minStrength=50)
exportSoundCues(path="Export/Wall_sounds.csv")
```

`exportSoundCues` writes each sound's frame, time, position, file and volume as a CSV Data Table (or JSON) for Unreal, in the same axis profile as `exportBreaks`. `soundCueTriggers()` lists what would fire over the playback range.

## Troubleshooting

**No sound while playing.** The playback speed is **Play Every Frame**, which plays silent; pick **Real-time** in the time slider's right-click **Playback Speed** menu. Otherwise check the node isn't muted, that the **Audio** menu isn't set to another node, and that its take is active. With no output device Lila logs "no output device; sound is off".

**An H.264 or HEVC video won't open.** On Windows these decode through Windows' own codecs; HEVC needs the HEVC Video Extensions from the Microsoft Store. On macOS and Linux they aren't supported yet and the log says so: convert to VP9, AV1, ProRes or MPEG-4.

**A video's sound isn't the dialogue.** The file has several sound tracks. Right-click its bar and pick another under **Sound Track**, or set `track` on the audio node.

**The waveform of a long music file fills in slowly.** Sound files over 90 seconds stream from disk instead of loading whole, and their waveform draws as Lila reads through the file once. The log names each file that streams.

**Footage plays for one take only.** It's bound to that take. Uncheck it in **Takes** to make it play everywhere.

## Options

Audio node attributes, in the Attribute Editor or the `audio` command:

| Option | Default | What it does |
| --- | --- | --- |
| `offset` | `0` | Frame the sound starts on (where `sourceStart` plays), from the take's start when bound. |
| `sourceStart` | `0` | Frame of the file the sound starts from, trimming its head. |
| `sourceEnd` | `0` | Frame of the file it stops at, trimming its tail; `0` plays to the end. |
| `track` | `0` | Sound track of a file with several, from 0. `mediaInfo("file")` lists them. |
| `gain` | `1` | Volume, 0 to 4. |
| `mute` | off | Silent, still drawn. |

```python
audio(fileName="sound/dialogue.wav", offset=12)
audio("dialogue", sourceStart=48, sourceEnd=240)
mediaInfo("ref/shot010.mov")
```

Third-party components that play sound and video (FFmpeg, miniaudio) are listed with their licences in **Help > Licenses**.
