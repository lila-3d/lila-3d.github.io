# Lights

Lights light and shadow the viewport and renders, on top of the environment.

> A custom C++ extension can add its own lights and render them: see [Make your own lights](#make-your-own-lights).

## Get it working

1. **Create > Light**, then pick a type.
2. Set colour, intensity and its units, cone, size and **cast shadows** in the attribute editor.

```python
light(type="spot", intensity=8, outerConeAngle=30, position=[0, 300, 0])
```

Spot, directional, area and disc lights shine down their local -Z, the same way a camera looks. An intensity of 1 (unitless) lights about as brightly as the default environment, at a metre for point, spot and area lights.

Lights keep their original units and any settings Lila has no field for, so they come back out the same in the format they came in.

## Troubleshooting

**A light makes no shadow.** Check **cast shadows** is on. On GPUs with ray tracing the first four shadowed lights of any kind trace their shadows (**Render > Ray-Traced Shadows**), soft by the light's size (a directional light's **source radius** is its angle in degrees). Without ray tracing only directional and spot lights cast shadows, from the first four.

**Shadows look blocky while the view moves.** They soften and settle as soon as the view holds still. Turn on **Antialiasing > Temporal** in Preferences > Viewport if it's off.

**The scene is far too bright or dark with lights from another app.** Lila keeps the file's intensity and its units: candela or lux from glTF, nits from USD, unitless from Maya and FBX (FBX stores 100 for 1). Physical units are scaled down by 100 to sit with the environment; set the light's units to unitless and the intensity to taste.

**Lights don't light anything in Flat lighting.** Flat shows base colours only. Switch the viewport to Environment or Studio lighting.

**A light draws as a crosshair and lights nothing.** The Lights extension is off. Turn it on in **Windows > Extension Manager**.

**An area, disc or dome light is missing from a glTF file.** glTF only has point, spot and directional lights. The export warns about each light it leaves out.

**An Arnold mesh light came in as a plain transform.** Lila has no mesh lights. The import report lists it.

## Make your own lights

A C++ extension registers a light provider. Lights it handles are its own: Lila no longer lights them, and the extension renders them.

```cpp
#include <lila/Extension.h>
#include <lila/Lights.h>

LILA_EXTENSION_EXPORT int lilaExtensionInit(lila::ext::Context& ctx)
{
    using namespace lila::scene;
    lights::registerProvider(ctx, {.id = "myRenderer", .name = "My Renderer",
                                   .handles = [](const Node& n) { return lights::settings(n).kind != lights::Kind::Dome; }});
    return 0;
}
```

- Leave `handles` empty to handle every light.
- Read a light with `lights::settings(node)`. `lights::effectiveColor` folds in the temperature.
- If more than one provider handles a light, the one named in the light's **provider** attribute goes first, then the first one registered.
- For a light type with your own attributes, register a node type derived from `light`, with its own draw override (`lila/Viewport.h`).

See [C++ extensions](cpp-extensions.md) for building and loading.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| Outliner **Show > Flag Placeholder Lights** (`/outliner/flagPlaceholderLights`) | on | Strikes through the icon of lights nothing renders. |
