# Rendering

Renders are the viewport's own picture, supersampled: post process, depth of field and motion blur included, with no grid, wires or selection.

## Get it working

1. **Render > Render Output** to pick the camera, samples and where images and video go.
2. **Render > Render Frame** for a still, **Render Sequence** for the frame range, **Render Turntable** for a loop around the selection.

```python
render(path="hero.png", camera="shotCam", samples=128)
renderSequence(video="shot.mp4", samples=64, motionBlur=True)
renderTurntable(video="turntable.mp4", frames=120, spin="object")
```

- **Images** take `####` for the frame number. `.exr` keeps the scene's light before tonemapping, for compositing.
- **Transparent background** gives PNG, TIFF and EXR an alpha channel.
- **Video** is an `.mp4`, H.264 or HEVC, encoded on the GPU where it can be.
- `renderPass="wireframe"` draws every edge over the picture, for breakdowns; `renderPass="id"` gives each object a flat colour from its name, for mattes.
- Settings save with the scene; script flags override them for that call.

## Look

**Render > Post Process** selects the scene's post process (making one if there's none). Its attributes set the tonemapper (Neutral, AgX, ACES), exposure and auto exposure, white balance, contrast, saturation, lift/gamma/gain, bloom, vignette, grain, chromatic aberration, lens distortion, sharpen, a `.cube` LUT, and height fog lit by the sun. The viewport shows it too; **Render > Post Effects** turns its grading and lens effects off in the viewport only.

A material's **Bevel** (cm) rounds its hard edges as it shades, traced against the real geometry, like a high-poly bevel without the polygons (GPUs with ray tracing). Bake a **roundedNormal** map to keep the look in a game engine.

**Render > Three-Point / Rim / Product Light Rig** puts area lights around the selection, aimed and sized to fit it.

For framing, **Render > Safe Frames** and **Rule of Thirds** draw inside the resolution gate.

## Depth of field and motion blur

On a camera, turn on **depth of field** and set **f-stop** and **focus distance**; **aperture blades** shape the bokeh. Look through the camera and hold still: the view settles into the blur. Renders always show it.

**Motion blur** in Render Output blurs across the camera's **shutter angle** (180 is half the frame).

## Show it on the web

**File > Export Web Viewer** writes a folder with `model.glb` and an `index.html` that turns the model in the browser, lit by the viewport's environment. Upload the folder to a web host (opening `index.html` straight from disk won't load the model).

## Troubleshooting

**Rendering needs a viewport.** Renders use the Lila window's view; they don't run in lilabatch yet.

**The render is noisy or the blur grainy.** Raise **samples**. Depth of field and motion blur need 64 or more.

**HEVC fails.** Windows needs the HEVC Video Extensions; use H.264 otherwise.

**The video won't play on Linux or macOS builds.** Video is Windows only for now; render an image sequence.

**The view shimmers while it moves, then settles.** That's temporal antialiasing catching up; it settles within a few frames of holding still. Preferences > Viewport > **Still frames averaged** sets how far it goes.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| Preferences > Viewport > Antialiasing > **Temporal** (`/viewport/aa/temporal`) | on | Smooths shading and texture shimmer as the view moves. |
| Preferences > Viewport > **AO method** > Ray traced (`/viewport/ao/mode`) | accurate | Occlusion traced against the scene: no halos, off-screen occluders count. Needs a GPU with ray tracing. |
