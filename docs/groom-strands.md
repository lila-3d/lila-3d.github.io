# Groom strands

Realistic hair and fur: thousands of strands grown over a head and shaped by your guide curves, through a groom graph of scatter, interpolate, clump, curl, noise and the rest.

For stylized locks that become one mesh for retopology, use [Hair](hair.md) instead.

> **Experimental:** groom strands are subject to change and may lose data between versions. Feedback is welcome.

<!-- Image: strands grown on a head from a few guide curves. -->

## Get it working

1. Have a head mesh and guide curves that start on its surface, such as the `HairGuides` of a groom from **Curves > Groom > New Groom**.
2. Create a `groomStrands` node and connect the head and guides to it:

```python
s = createNode("groomStrands", name="Strands")
connectAttr("Head.outMesh", s + ".inMesh")
connectAttr("Head.worldMatrix", s + ".meshMatrix")
connectAttr("HairGuides.worldSpace", s + ".inCurve")
getAttr(s + ".strandCount")
```

3. Strands cover the head and follow the guides. With `graph` empty you get the default hair; set `graph` to your own groom graph to change the look.

A groom graph is JSON: named nodes, connections and the output. This one scatters roots over the head and interpolates the guides between them:

```python
setAttr(s + ".graph", """{"version": 1, "output": "interp",
  "nodes": [{"name": "scalp", "type": "Scalp"}, {"name": "guides", "type": "Guides"},
            {"name": "scatter", "type": "Scatter", "params": {"density": 2.0}},
            {"name": "interp", "type": "Interpolate"}],
  "connections": [{"from": "scalp", "to": "scatter", "input": "scalp"},
                  {"from": "scatter", "to": "interp", "input": "strands"},
                  {"from": "guides", "to": "interp", "input": "guides"},
                  {"from": "scalp", "to": "interp", "input": "scalp"}]}""")
```

Graphs with Wind, Jiggle or Simulate nodes move as the scene plays. Jiggle reads the head's earlier frames. Simulate steps from its start frame, including frames you jump past, and scrubbing back shows the frames it already stepped.

## Troubleshooting

**No strands, and `warning` names a node or says the graph can't load.** The graph JSON has an unknown node type, a bad connection or a typo. Fix the text; nothing grows until it loads.

**No strands and no warning.** `inMesh` isn't connected or the mesh has no faces.

**Strands don't scale with the head.** Sizes in the graph are scene units. Scale the lengths and densities in the graph to match.

**Hair doesn't move with the scene.** `useSceneTime` is off, so the graph holds at `time`.

**Strands start in the wrong place.** Guides are rooted at their first point on the nearest spot of the head. Draw each guide from its root outward.

## Options

| Attribute | What it is |
| --- | --- |
| `graph` | The groom graph as JSON; empty grows the default hair. |
| `useSceneTime` | On by default: the graph runs at the scene's time. Off: it runs at `time`. |
| `time` | Seconds the graph runs at while `useSceneTime` is off. Key it to retime the motion. |
| `outCurve` | The strands in world space, with a `width` per point and an `id` per strand. |
| `strandCount` | How many strands grew. |
| `warning` | What went wrong in the last evaluation. |

The same head, guides and graph always grow the same strands, bit for bit, on any thread count and after saving and opening the scene.

The groom graph engine comes from [GroomLab](https://github.com/thekesslereffect/groomlab) by thekesslereffect, under the Apache 2.0 license.
