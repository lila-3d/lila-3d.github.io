# Rendering

Renders are the viewport's own picture, supersampled: post process, depth of field and motion blur included, with no grid, wires or selection.

Lila has no offline path tracer: it renders with the real-time renderer you work in, in seconds.

> A [C++ extension](cpp-extensions.md) can add any renderer. For path tracing, a [viewport renderer](viewport-renderers.md) draws the view with a Hydra delegate such as Cycles or Arnold.

## Get it working

1. Pick the **Render** layout (between Bake and Rig).
2. In the **Render** panel, pick **Frame**, **Range** or **Turntable**, and under **Output** set **Write** to **Images**, **Video** or **Both**.
3. Click the **Render** button. The viewport confirms the file; **Open** and **Show in Folder** under the button reach it.

**Render > Render Frame**, **Render Range** and **Render Turntable** do the same from any layout. A turntable writes beside the range as `<name>_turntable`, so it never overwrites the shot.

```python
render(path="hero.png", camera="shotCam", samples=128)
renderSequence(write="both", samples=64, motionBlur=True)
renderTurntable(video="turntable.mp4", frames=120, spin="object")
```

- **Images** take `####` for the frame number. `.exr` keeps the scene's light before tonemapping, for compositing.
- **Transparent** gives PNG, TIFF and EXR an alpha channel.
- **Video** is an `.mp4`, H.264 or HEVC, encoded on the GPU where it can be.
- `renderPass="wireframe"` draws every edge over the picture, for breakdowns; `renderPass="id"` gives each object a flat colour from its name, for mattes.
- Settings save with the scene; script flags override them for that call.
- `passes="all"` writes depth, normals, motion and Cryptomatte beside the picture in one multilayer `.exr`; see [Compositing passes](compositing-passes.md).

## Look

**Render > Post Process** selects the scene's post process (making one if there's none): tonemapper (Neutral, AgX, ACES), exposure, grading, lens effects, a `.cube` LUT and height fog lit by the sun. The viewport shows it too; **Render > Post Effects** turns its grading and lens effects off in the viewport only.

A material's **Bevel** (cm) rounds its hard edges as it shades, traced against the real geometry, like a high-poly bevel without the polygons (GPUs with ray tracing). Bake a **roundedNormal** map to keep the look in a game engine.

**Render > Colour Management** switches the picture from Lila's tonemapper to an OpenColorIO display and view (ACES, AgX, your studio's config); see [Colour management](colour-management.md).

**Render > Reflections** (or **Display > Reflections**) lets glossy surfaces reflect the scene instead of only the environment: **Ray-Traced Reflections** on GPUs with ray tracing, **Screen Space Reflections** anywhere. They need environment lighting. When the view can't give what you asked for, the top right says what it used instead.

**Render > Three-Point Light Rig**, **Rim Light Rig** or **Product Light Rig** puts area lights around the selection, aimed and sized to fit it.

For framing, **Render > Safe Frames** and **Rule of Thirds** draw inside the resolution gate.

## Grading

Select the post process (**Render > Post Process**). Its **Grade** section in the Attribute Editor has:

- **Wheels**: drag a wheel's puck toward a colour to tint shadows (Lift), mid-tones (Gamma), highlights (Gain) or everything (Offset); the field under each moves brightness. Double-click a wheel to reset it.
- **Tonal Balance**: the same for shadows, mid-tones and highlights split by brightness; the fields under Shadows and Highlights set where each range ends.
- **Curves**: click to add a point, drag to move it, double-click to remove it. Master and R, G, B are tone curves; **Hue vs Sat**, **Hue vs Hue** and **Luma vs Sat** sit at the middle line when they change nothing.
- **Looks**: built-in grades to start from, and **Save Look** for your own.

Every grade number keys like any attribute, so a grade can change over a shot. **Render > Scopes** shows the waveform, parade, histogram and vectorscope of the viewport or the last render.

**Render > Export Grade LUT...** bakes the grade into a `.cube` for Resolve or Nuke, or a `.png` strip for Unreal's colour grading LUT. Lens effects, grain and vignette don't go into a LUT.

```python
gradePreset("Ember")
exportGradeLut("shot010.cube", size=33)
exportGradeLut("shot010_full.cube", includeView=True)  # from scene light, tonemapper or view included
```

## Lens and film

The post process's **Lens** section picks a lens type for its flare, streaks and lens dirt; a light's **Lens Flare** gives it its own glare and ghosts, which fade as things pass in front of it. See [Lens flares](lens-flares.md).

