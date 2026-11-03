# Destruction

Break meshes apart, simulate the fall, and bake it for Unreal so nothing simulates at runtime.

## Get it working

1. Select a closed mesh standing on the ground (world Y = 0).
2. **Effects > Destruction > Break Apart: Concrete** (or Glass, Wood), then click where it's hit.
3. Play. It stands until the start of the playback range, then breaks outward from where you clicked.
4. **Effects > Destruction > Send to Unreal as Vertex Animation Texture**. It's baked as rigid pieces and imported with its material.

```python
breakApart("Wall", material="concrete", impact=[0, 120, 15])
```

<!-- TODO image: a concrete wall mid-collapse (images/destruction/wall.png) -->

The result is the same on every machine and every run. Changing a setting re-simulates only from the first frame it changes, and scrubbing back is instant.

### Several meshes, several explosions, collapsing ground

Select everything that should hit each other (walls and the ground they stand on) and Break Apart once: they simulate together on a new `Destruction` mesh and the originals are hidden. Then scrub to a frame and use **Effects > Destruction > Add Explosion** to click where the next one goes off.

```python
breakApart("Ground", "WallA", "WallB")
addExplosion("Destruction", position=[-150, 110, -64], frame=20, blast=2600, radius=320)
collapse("Destruction", part="Ground", start=125, duration=75, direction=[1, 0, 0], rumble=4)
```

