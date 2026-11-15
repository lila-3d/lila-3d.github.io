# Snapshots and compare

A snapshot keeps a texture set as it looks now; compare then wipes between that snapshot and your live work (or a second snapshot) in the 3D viewport and the 2D View, so you see exactly what a change did.

## Get it working

1. Select the texture set and choose **Texture > Take Snapshot**.
2. Keep painting or editing layers.
3. Choose **Texture > Compare with Snapshot**. The snapshot shows left of the line, the live set right of it.
4. Drag the line across the viewport to move the wipe. The 2D View splits its channel at the same place.

```python
texSnapshot("RockTex", name="before rust")
texCompare("RockTex", enable=True, snapshot="before rust", wipe=0.5)
```

To compare two versions, for example two layers, take a snapshot with each visible, then compare one against the other: `texCompare("RockTex", enable=True, snapshot="layer A", against="layer B")`.

## Troubleshooting

**Compare says the set has no snapshot.** Take one first; snapshots last the session and aren't saved with the scene.

**The 2D View shows no split.** It splits channels only: pick a channel in its source list rather than a graph node.

**The snapshot side looks softer than the live side.** Snapshots keep 1024 pixels per tile side by default. Take one at full size with `texSnapshot("RockTex", resolution=0)`.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `texSnapshot(..., name=)` | Snapshot N | Names it; a snapshot of the same name is replaced. |
| `texSnapshot(..., resolution=)` | `1024` | Largest side of each tile's images; `0` keeps the tiles' own sizes. |
| `texCompare(..., against=)` | `live` | What shows right of the line: `live` or another snapshot's name. |
| `texCompare(..., wipe=)` | `0.5` | Where the line sits, `0` (all right side) to `1` (all snapshot). |

`texSnapshots("RockTex")` lists a set's snapshots and the memory they hold; unchanged regions are stored once across snapshots. `texDeleteSnapshot("RockTex", "before rust")` frees one.
