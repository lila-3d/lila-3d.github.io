# Lights

Lila has no lighting of its own: nothing lights the viewport, and there is no renderer. Lights here are placeholders that hold a light's settings, so lights survive import, save and export, and light extensions can render them.

> A custom C++ extension can add its own lights and render them: see [Make your own lights](#make-your-own-lights).

## Get it working

1. **Create > Light**, then pick a type.
2. Set colour, intensity and its units, cone, size and so on in the attribute editor.

```python
light(type="spot", intensity=800, units="candela", outerConeAngle=30, position=[0, 300, 0])
```

Spot, directional, area and disc lights shine down their local -Z, the same way a camera looks.

The **Placeholder Lights** extension only places and draws them. A light extension renders them. Lights that nothing renders have their **outliner icon struck through**.

Lights keep their original units and any settings Lila has no field for, so they come back out the same in the format they came in.

<!-- TODO image: outliner with a struck-through placeholder light next to a normal one (images/lights/outliner.png) -->

## Troubleshooting

**Every light is flagged.** No enabled extension renders lights. Enable one in **Windows > Extension Manager**, or turn off **Show > Flag Placeholder Lights** in the outliner.

**Some lights are flagged and others aren't.** The enabled light extension doesn't handle those types (a renderer with no dome light, for example). Placeholder Lights stands in for those lights.

**Create > Light is gone.** A light extension is enabled, so Placeholder Lights hands creation over to it and removes its own menu. Use that extension's menu, or the `light` command.

**A light draws as a crosshair.** Neither Placeholder Lights nor a light extension is enabled. The light is still there and still exports.

## Make your own lights

A C++ extension registers a light provider. Lights it handles stop being placeholders. Placeholder Lights removes its menu and drawing while any provider is installed.

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
| Outliner **Show > Flag Placeholder Lights** (`/outliner/flagPlaceholderLights`) | on | Strikes through the icon of lights that nothing renders. |
