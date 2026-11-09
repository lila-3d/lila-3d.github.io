# Groom strands

Realistic hair and fur: thousands of strands grown over a head and shaped by your guide curves, through a groom graph of scatter, interpolate, clump, curl, noise and the rest.

For stylized locks that become one mesh for retopology, use [Hair](hair.md) instead.

> **Experimental:** groom strands are subject to change and may lose data between versions. Feedback is welcome.

<!-- Image: strands grown on a head from a few guide curves. -->

## Get it working

1. Select the head mesh and run `createGroom` with `strands` on:

```python
g = createGroom("Head", count=60, length=15.0, strands=True)
getAttr(g["groom"] + ".strandCount")
```

2. `HairStrands` shows strands grown over the head between the guides, drawn as shaded hair at their widths. Brush and style the guides as in [Hair](hair.md); the strands follow the styled locks.
3. Set the groom's `graph` to your own groom graph to change the look. Empty gives guides into locks with strands interpolated from them.

To grow from curves of your own instead of drawn guides, connect them to the groom's `inCurve`: `connectAttr("MyCurves.worldSpace", g["groom"] + ".inCurve")`. Each curve is a guide rooted at its first point.

A groom graph is JSON: named nodes, connections and the output. This one scatters roots over the head and interpolates the guides between them:

```python
setAttr(g["groom"] + ".graph", """{"version": 1, "output": "interp",
  "nodes": [{"name": "scalp", "type": "Scalp"}, {"name": "guides", "type": "Guides"},
            {"name": "scatter", "type": "Scatter", "params": {"density": 2.0}},
            {"name": "interp", "type": "Interpolate"}],
  "connections": [{"from": "scalp", "to": "scatter", "input": "scalp"},
                  {"from": "scatter", "to": "interp", "input": "strands"},
                  {"from": "guides", "to": "interp", "input": "guides"},
                  {"from": "scalp", "to": "interp", "input": "scalp"}]}""")
```

Graphs with Wind, Jiggle or Simulate nodes move as the scene plays. Jiggle reads the head's earlier frames. Simulate steps from its start frame, including frames you jump past, and scrubbing back shows the frames it already stepped.

## Export and import

Select the groom and run **Curves > Groom > Export Groom...**. The file's extension picks the format:

- `.abc`: an Unreal groom, with `groom_*` attributes and the primary guides Unreal simulates the hair on. Set **engine** to `unity` for Unity's hair package.
- `.usd`, `.usda`, `.usdc`: USD basis curves.
- `.groom`: a GroomLab file with the guides, graph, parts, flow, maps and the head.

Set **start** and **end** to write a range of frames.

```python
exportGroom("HairGroom", path="hair.abc", start=1, end=48)
importGroom("hair.groom", mesh="Head")
```

**Curves > Groom > Import Groom...** reads a `.groom` file into a new groom on the selected mesh, or on the file's own head when none is selected.

**Curves > Groom > Import Yeti...** reads the Yeti grooms of a Maya ASCII (`.ma`) file, without Maya or Yeti. Import the `.ma` first so its head meshes are in the scene. Each Yeti node becomes a groom: its groom's strands are the guides, and its Scatter, Clumping, Scraggle and Width nodes become the graph's Scatter, Clump, Noise and Width. The command's report lists what was mapped, approximated and skipped.

## Send to Unreal

With Lila Link connected, select the groom and run **Curves > Groom > Send Groom to Unreal**. Unreal gets a groom asset (`/Game/Grooms/GR_<name>` by default) with the guides it simulates on and `M_LilaHair` as its material. Sending again reimports the same asset.

To have the hair follow a character's skinning, bind it to the character's skeletal mesh: a mesh already sent to Unreal, or its asset path. With `actor`, the actor with that label gets a groom component on its skeletal mesh. Later sends keep the binding.

```python
unrealSendGroom("HairGroom", bindTo="Hero", actor="BP_Hero")
```

