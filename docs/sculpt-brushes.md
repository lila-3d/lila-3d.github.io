# Brushes, presets and alphas

Add your own sculpt brushes: presets you save from the Sculpt panel, alpha images that shape a brush's tip, and brushes with new behaviour from an extension.

| You want | Make |
| --- | --- |
| A brush set up your way: Dam Standard with a sharp falloff and a pore alpha | A [preset](#presets) |
| A brush tip shaped like a stamp, crack or pattern | An [alpha](#alphas) |
| A brush that moves the surface in a new way | An [extension brush](#extension-brushes) |
| Your team's brushes in everyone's Lila | A [studio or project folder](#share-with-a-team), or an [extension pack](#ship-a-pack) |

## Presets

A preset is a brush with its settings and alpha under a name of its own, in one `.lilabrush` file.

1. In the Sculpt panel, pick a brush and set it up: strength, falloff, spacing, alpha and the rest of **Stroke**.
2. Under **Presets**, click **Save Preset** and name it. It appears as a button there.
3. To share it, right-click the button > **Export...**. The alpha is inside the file.
4. To install someone else's, drop `.lilabrush` files on the Sculpt panel or the main window, or click **Import**.

Changes you make with a preset picked stay with that preset. To update the preset file itself, save again under the same name; a new name makes a new preset. A preset always brings its own strength and stroke settings, whatever **Shared** says; only **Radius** carries over from the brush before.

```python
brushPresetSave("Deep Wrinkle", brush="damStandard", settings={"strength": 0.8, "falloff": "sharp"})
sculptBrush(preset="user/Deep Wrinkle")
```

## Alphas

Every brush's **Stroke > Alpha** picker lists the images in the alpha folders (type to filter). White is where the brush acts and black where it doesn't, so pores, cracks and panel lines raise; hold Ctrl to cut them in.

1. Put a grayscale image in `%APPDATA%/Lila/prefs/alphas`, or use the library button beside the **Alpha** field to copy one in.
2. Pick it in **Stroke > Alpha**.

Dropping an image file on the field uses it without copying it. PNG, EXR, TGA, TIFF and PSD load; JPG doesn't.

## Extension brushes

A brush with new behaviour is C++ in a [C++ extension](cpp-extensions.md). `sculpt::registerBrush` adds a button to the Sculpt panel and a brush name that presets and `sculptStroke` take. `displace` returns each point's move for one dab; Lila applies the mask, freeze, symmetry, polypaint and undo around it. It runs on many threads at once, so it may only read.

```cpp
#include <lila/Sculpt.h>

sculpt::BrushDef lift{.label = "Lift", .icon = "arrow-up", .doc = "Raise the surface straight up."};
lift.displace = [](const sculpt::BrushArea& area, const sculpt::BrushSample& p) {
    return glm::dvec3(0.0, 1.0, 0.0) * (p.weight * area.radius * 0.03 * area.sign);
};
sculpt::registerBrush(ctx, "lift", std::move(lift));
```

`area` has the dab's average `normal` and `center`, its `radius`, and `sign` (-1 while Ctrl inverts). `p` is one point: its `position` and `normal` in object space and its `weight` (falloff, strength, pressure and mask in one, usually 0 to 1).

## Share with a team

Lila reads presets and alphas from these folders. A subfolder becomes a category.

| Folder | Holds |
| --- | --- |
| `resources/brushes`, `resources/alphas` beside Lila | Lila's own |
| `resources/brushes`, `resources/alphas` in an extension | The extension's |
| `brushes` in the [studio folder](studio-setup.md) | The studio's presets |
| `%APPDATA%/Lila/prefs/brushes`, `%APPDATA%/Lila/prefs/alphas` | Yours, on every project |
| `<project>/.lila/brushes`, `<project>/.lila/alphas` | The project's, shared through source control |

Only your presets and the project's delete from the right-click menu; **Show in Folder** finds the rest.

## Ship a pack

An extension can carry brushes, presets and alphas together. Without extension brushes it needs no DLL at all: a manifest and a `resources` folder are a whole extension.

```
MyBrushes.lilaext/
  extension.json
  MyBrushes.dll            only for extension brushes
  resources/
    brushes/Skin/Pores.lilabrush
    alphas/Skin/pores.png
```

`extension.json` for a pack without a DLL:

```json
{ "id": "MyBrushes", "name": "My Brushes", "version": "1.0.0", "sdk": "1.0", "resources": "resources" }
```

Copy the folder into `%APPDATA%/Lila/extensions` and enable it in **Windows > Extension Manager**.

A preset in the pack can drive the pack's own brush by its registered name, and refer to its alphas as `alpha://<extension id>/Skin/pores.png`. Lila embeds a copy of the alpha in every preset it saves, so a preset still works when the pack is gone.

## Troubleshooting

**A preset's button is missing.** The file isn't a brush preset or names no brush: the log says which, after `Brush presets:`.

**Clicking a preset does nothing.** It drives a brush from an extension that isn't loaded, and the log says `no brush named`. Enable the extension in the Extension Manager.

**Studio presets are gone.** They're read straight from the studio folder, so they show only while it can be reached.

**An extension brush's button doesn't appear.** Its name is taken (a built-in or another extension's), or `displace` is empty. The log says which.

## File format

A `.lilabrush` file is JSON. Texture paint presets use the same format and folders; `tool` tells them apart.

```json
{
  "format": "lilabrush",
  "version": 1,
  "tool": "sculpt",
  "name": "Pores",
  "icon": "",
  "doc": "Fine pores for skin.",
  "sculptBrush": "draw",
  "brush": { "strength": 0.3, "falloff": "sharp", "spacing": 0.08 },
  "alphaRef": "alpha://MyBrushes/Skin/pores.png",
  "alphaImage": { "name": "pores.png", "data": "<base64>" }
}
```

| Key | What it does |
| --- | --- |
| `sculptBrush` | The brush it drives: a built-in's name (`draw`, `clayStrips`, `damStandard` ...) or an extension brush's. |
| `brush` | Stroke settings. Keys left out take the defaults. `brushPresets()` and an exported preset show every key. |
| `icon` | An icon name from Lila's icon set. Empty shows the alpha, else the brush's own icon. |
| `alphaRef` | A library alpha. Used while it exists. |
| `alphaImage` | The alpha's bytes, used when `alphaRef` is gone. Optional when writing a preset by hand. |
