# Stagehand (set dressing)

Push, drop and settle props into place with physics, fill shelves and scatter debris, place assets from a prop library, and snap modular kit pieces together.

## Get it working

**Push things into place by hand.** Select what may move, then **Level > Physics Tools > Grab with Physics**. Whatever touches the selection may move too; everything else is hit but stays put.

| Key | Does |
| --- | --- |
| 1 to 6, Tab | Grab, Push, Wiggle, Drop, Shake, Sweep |
| Ctrl-click | Pin or unpin an object, to push others against it |
| P | Pause |
| L | Slow motion |
| K | Auto keep on or off: on (the default), each drag is kept as its own undo step once everything comes to rest |
| [ ] | Wiggle and Sweep brush size |
| Shift (Sweep) | Gather under the brush instead of sweeping along the stroke |
| Enter | Keep, as one undo step |
| Esc | Put everything back |

Leaving the tool keeps the result.

**Settle, push and drop from a script.**

```python
settle(["mug", "plate"])                              # fall and rest on what is below
push("book_01", direction=[1, 0, 0])                  # topple a row of books
sweep(["can_01", "can_02"], path=[[0, 0, 0], [200, 0, 0]])   # broom litter along a stroke
drop("mug", onto="desk", at=[40, 0, 10])
dressCheck(["mug", "plate"])["issues"]                # anything floating, overlapping or about to fall
```

**Place from the prop library.** A starter set comes built in: crates, barrels, pallets, beams, I-beams, pipes, panels, cable spools and scaffolding (`Industrial/`), stone chunks S to XL, a rubble pile, a broken slab and rebar (`Debris/`), lockers, consoles, supply crates and cable trays (`Facility/`), each with its physics. **Level > Prop Library**, then drag a thumbnail into a viewport. It stands on the surface under the cursor. Hold Shift on release to drop it with physics, Ctrl to place an independent copy instead of an instance. **Add Selection** saves the selection as a new asset.

```python
librarySearch("wooden crate")
librarySearch(tags=["debris", "stone"], maxSize=50)             # small rubble
place("Industrial/Barrel", on="Floor", count=6, jitter=10)
replaceWith(["box1", "box2"], asset="Props/Crate", fit=True)   # blockout cubes into crates
```

**Fill a shelf.**

```python
fillShelf(["Shelf_1", "Shelf_2"], items=["Books/Hardback", "Books/Paperback"], sag=True)
```

This makes a live arrangement; its seed, gap and lean inputs re-arrange it. `realize=True` places real objects to push, edit and check one by one. `scatterProps`, `pileProps` and `stackProps` work the same way.

**Line a curve with props.** `pathProps` spaces items along curves and stands each on the surface below: litter along a kerb, cones down a road, posts along a fence.

```python
pathProps("Kerb", items=["Debris/Rebar", "Debris/RebarBent"], spacing=60, offset=40, spread=20, along=False)
```

<!-- TODO image: a bookshelf filled with fillShelf, some books leaning, a stack lying flat, the boards sagging (images/stagehand/shelf.png) -->

**Dress a place from a preset.** Built-in presets: Storeroom, Rubble Corner, Library Shelf and Messy Desk. Each fills slots you name, such as the floor, the boards or the books, and runs as one undo step.

```python
arrangePreset("Storeroom", slots={"floor": "Floor"})
arrangePreset("Rubble Corner", slots={"floor": "Ground", "broken": ["Wall_pieces"]}, seed=4)
arrangePreset("Library Shelf", slots={"boards": ["Shelf_1", "Shelf_2"], "books": ["Books/Hardback"]})
```

`arrangementPresets()` lists the presets with their slots. `arrangementSave("My Corner", spec={...})` saves your own preset; `tier="workspace"` shares it with the project in `<workspace>/ArrangementPresets/`.

**Strew debris around broken things.** `debrisProps` drops chips beside each piece of a fracture, ruin or wall, sized from the piece, and settles them. It uses the starter stone chunks unless you give `items=`.

```python
debrisProps("Wall_fractured", amount=8)
```

**Settle debris from Fracture or a scatter.** Turn the geometry-nodes instances into objects first, then settle them like anything else.

```python
r = instancesToObjects("Wall", material="stone")     # Fracture pieces, each a dynamic stone body
settle(r["objects"])
```

`mode="instance"` (the default) makes copies of one mesh scene instances of each other, so a scatter goes to Unreal as instances; `mode="unique"` gives each its own mesh.

**Snap kit pieces.** Give each piece snap points where it joins others, then drag pieces with **Level > Level Kit > Kit Place Tool**: they jump to compatible points.

```python
addSnapPoint("Wall_A", type="wallEnd", position=[200, 0, 0], normal=[1, 0, 0])
snapTo("Wall_B", target="Wall_A")
openSnapPoints()        # joins still missing
```

