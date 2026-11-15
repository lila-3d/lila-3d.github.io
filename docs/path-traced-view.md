# Path traced view

The path-traced view shows your scene with real bounced light, reflections and soft shadows from the environment and the scene's lights, refining while the view holds still, so you judge a texture set the way a final render would show it.

## Get it working

1. Choose **Display > Path Traced** (also in the viewport's display popup, next to Antialiasing).
2. Hold the camera still: the noise clears over a second or two.
3. Paint, move the camera or change a material: the view starts again from a few samples and refines.

```python
pathTracedView(enable=True)
```

It lights with the viewport's environment (**Display > Environment**), its rotation and intensity, plus every light in the scene. Texture sets, opacity cutouts, translucency and emissive maps all show. Wires, gizmos and the HUD draw over it as usual.

## Troubleshooting

**A message says Path Traced needs a GPU with ray tracing.** The GPU or driver has no ray queries. The viewport stays shaded; update the driver, or use a GPU from the last few generations.

**The view never settles.** Something keeps changing: a playing animation, a live simulation or a tool that redraws each frame. Pause it.

**Bright speckles in glossy areas.** Those are rare light paths. They fade as samples come in; raising `samples` lets it run longer.

**Sculpting or modelling feels slow.** Every change starts the image over. Turn the view off while you edit geometry.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `enable` | off | Path traces every viewport. |
| `bounces` | `4` | Most surfaces a path bounces off. More brightens deep crevices and glass, and costs time. |
| `samples` | `1024` | Samples per pixel the image refines to, then the GPU rests. |
| `denoise` | on | Smooths the first samples' noise along surfaces, and fades out as samples come in. Also **Display > Path Traced Denoise**. |

`viewportStats()` reports `pathSamples`, the samples behind the image so far.
