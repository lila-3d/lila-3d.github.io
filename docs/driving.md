# Drive and connect

Drive any channel from another plug, a driven key, an expression or a rig math node, from one popover.

## Get it working

1. Right-click a channel in the Channel Box, or a row in the Attribute Editor, and choose **Drive...**.
2. Pick how it's driven:
   - **Connect**: type `node.attr`, or turn on the eyedropper and highlight a channel of another object in the Channel Box.
   - **Driven Key**: name the driver, pose it and click **Key Current** for each key, then **Apply**.
   - **Expression**: type `= ctrl.ry * 0.5 + clamp(foot.roll, 0, 90)` and press Enter.
   - **Math**: pick a rig math node; its output drives the channel.
3. The channel's stripe in the Channel Box changes colour, and the Attribute Editor shows `← source` beside the row.

Faster ways for common cases:

- **Drag** a highlighted channel name in the Channel Box onto another channel (Channel Box or Attribute Editor) to connect it. Hold **Alt** when you drop for a driven key instead.
- **Edit > Connect Attributes...** with two objects selected (source first) wires many plugs at once: click an output, then an input it fits, or **Match by Name**.

```python
expression("box.ty", string="ctrl.ry * 0.5 + clamp(foot.roll, 0, 90)")
connectByName("ctrl", "box")
listConnections("box", source=True, destination=False, plugs=True)
```

## Expressions

See [Expressions](expressions.md): the syntax, Maya equivalents and running them in Unreal.

## Troubleshooting

**"isn't a number; drive one of its components".** Expressions drive one number: drive `box.tx`, not `box.translate`.

**Connect Attributes greys an input out.** It doesn't fit the output picked: a single number can't feed a whole vector.

**Match by Name skipped an input.** It already had a connection. `connectByName(..., force=True)` replaces them.