**Send to Unreal.** `unrealPlaceInstances` (and every mesh sync) writes each body's collision shape as `UCX_` hulls, and gives each placed actor its physical material (`PM_<material>`), mass and Simulate Physics. Group placed props into an assembly to send them as one Level Instance:

```python
assemblyCreate(["Gate_L", "Gate_R", "Gate_Arch"], name="Gate", kind="packedLevelActor")
unrealPlaceAssembly("Gate", folder="/Game/Kits")
```

`libraryAdd("Gate", collection="Kits")` saves an assembly to the library: its library props by id and where they stand, anything else in it as its own model. Assemblies can hold assemblies; `place("Kits/Gate")` puts the whole thing down. Saved assemblies show in the Prop Library and `librarySearch` like any prop; their results carry `assembly` with the members.

## Troubleshooting

**The shelf moves when I push a book.** A shelf no bigger than 8 times the book counts as something it can knock. Mark it static: `physicsBody("shelf", role="static")`, or pass `movable=[...]`.

**Nothing happens with the Push tool.** Select the meshes that may move first; the tool only moves the selection, what touches it and meshes with a dynamic physics body.

**Things fall forever.** Without a mesh underneath, a floor plane at `groundHeight` (0) catches them. Set `groundHeight` or give `colliders=`. Meshes more than `reach` (300 cm) from every mover aren't in the simulation; raise `reach=` for a long drop.

**The report says `capped`.** Something was still moving when `time` (120 s) ran out. Run `settle` again, or look for a prop wedged between two others.

**"... is more than the ... physics takes at once".** Too many meshes within reach. Settle a district at a time, lower `reach=`, or name `colliders=`.

**A chair or arch rests on air.** It collides as one hull. `physicsBody("Chair", shape="decompose")` splits it into convex parts; `auto` does this for meshes much smaller than their hull.

**Placing an asset cleared undo.** The asset's model is a `.lila` scene, which loads through a file reference. Store props as `.glb`; **Add Selection** does.

**A dragged asset floats or sinks.** Its library size is stale, or it has no meshes at its bounds' bottom. Run `libraryAdd(..., overwrite=True)` on it again.

**Snapped pieces end up rotated wrong.** A snap point's normal must point out of the piece along the join, with up along +Y. Check them with `snapPoints("Wall_A")`.

## Tune it

| Option | What it does |
| --- | --- |
| `physicsBody(material=)` | wood, book, paper, cardboard, stone, ceramic, metal, glass, plastic, rubber, fabric: density, friction and bounce in one go. |
| `physicsBody(shape=)` | auto (a box when the mesh nearly fills one, convex parts when it is hollow or branching, else its hull), box, hull, sphere, capsule, decompose (convex parts, up to `maxParts=`), mesh (exact, never moves). A static terrain collides as its heightfield. |
| `settle(time=, reach=)` | Longest run in seconds (it stops once everything rests), and how far around each mover meshes join as colliders, cm. |
| `push(speed=)` | 50 nudges, 150 topples a book, 500 knocks it flying (cm/s). |
| `wiggle(strength=, times=)` | Size and rounds of the random jostle. |
| `sweep(radius=, speed=, gather=)` | Broom size and speed; `gather=True` pulls everything under it to its centre (give one point as `path=`). |
| `debrisProps(amount=, size=, spread=)` | Chips per piece (bigger pieces shed more), chip size as a fraction of its piece, and how far out they land. |
| `pathProps(spacing=, offset=, spread=, turn=, along=)` | Gap along the curve, distance to its right (negative: left), sideways wander, random turn, and whether items face along it. |
| `fillShelf(leanChance=, lyingChance=, gap=)` | How messy the row is. |
| `variants=` | `pool` (a few bowed variants per mesh, shared, cheap in Unreal), `unique` (one each) or `none`. |
| `fillShelf(sagAmount=)` | Sag at a board's middle for 10 kg there, cm. |

Library folders, searched in this order: `<workspace>/Library/`, studio folders (`libraryPaths(add="P:/Studio/Props")` or `LILA_LIBRARY_PATH`), your own library, then the starter props (built into your config folder on first use; `libraryStarter(rebuild=True)` writes them again; their thumbnails are drawn the first time the Prop Library opens, or by `libraryStarter()` in batch mode, the `stagehand` pref `/library/starter` set to false hides them). Assets are `<Collection>/<Asset>/` folders with `asset.json`, the model and `thumb.png`. Placements are instances by default; set the `stagehand` pref `/library/insertMode` to `copy` to change that.

The arrangement graphs are ordinary geometry-nodes groups. The **Stagehand** node category has Row Along Line, Stack Items, Pile Items, Scatter Props, Settle Instances (with contacts out), Contact Wear, Dent At Contacts, Sag Under Load and Variant Pool, for building your own.

`exportFbx(collision=True)` writes the `UCX_` hulls into an FBX of your own.

In Unreal, every placed actor or instance carries a stable random 0 to 1 as custom primitive data 0, for per-prop colour or wear in its material.
