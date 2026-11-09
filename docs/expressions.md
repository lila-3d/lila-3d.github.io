# Expressions

A channel driven by a formula of other channels and time, like Maya's expressions, that also runs in Unreal.

Lila has no Expression Editor window. Expressions live on the channel they drive: right-click the channel, choose **Drive...**, then the **Expression** tab.

## Get it working

1. Select the object. In the Channel Box (or the Attribute Editor), right-click the channel to drive, such as **Rotate X**, and choose **Drive...**.
2. Click the **Expression** tab.
3. Type the expression and press Enter: `ctrl.open * 30 + sin(time * 2) * 5`. A leading `=` is optional.
4. The channel's stripe in the Channel Box turns purple. Hover it to see what drives it; click it to select that node.

To change an expression, open **Drive...** on the same channel again and type the new one: it replaces the old one. To remove it, click the unlink button (**Break the connection**) at the top of the popover; `expression(..., delete=True)` also deletes its nodes.

```python
expression("jaw.rx", string="ctrl.open * 30 + sin(time * 2) * 5")
expression("jaw.rx", query=True)          # {text, native, nodes, program}
expression("jaw.rx", delete=True)         # removes the expression and its nodes
```

## What you can write

Expressions are Python syntax, not MEL. One expression drives one channel: write `jaw.rx`, not `jaw.rotate`.

| Maya | Lila |
| --- | --- |
| `jaw.rotateX = ctrl.open * 30;` | `ctrl.open * 30` on the **Rotate X** channel |
| `time`, `frame` | `time`, `frame` |
| `rand(10)` | `random(seed, 0, 10)`: the seed keeps it from changing every frame |
| `noise(time)` | `noise(time)`, or `noise(time, seed)` for another pattern |
| `linstep`, `smoothstep`, `floor`, `ceil`, `trunc` | the same names and argument order |
| `clamp(min, max, x)` | `clamp(x, min, max)`: the value comes first |
| `if (a > 1) b = 2; else b = 3;` | `2 if a > 1 else 3` |
| `deg_to_rad(x)`, `rad_to_deg(x)` | `radians(x)`, `degrees(x)` |

The full set that compiles to nodes:

- numbers, `pi`, `tau`, `e`, `True`, `False`, other plugs by name, `time` (seconds), `frame`
- `+ - * / % **`, `< <= > >= == !=`, `and`, `or`, `not`, `a if condition else b`
- `abs min max clamp lerp sin cos tan asin acos atan atan2 sqrt exp pow log sign fmod hypot degrees radians wrap mapRange floor ceil round trunc noise random linstep smoothstep`

These compile to rig math nodes: they evaluate as fast as nodes, show in the node editor and run in Unreal. Anything else (other functions, lists, chained comparisons) runs as Python each time an input changes, with `time` and `frame` in scope: slower, and it stays in Lila.

## In Unreal

Send the character (**Send to Unreal**, kind skeletal), select its root and choose **File > Send Expression Rig to Unreal**. Lila makes `CR_<name>_Expressions`, a Control Rig with one **Lila Expression** node per expression, and `ABP_<name>_Expressions`, a post-process Anim Blueprint that runs it on the mesh. The expressions then run in game, in Sequencer and in the editor, with the same results as in Lila. Run it again after changing expressions.

```python
unrealExpressionRig("Char")
```

- Bone channels drive and read bones.
- Morph target weights drive and read curves named after the target.
- A morph target with in-betweens, a path or a response curve also gets a node per exported shape, so its curve drives those shapes as it does in Lila. Send the rig even if the character has no expressions.
- Without Control Rig, run `unrealMorphPaths("Char")` instead: it keeps the shapes' curves on the skeletal mesh for the **Lila Morph Paths** anim node, and a mesh with no post-process Anim Blueprint gets `ABP_<name>_MorphPaths` running it. With your own Anim Blueprint, add the node to it. Use one or the other: with both, pass `morphShapes=False` to `unrealExpressionRig`.
- Other attributes under the root become curves named `node_attr`, such as `fx_glow`.
- Inputs that aren't bones, morph weights or time become float controls named `node_attr`. Animate them in Sequencer.

## Troubleshooting

**It runs as Python instead of nodes.** `expression(...)` returns `native: False` and the reason, usually a function outside the list above. Rewrite it with listed functions, or keep the Python version if it doesn't need Unreal.

**"isn't a number; drive one of its components".** Drive `box.tx`, not `box.translate`.

**"connection would create a cycle".** Lila evaluates whole nodes, so an expression can't read one attribute of a node and drive another attribute of the same node. Put the driven attribute on another node.

**An expression is missing from the Unreal rig.** `unrealExpressionRig` lists it under `skipped` with the reason: it runs as Python, or its target isn't under the root.

**"the LilaLink plugin in Unreal predates expression rigs".** Rebuild LilaLink from Lila's `ue/LilaLink`.

**The mesh already has a post-process Anim Blueprint.** Lila leaves yours alone: add a **Control Rig** node running `CR_<name>_Expressions` to it.

**A bone reads differently in Unreal.** Unreal bones have no pivots, so a joint with rotate or scale pivots reads and writes as if they were zero.