`M_LilaHair` is built on the `MF_LilaHair` material function: hair colour from the groom, darker roots, roughness, scatter and specular. Call `MF_LilaHair` from your own Hair material to build on it. The project needs the HairStrands plugin, which Lila Link turns on.

## Hair cards

Run **Curves > Groom > Hair Cards Preset** to give the groom a Cards node at a hero, mid or low budget and a mesh showing the cards. **Bake Hair Cards...** writes the cards' maps (Depth, Coverage, Tangent, Attribute, Color, AO and Normal as `.tga`), the atlas layout and a preview into a folder. The cards keep their atlas cells from that bake.

## In geometry nodes

Each groom graph node that works on what it's handed is also a geometry node in the **Hair** category: Scatter, Interpolate, Clump, Curl, Noise and the rest. Strands and guides travel as curves, the head as a mesh. Link the head into every Hair node's `scalp` input: roots, sizes and surface distances are measured on it. Nodes that read the time have a `seconds` input; link Scene Time to animate them.

Strands keep their roots on the head in the `groomRootFace` and `groomRootUV` curve attributes and their IDs in `groomIdLow` and `groomIdHigh`. Keep those attributes on the curves between Hair nodes, and a chain of Hair nodes grows exactly what the same groom graph grows. Other float attributes are the strands' channels.

## Troubleshooting

**No strands, and `warning` names a node or says the graph can't load.** The graph JSON has an unknown node type, a bad connection or a typo. Fix the text; nothing grows until it loads.

**No strands and no warning.** Nothing reads `outStrands`: connect it to a curve, or create the groom with `strands` on. Or `inMesh` isn't connected or the head has no faces.

**Strands change size when the head is resized.** With `scaleWithScalp` on, the graph's sizes follow the head's area against `scaleReference`, the area stored on the first evaluation. Set `scaleReference` to 0 to take the head's area now, or turn `scaleWithScalp` off to keep sizes in scene units.

**Hair doesn't move with the scene.** `useSceneTime` is off, so the graph holds at `time`.

**Strands start in the wrong place.** Guides are rooted at their first point on the nearest spot of the head. Draw each guide from its root outward.

## Options

| Attribute | What it is |
| --- | --- |
| `graph` | The groom graph as JSON; empty: the guides into locks, strands interpolated from them. |
| `useSceneTime` | On by default: the graph runs at the scene's time. Off: it runs at `time`. |
| `time` | Seconds the graph runs at while `useSceneTime` is off. Key it to retime the motion. |
| `scaleWithScalp` | On by default: lengths, widths and densities scale with the head's area against `scaleReference`. |
| `scaleReference` | The head area the graph's sizes are 1x at; 0 takes the area on the next evaluation. |
| `outStrands` | The strands in world space, with a `width` per point and an `id` per strand. Grown only while something reads it. |
| `outCards` | The graph's Cards nodes' cards as one mesh: uv set 0 their atlas cells, uv set 1 a layout of their own. |
| `inCurve` | More guides: curves rooted on the head at their first point. |
| `strandCount` | How many strands grew. |
| `warning` | What went wrong in the last evaluation. |

To paint a map in Groom Brushes instead, add one with `groomAddMap`, then pick **Paint**, the map's name in **Map** and **Paint On** Scalp (a value per vertex) or Texture (an image at the head's `uv0`, saved as a PNG after each stroke):

```python
groomAddMap("HairGroom", name="crown", kind="texture", file="maps/crown.png")
```

The head's color sets are maps the graph reads: paint one with **Paint Vertex Colors** and a Map node named after the set reads it: a set painted in grays is a gray map, any other a color map. A map the groom stores under the same name wins.

Strands without a Width node draw at about a hair's width. Far from the camera fewer strands draw, each wider, so the groom keeps its look and stays fast.

The same head, guides and graph always grow the same strands, bit for bit, on any thread count and after saving and opening the scene.

The groom graph engine comes from [GroomLab](https://github.com/thekesslereffect/groomlab) by thekesslereffect, under the Apache 2.0 license.