Ground that should stay put while the rest falls (a pit's rim) goes in as `colliders=[...]`: pieces hit it, it never moves or breaks.

`collapse` makes a part give way from one side to the other: its pieces rumble, then fall, taking anything on them along. The floor is lowered by `depth` so there's somewhere to fall. A full example is in `resources/examples/Destruction`.

### Level dressing: damaged props, rubble and debris

For ruins that sit still in the level, damage a prop without simulating it, or let a simulation settle and freeze it. Either way you end with plain static meshes, each with a `UCX_` collision hull, ready to send to Unreal.

```python
breakApart("Pillar", damage="chipped", amount=0.4)                       # cracked, missing, chipped or collapsed
breakApart("Wall", impact=[0, 80, 10])                                   # or simulate a real break
addDebris("Wall", amount=4, size=6)                                      # chunks thrown off where it broke, settled
freezeDestruction("Wall")                                                # pieces where they came to rest, as static meshes
```

- `cracked` keeps every piece standing with a visible crack (`gap`, cm) and some slipped out of place; `missing` takes out the pieces around `impact`; `chipped` knocks pieces off edges and corners; `collapsed` frees the pieces around `impact` and lets what they held fall and settle. `amount` (0 to 1) is how much.
- `freezeDestruction` finds the frame everything stops moving (or takes `frame=`), makes one group of meshes and hides the destruction. `meshes="objects"` gives every piece its own mesh instead of sharing one per shape; `smallest=5` leaves out pieces under 5 cm.
- Debris chunks share a few rock shapes, so they freeze as instances and stay light. A rigid VAT bake leaves them out; `freezeDestruction("Wall", debris="only", hide=False)` makes them a group of their own to send beside it. Dust comes out as points on the Debris node's **dust** output for Niagara.

## Troubleshooting

**Nothing breaks.** Raise **blast** or lower **strength** on the modifier.

**It falls apart before it's hit.** Raise **strength**.

**"isn't a closed solid".** Fracture needs a watertight mesh. Close holes or run **Mesh > Repair Mesh** first.

**Pieces fall through the floor, or there's no floor.** The floor is world Y = 0, or the mesh's bottom when that's lower. A tilted mesh gets no floor and nothing is anchored. Add a floor mesh as a collider (below).

**"pieces must be instances".** In your own graph, feed **Fracture** or **Mesh to Pieces** into the **Rigid Body Solver**.

**Re-simulating is slow.** Fewer pieces, or fewer **substeps** on the Rigid Body Solver node.

**A big structure (metres across) crumbles under its own weight.** Weight grows faster than the glue between pieces. Raise **strength** toward real concrete, around 200.

**freezeDestruction says `settled: false`.** Nothing came to rest within ten seconds past the playback range. Freeze a chosen `frame`, or raise **damping** on the Rigid Body Solver.

**Pieces jitter in Unreal.** Use the EXR position format (the default). 8-bit PNG can't hold rigid pieces precisely.

## Options

On the modifier (keyable):

| Option | What it does |
| --- | --- |
| `pieces` | Roughly how many pieces. |
| `seed` | Crack pattern. |
| `impact` | Where it's hit, in the mesh's own space. Pieces are smaller there. |
| `roughness` | How jagged the cracks are, cm. |
| `strength` | How hard it is to break, in N per cm² of area two pieces share. |
| `blast` | How hard the impact hits, cm/s. |
| `startFrame` | Frame it breaks on. |

## Scripting it in geometry nodes

The modifier's group in the Node Editor is **Fracture > Anchor Pieces > Rigid Body Solver**, its pieces drawn as instances. Edit it, or build your own from the Destruction category.

- Pieces are instances. The solver reads these instance attributes when present: `density` (kg/m³), `friction`, `bounce`, `active` (0 follows its own transform until it turns 1), `guide` (0 to 1: pulled back toward its own animated transform, for directed collapses), `velocity` (cm/s), `angularVelocity`.
- **Effects > Destruction > Show Destruction Links** draws the selected destruction's links, coloured by strength; broken ones disappear.
- Links are two-point curves with curve attributes `pieceA`, `pieceB` (-1 ties to the world), `type` (0 glue, 1 spring, 2 hard) and `strength` (N). Edit them with any geometry node.
- Colliders: an **Object Info** node with transform space set to `instance` feeds a moving object (a wrecking ball) into **colliders**; a plain mesh stays put.
- **Join Pieces** puts two sets of pieces and links into one simulation; chain it for more.
- **Explosion** nodes, joined with Join Geometry, go into the solver's **blasts**.
- **Collapse** takes pieces and links and Scene Time's frame: pieces hold still, rumble, then fall in a sweep along a direction. A link's `strength` can change over time; 0 cuts it.
- The solver's **breaks** output has a point where each link broke, with `frame` and `impulse`. Feed it to **Debris From Events** for chunks and dust.
- **Damage Pieces** damages pieces without a simulation (the `damage` modes above).
- One Rigid Body Solver per group, in the modifier's own group (not inside a nested group).

## Other ways out

```python
exportBreaks("Wall", path="Export/Wall_breaks.csv")             # when and where each piece broke, for sounds and effects
wedgeDestruction("Wall", count=8, folder="Export/WallVariants")  # one bake per seed
bakePiecesToJoints("Wall")                                       # a skinned mesh with a keyed joint per piece
exportChaos("Wall", send=True, contentPath="/Game/Destruction/GC_Wall")  # a Chaos Geometry Collection and cache
exportAlembic("Wall", path="Export/Wall.abc", rigidPieces=True)  # each piece a shape once plus a transform per frame
```

- The breaks `.csv` imports into Unreal as a Data Table. Positions are already in Unreal's axes.
- `exportChaos` makes a Chaos Geometry Collection and a Chaos cache of the fall in Unreal, so the pieces can turn back into live Chaos physics in game. Each piece stays in the collection until the frame it breaks free; breaks carry the piece's velocity and mass, and the cache's `BreakImpulse` curve has the impulse per frame. `place=True` also puts it in the open level with a Chaos Cache Manager playing it.
- After `bakePiecesToJoints`, edit the fall with the animation tools, then send it as an FBX skeletal mesh with animation. Best below a few hundred pieces.

> For Unreal, Rigid pieces layout stores one position and rotation per piece per frame, so 2000 pieces over 120 frames is two 2048x120 textures. Pick it under **VAT layout** in Send Animated Mesh Options; Automatic picks it on its own for broken-apart meshes.
