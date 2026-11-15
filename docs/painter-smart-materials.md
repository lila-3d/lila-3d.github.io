# Painter smart materials

Convert Substance 3D Painter smart materials (`.spsm`) into Lila smart materials you drag from the smart material shelf onto meshes.

## Get it working

1. Drag `.spsm` files from Explorer onto the **Materials** tab of the Texture Set panel's shelf. Or choose **Texture > Import Painter Smart Materials...**, which opens in Painter's smart material folder and previews each file.
2. A toast reports how many came across. They appear on the shelf tagged **Imported**.

Each becomes a `.lilasmart` in your smart materials folder (`smartmaterials` under Lila's preferences folder), with its embedded images in a `<name>.images` folder beside it.

```python
texImportPainterSmartMaterials("D:/Painter/smart-materials")
```

To find them in a large library, use the shelf's filter button: pick tags such as **Stylized** and **Metal** to show only materials carrying all of them. Right-click a material, then **Tags**, to add or remove its tags; this works on built-in materials too and only changes your copy.

## Troubleshooting

**The toast says some materials had parts left out.** The log lists them per file. Lila can't evaluate Substance graphs, so these never come across:

- Custom Substance materials (`.sbsar`) used as a fill, such as a vendor's base material. The layer keeps its other channels; refill the missing ones with a Lila material.
- Painted strokes. Painter stores brush strokes, not pixels; repaint those masks in Lila.
- Channels Lila has no counterpart for: specular, diffuse, translucency, user channels.
- Filters with no Lila counterpart, such as Baked Lighting Stylized.

**The result looks different from Painter.** Painter's generators, noises and filters become their nearest Lila node, listed in the log as approximated (for example `mg_curvature as genEdgeWear`). Adjust the generator's settings on the mask; the layer structure, blend modes, opacities and plain values come across as they were.

**A material imports as several names.** It doesn't: older files keep the same material in several format versions, and only the newest is imported.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `folder` | your smart materials folder | Where the `.lilasmart` files and images go. |
| `overwrite` | `True` | Replace smart materials of the same name there. |

Pass folders as well as files; every `.spsm` in a folder is imported.
