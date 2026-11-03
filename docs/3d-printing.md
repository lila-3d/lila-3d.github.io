# 3D printing

Get a mesh ready for the slicer: closed, thick enough, sized for your printer, hollowed or split if it needs to be, then out as STL or 3MF. Everything is on the **Print** menu (Modeling menu set) and the **Print** shelf.

<!-- media: Wall Thickness map on a sculpt with the viewport legend -->

## Get it working

1. Pick your printer in **Preferences > Print > Printer**. Its build volume, minimum wall and support angle become the defaults for every Print tool.
2. Select the mesh and run **Print > Check**. Each problem appears in **File > Validation**: click it to select the faulty components, and click its fix to repair it.
3. Run **Print > Wall Thickness** and **Print > Overhangs** to see thin walls and the faces that need support. **Print > Clear Analysis** takes the colours off.
4. Run **Print > Info**. The Script Editor logs the size in mm, volume, support area and whether it fits the printer. **Print > Scale to Fit** shrinks it into the build volume.
5. Export with **File > Export Selection** as STL or 3MF. The option box shows the size in mm and whether it fits the printer under the unit.

```python
printCheck('Statue', minWall=1.2)
printAnalyze(mode='overhang', angle=50)
printHollow('Bust', thickness=2.5)
printSplit('Statue', point=(0, 20, 0), normal=(0, 1, 0), pegs=2)
export3mf('C:/prints/statue.3mf', 'StatueTop', 'StatueBottom')
```

## Prepare the print

- **Hollow** keeps a wall of the given thickness and drills one drain hole at the lowest point. Use it for resin prints and to save material.
- **Drain Hole** drills at the selected components. With nothing selected in component mode, click the selected mesh where the hole goes.
- **Split** cuts a closed mesh by a plane into `<name>Top` and `<name>Bottom`, with pegs on the bottom part and matching holes on the top, then hides the original.
- **Lay Flat** turns each mesh onto the side that needs the least support and stands it on the ground plane.

## Troubleshooting

**Separate shells or thin walls have no fix.** They need modeling: merge the shells (boolean union) or thicken the wall, then run **Print > Check** again.

**Self-intersections fix remeshes the whole mesh.** The fix is a voxel remesh at resolution 256, which loses edge flow and UVs. Fix the overlap by hand if the topology matters.

**Hollow folds or pokes through on tight concave detail.** The inner wall is an inward offset of the surface. Lower **Thickness**, or smooth the detail first.

**Split left out a peg.** A peg wider than a hollowed part's wall is skipped. Lower **Peg Radius** or hollow with a thicker wall.

**Wrong size in the slicer.** STL has no unit; the slicer assumes mm. Export 3MF, which stores the unit, or check the size note in the export option box.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| **Preferences > Print > Printer** | Prusa MK4 | Presets for Prusa MK4 and MINI+, Bambu Lab X1 / P1 and A1 mini, Creality Ender-3, Voron 2.4 350, Formlabs Form 4, Elegoo Saturn 4 Ultra, or **Custom**. |
| **Preferences > Print > Custom Printer** | 200 x 200 x 200 mm, 0.4 mm nozzle, 0.8 mm wall, 45° | Build volume, nozzle, minimum wall and support angle for **Custom**. |
| Check, Wall Thickness: **Min Wall** | printer's | Thinnest wall that prints, in mm. |
| Overhangs, Lay Flat: **Support Angle** | printer's | Degrees from vertical that print without support. |
| Hollow: **Thickness**, **Drain Hole**, **Hole Radius** | 2 mm, 1, 2.5 mm | Wall left inside, whether to drill a hole, its radius. |
| Split: **Pegs**, **Peg Radius**, **Peg Length**, **Tolerance** | 1, 2.5 mm, 6 mm, 0.2 mm | Pegs along the cut (0 for none, up to 8) and the clearance added to their holes. |
| Scale to Fit: **Margin** | 5 mm | Room kept free at the bed's edges. |
| 3MF export: `unit`, `colors` | mm, on | The file's unit, and whether the current colour set goes out as vertex colours. |
