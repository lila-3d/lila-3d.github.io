# Trim Sheets

One tiling texture of bevelled strips and panels, shared by every mesh that maps onto it: made from a preset, baked, textured, applied by hand or automatically, and sent to Unreal.

## Get it working

1. In the Level Toolkit's **Trim Sheets** section, pick a preset and press **New**. The sheet is generated and baked (normal, AO, curvature, height, cavity); the first time takes a few seconds.
2. Press **Texture** to put the preset's smart material on it. Wear, dirt and chips follow the baked bevels.
3. Press **Test** to see it on a blockout (wall, beam, steps, pillar, slab) at real sizes before mapping your own meshes.
4. Select faces or meshes and press **Auto**. Each island goes to the trim that fits its shape and world size, running up the trim where its faces stand up. Faces taller than every strip are cut into courses at the tallest strip's height, so a wall becomes rows of boards or panels at true scale (`trimAuto(sliceOversized=False)` keeps them whole). Press **Cycle** for the next-best fit, or click a trim in the palette to put the selection on that one.
5. Press **Unreal** to send it (connected with `unrealConnect()`).

```python
trimSheetCreate(preset="industrialMetal")
trimSheetTexture()
trimAuto()                      # on the selection
trimSheetSend(wait=True)
```

<!-- TODO image: a blockout building trimmed in one click, next to the sheet (images/trim-sheets/auto.png) -->

Sheets are `.lilatrim` files in `<workspace>/TrimSheets`, textures beside them in `<name>_Textures`. Every mesh mapped onto a sheet uses the material `M_<name>`, so one change to the sheet shows everywhere.

### Lay out your own

**Level > Trim Sheets > Trim Sheet Editor** shows the current sheet over its bake. Drag a border to resize a strip or a row (it snaps to the mip grid; hold Shift for single pixels), right-click a trim to split or delete it, and set its kind, bevel style, bevel width and tags below. Press **Bake** when done: profile changes rebake only the trims you changed. Double-click a trim to map the selection onto it.

Start from **Power-of-Two Ladder** for a plain layout to divide up, or import one: `trimSheetImport("layout.rect", width=2048, height=2048)` reads a Valve `.rect`, an SVG of rectangles, an ID map image, or a mesh's UV islands.

### Texture and paint

`trimSheetTexture(material=...)` adds a smart material on top of the last, and `trims=` keeps it to some trims by index, name or tag:

```python
trimSheetTexture(material="Rusty Iron", trims=["edge"])   # only the thin edge strips rust
trimSheetTexture(replace=True)                            # start over from the sheet's own material
```

The texture set is `TS_<name>` in the Texture Set panel, with a **Sheet Bake** layer at the bottom carrying the baked normal and AO. Edit it like any other set. Three texture nodes read the sheet: **Trim Mask** (white on trims first to last), **Trim Gradient** (where a texel sits inside its trim, plus a random value per trim) and **Trim Sheet Normal**.

**Paint** puts a flat `<name>_Sheet` plane in the scene and starts texture painting on it. Strokes land on the sheet itself, so every mesh using it shows them. The UV editor paints the sheet too.

### Edges, curves and decals

| Tool | What it makes |
| --- | --- |
| **Edges** (`trimEdges`) | Chamfers the selected edges and maps the chamfers onto a thin edge strip, with weighted normals so the big faces stay flat. |
| **Decal** (`trimDecal`) | A strip floating over the selected edges, half on each face, its crest on the edge. A separate `<mesh>_Decal`. |
| **Trim Cut** (`trimDecal(cut=True)`) | The same strip carved into the mesh as a groove `depth` cm deep. |
| **Curve** (`trimAlongCurve`) | A strip along the selected curves, tiling without stretching, with caps from the sheet's `cap`-tagged trim at the ends. `orient="wall"` stands it up. |

### Live in geometry nodes

The **Hotspot UV** node re-maps its input onto a sheet whenever the input changes, so procedural blockouts stay trimmed while you edit them. **Trim Sheet Generator** outputs a sheet's high and low.

## Troubleshooting

**Auto puts a face on a trim that is far too big or small.** Nothing on the sheet is near its world size; `trimAuto(showError=True)` paints poor matches red in the colour set `trimError`. Change the sheet's **pxPerM** (`trimSheetEdit(values={"pxPerM": 1024})`) or add a strip of that height.

**Strips show a seam where the texture repeats.** Rebake: `trimSheetBake()` reports `seamError`, and anything above about 0.02 means the sheet was baked without tiling (a hand-made high that doesn't run past the sheet's sides).

**The smart material covers the whole sheet when it should be on some trims.** `trims=` was a tag no trim has. `trimSheetInfo()` lists each trim's tags.

**Unreal shows the plain procedural paint, not the textured sheet.** Send again after **Texture**: the instance's **UsePaintedMaps** switch turns on only when the sheet has a texture set.

**"the LilaLink plugin in this editor is too old for trim sheets".** Rebuild LilaLink from Lila's `ue/LilaLink`.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `pxPerM` | per preset | Texels per metre; sets every trim's world size. |
| `padding` | 8 | Texels dilated past each trim when baking. |
| `mipLevel` | 3 | Borders on multiples of 2^mipLevel px stay clean down to that mip; the editor snaps to it. |
| `maps` | normal, ao, curvature, height, cavity | What the bake writes. |
| `supersampling` | 16 | Samples per texel when baking. |

Change any of them with `trimSheetEdit(values={...})` and rebake. In Unreal, `M_LilaTrim` in `/Game/LilaLink/Masters` is made once and then yours to edit; `trimSheetSend(regenerateMaster=True)` rebuilds it.
