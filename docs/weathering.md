# Weathering

Age, damage and overgrow anything (a mesh, a Blockwork level, a Masonry wall), in realistic or toon style, from your own pieces.

![Four blocks aged with Abandoned, Overgrown, Demolished Building and Abandoned Toon, on a Rubble Ground](images/weathering/overview.png)

## Get it working

1. Select what to age: meshes, a group, or a Blockwork visgroup.
2. Open **Level > Prop Library**, go to the **Presets** tab and double-click a preset, or drag it onto an object in the viewport.
3. The result lands in one group, as one undo step. It stays live: move or edit a block and its weathering rebuilds.

![The Presets tab of the Prop Library](images/weathering/presets.png)

```python
weather("Shed", preset="Abandoned")                  # rubble, planks, weeds, grunge, worn edges
weather("Ruins", preset="Overgrown", style="toon")   # ivy, moss, bushes, in the toon look
groundDressing("Yard", preset="Asphalt Crack")       # scatter, ground material and tint
```

**Use your own pieces.** Every preset fills its pieces (rubble, planks, ivy leaves, roof tiles) from the library by role. Select your meshes and run **Level > Weathering > Add Pieces** with a role, and every preset uses them instead of the placeholders. To use them once, pass them in a slot:

```python
weatheringAddPieces(["Chunk1", "Chunk2", "Chunk3"], role="rubble", style="toon")
weather("Shed", preset="Concrete Debris", slots={"rubble": ["MyRubble_grp"]})
```

Roles: `rubble`, `rock`, `brick`, `plank`, `beam`, `charred`, `plant`, `grass`, `moss`, `bush`, `pebble`, `litter`, `leaf`, `ivy-leaf`, `ivy-flower`, `roof-sheet`, `roof-tile`, `roof-plank`, `ridge-cap`, `window-frame`, `window-sill`, `window-glass`, `window-board`, `wire-insulator`, `wire-bracket`, `pole`, `roof-vent`, `ac-unit`, `roof-pipe`, `railing`, `tower`, `edge-trim`.

**Age a whole level.** Run `weather` on the level group or a visgroup. More than 12 meshes are dressed in tiles, so editing one block rebuilds only its tile. The result joins the `Weathering` visgroup.

**Send to Unreal.** Run **Level > Weathering > Build Unreal Materials** once per project, then send as usual. Ground tint, grunge, ivy and window interiors each ship a material function (`MF_LilaGroundTint`, `MF_LilaGrunge`, `MF_LilaFoliageWind`, `MF_LilaInterior`) to drop into your own materials, and a generated material built on it.

## Troubleshooting

**The result says "edge decals skipped".** Edge decals need the Trim Sheets extension. Turn it on in **Windows > Extension Manager** and run the preset again.

**Editing blocks is slow while blocking out.** Select the weathering group and run **Level > Weathering > Pause Weathering**. **Resume Weathering** brings it back, rebuilt for the blocks as they are now.

**The ground tint result lists `static` sources.** Those sources read the ground themselves (their grunge sees it, or they stand on it as a scatter), so they are taken as they stand. Run `groundTint` again after moving them.

**Pieces are grey boxes or the wrong style.** Placeholders fill any role you haven't supplied. Add your own with Add Pieces, tagged with the style (`realistic` or `toon`) your preset uses.

**Edge wear covers a whole smooth mesh.** Grunge edge wear follows sharp edges. On a smooth-shaded mesh without hard edges, add hard edges or lower the edge angle in the Grunge Masks option box.

## Options

| Preset | Adds |
| --- | --- |
| Concrete Debris | Rubble at the base, grunge |
| Bricks and Rocks | Loose bricks and stones at the base |
| Leaning Planks | Boards and beams leaning on the walls |
| Demolished Building | Chipped edges, grunge, rubble, bricks and timber |
| Burned Yard | Grunge, charred boards, rubble |
| Abandoned | Grunge, worn edge decals, leaning planks, weeds, litter |
| Overgrown | Ivy, moss edge decals, moss, weeds, bushes |
| Weathered Concrete | Chipped edges, grunge, edge decals |
| Rusted Metal | Grunge, worn edge decals |
| Industrial Grime | Grunge, dirt in the corners |
| Rubble Ground, Asphalt Crack, Dirt and Litter, Grass Patches, Moss Floor | Ground scatter, ground material and tint |

Each has a Toon version. Save your own from Python with `arrangementSave` and `"category": "Weathering"`; it shows in the Presets tab.

The parts run on their own from **Level > Weathering**: Base Dressing, Ground Dressing, Ground Tint, Pile, Rooftop Clutter, Grunge Masks, Edge Decals, Edge Chip, Ivy, Ivy Brush, Roofing, Windows, Wires and Curve to Truss. **Masonry** buildings take `weather=` to age a new building as it is made.
