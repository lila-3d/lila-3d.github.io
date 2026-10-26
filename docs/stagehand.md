# Stagehand (set dressing)

Push, drop and settle props into place with physics, fill shelves and scatter debris, place assets from a prop library, and snap modular kit pieces together.

## Get it working

**Push things into place by hand.** Select what may move, then **Dress > Grab with Physics**. Whatever touches the selection may move too; everything else is hit but stays put.

| Key | Does |
| --- | --- |
| 1 to 5, Tab | Grab, Push, Wiggle, Drop, Shake |
| Ctrl-click | Pin or unpin an object, to push others against it |
| P | Pause |
| [ ] | Wiggle brush size |
| Enter | Keep, as one undo step |
| Esc | Put everything back |

Leaving the tool keeps the result.

**Settle, push and drop in one call.** These are what the tool does, for scripts and agents:

```python
settle(["mug", "plate"])                              # fall and rest on what is below
push("book_01", direction=[1, 0, 0])                  # topple a row of books
drop("mug", onto="desk", at=[40, 0, 10])
dressCheck(["mug", "plate"])["issues"]                # anything floating, overlapping or about to fall
```

**Place from the prop library.** **Dress > Prop Library**, then drag a thumbnail into a viewport. It stands on the surface under the cursor. Hold Shift on release to drop it with physics, Ctrl to place an independent copy instead of an instance. **Add Selection** saves the selection as a new asset.

```python
librarySearch("wooden crate")
place("Props/Crate", on="table", count=3, jitter=10)
replaceWith(["box1", "box2"], asset="Props/Crate", fit=True)   # blockout cubes into crates
```

**Fill a shelf.**

```python
fillShelf(["Shelf_1", "Shelf_2"], items=["Books/Hardback", "Books/Paperback"], sag=True)
```

This gives you a live arrangement whose seed, gap and lean inputs re-arrange it. `realize=True` places real objects instead, which you can push, edit and check one by one. `scatterProps`, `pileProps` and `stackProps` work the same way.

<!-- TODO image: a bookshelf filled with fillShelf, some books leaning, a stack lying flat, the boards sagging (images/stagehand/shelf.png) -->

**Snap kit pieces.** Give each piece snap points where it joins others, then drag pieces with **Dress > Kit Place Tool**: they jump to compatible points.

```python
addSnapPoint("Wall_A", type="wallEnd", position=[200, 0, 0], normal=[1, 0, 0])
snapTo("Wall_B", target="Wall_A")
openSnapPoints()        # joins still missing
```

## Troubleshooting

**The shelf moves when I push a book.** A shelf no bigger than 8 times the book counts as something it can knock. Mark it static: `physicsBody("shelf", role="static")`, or pass `movable=[...]`.

**Nothing happens with the Push tool.** Select the meshes that may move first; the tool only moves the selection, what touches it and meshes with a dynamic physics body.

**Things fall forever.** Without a mesh underneath, a floor plane at `groundHeight` (0) catches them. Set `groundHeight` or give `colliders=`.

**Placing an asset cleared undo.** The asset's model is a `.lila` scene, which loads through a file reference. Store props as `.glb`; **Add Selection** does.

**A dragged asset floats or sinks.** Its library size is stale, or it has no meshes at its bounds' bottom. Run `libraryAdd(..., overwrite=True)` on it again.

**Snapped pieces end up rotated wrong.** A snap point's normal must point out of the piece along the join, with up along +Y. Check them with `snapPoints("Wall_A")`.

## Tune it

| Option | What it does |
| --- | --- |
| `physicsBody(material=)` | wood, book, paper, cardboard, stone, ceramic, metal, glass, plastic, rubber, fabric: density, friction and bounce in one go. |
| `physicsBody(shape=)` | auto (a box when the mesh nearly fills one, else its hull), box, hull, sphere, capsule, mesh (exact, never moves). |
| `push(speed=)` | 50 nudges, 150 topples a book, 500 knocks it flying (cm/s). |
| `wiggle(strength=, times=)` | Size and rounds of the random jostle. |
| `fillShelf(leanChance=, lyingChance=, gap=)` | How messy the row is. |
| `variants=` | `pool` (a few bowed variants per mesh, shared, cheap in Unreal), `unique` (one each) or `none`. |
| `fillShelf(sagAmount=)` | Sag at a board's middle for 10 kg there, cm. |

Library folders, searched in this order: `<workspace>/Library/`, studio folders (`libraryPaths(add="P:/Studio/Props")` or `LILA_LIBRARY_PATH`), then your own library. Assets are `<Collection>/<Asset>/` folders with `asset.json`, the model and `thumb.png`, so they check in like any other file. Placements are instances by default; set the `stagehand` pref `/library/insertMode` to `copy` to change that.

The arrangement graphs are ordinary geometry-nodes groups. The **Stagehand** node category has Row Along Line, Stack Items, Pile Items, Scatter Props, Settle Instances (with contacts out), Contact Wear, Dent At Contacts, Sag Under Load and Variant Pool, for building your own.

In Unreal, every placed actor or instance carries a stable random 0 to 1 as custom primitive data 0, for per-prop colour or wear in its material.
