# Painter smart materials

Convert Substance 3D Painter smart materials (`.spsm`), smart masks (`.spmsk`) and brush presets (`.sppr`) into their Lila equivalents on the Texture Set panel's shelf.

## Get it working

1. Drag the files (or a whole folder of brush presets) from Explorer onto the Texture Set panel's shelf. Or choose **Texture > Import from Painter...**, which opens in Painter's smart material folder and previews each smart material.
2. A toast reports how many came across. Smart materials and masks appear tagged **Imported**; brush presets appear in the **Imported** brush category.

Smart materials and masks become `.lilasmart` files in your smart materials folder (`smartmaterials` under Lila's preferences folder), with embedded images in a `<name>.images` folder beside them. Brush presets go to `brushes/Imported` there.

```python
texImportPainterSmartMaterials("D:/Painter/smart-materials")
```

To find them in a large library, use the shelf's filter button: pick tags such as **Stylized** and **Metal** to show only materials carrying all of them. Right-click a material, then **Tags**, to add or remove its tags; this works on built-in materials too and only changes your copy.

## Troubleshooting

**The toast says some materials had parts left out.** The log lists them per file. Lila can't evaluate Substance graphs, so these never come across:

- Custom Substance materials (`.sbsar`) used as a fill, such as a vendor's base material. The layer keeps its other channels; refill the missing ones with a Lila material.
- Painted strokes. Painter stores brush strokes, not pixels; repaint those masks in Lila.
- Brush tips. A brush preset's settings come across, but its tip becomes the library alpha closest to it by name, or a round tip when none is close.
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