**Halation** bleeds a warm glow round bright edges, **grain** takes a size, colour and how much it favours mid-tones, and **letterbox aspect** (2.39 for scope) mattes the picture; renders include the bars.

**Per-shot looks.** A camera's **Post Process** field names a post process it uses instead of the scene's. A post process set to a **box** or **sphere** volume applies only while the camera is inside it, fading over its **volume blend** distance; where volumes overlap, the higher **volume priority** wins.

## Depth of field and motion blur

On a camera, turn on **depth of field** and set **f-stop** and **focus distance**; **aperture blades** shape the bokeh and **anamorphic squeeze** stretches it tall. **Render > Pick Focus**, then click a surface, focuses the camera you look through on it. The view blurs as it moves (**Display > Live Depth of Field**) and refines when it holds still. Renders always show it.

**Motion Blur** in the Render panel blurs across the camera's **shutter angle** (180 is half the frame). **Display > Live Motion Blur** blurs the camera's own movement in the view and in playblasts.

**Physical exposure** on a camera exposes by its f-stop, shutter angle and **ISO** as a real camera does: one stop wider is twice as bright. The default camera (f/5.6, 180 degrees at 24 fps, ISO 100) keeps the scene's exposure.

## Show it on the web

**File > Export Web Viewer** writes a folder with `model.glb` and an `index.html` that turns the model in the browser, lit by the viewport's environment. Upload the folder to a web host (opening `index.html` straight from disk won't load the model).

## Troubleshooting

**Rendering needs a viewport.** Renders use the Lila window's view; they don't run in lilabatch.

**A render fails.** The viewport shows why in red, and the Script Editor logs it.

**The render is noisy or the blur grainy.** Raise **samples**. Depth of field and motion blur need 64 or more.

**Reflections show only the environment.** They need environment lighting (**Display > Lighting > Environment Lighting**) and a surface smoother than the roughness cutoff. Screen space reflections can't show what's off screen or hidden; set **Reflections** to **Traced** (the viewport's **Lighting** menu, or **Look** in the Render panel) where the GPU has ray tracing.

**The picture changed after turning on OCIO.** A view such as ACES rolls off highlights and desaturates differently from Lila's tonemapper; choose the view in the colour management node's **OCIO** section. If the top right of the view says OCIO failed, the config didn't load; see [Colour management](colour-management.md).

**A light's flare doesn't show.** It only draws while the light itself is on screen and not hidden behind something, with the view's post effects on.

**HEVC fails.** Windows needs the HEVC Video Extensions; use H.264 otherwise.

**The video won't play on Linux or macOS builds.** Video is Windows only; render an image sequence.

**A game running alongside slows down while you work in Lila.** The viewport draws up to the display's refresh rate while something changes. Lower **Preferences > Viewport > Frame Rate > Max frame rate**, or **In background** for while the game has focus.

**The view shimmers while it moves, then settles.** Temporal antialiasing is catching up. Preferences > Viewport > **Still frames averaged** sets how far it goes.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| Preferences > Viewport > Antialiasing > **Temporal** (`/viewport/aa/temporal`) | on | Smooths shading and texture shimmer as the view moves. |
| Preferences > Viewport > **AO method** > Ray traced (`/viewport/ao/mode`) | accurate | Occlusion traced against the scene: no halos, off-screen occluders count. Needs a GPU with ray tracing. |
| Preferences > Viewport > Frame Rate > **Max frame rate** (`/viewport/frameCap`) | Display refresh | -1 follows the monitor, 0 is unlimited, any other number is frames a second. "Play Every Frame" playback steps no faster than this. |
| Preferences > Viewport > Frame Rate > **In background** (`/viewport/backgroundFrameCap`) | Same as above | Cap while another app has focus. |
| Preferences > Viewport > Frame Rate > **VSync** (`/viewport/vsync`) | off | Waits for each display refresh. Turn on if the view tears. |
| `/viewport/post/reflections` | off | `off`, `screenSpace` or `rayTraced`. Ray-traced falls back to screen space without ray tracing. |
| `/viewport/post/reflectionCutoff` | 0.6 | Surfaces rougher than this reflect the environment only. |
| `/viewport/post/depthOfField` | on | Live depth of field in the view (when the camera's own is on). |
| `/viewport/post/motionBlur` | off | Live motion blur of the camera's movement in the view and playblasts. |
