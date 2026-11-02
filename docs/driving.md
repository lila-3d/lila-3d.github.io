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
expression("box.ty", query=True)          # {text, native, nodes}
expression("box.ty", delete=True)
connectByName("ctrl", "box")
listConnections("box", source=True, destination=False, plugs=True)
```

## Expressions

Expressions are Python syntax. This subset compiles to rig math nodes, so it evaluates as fast as nodes and shows in the node editor:

- numbers, `pi`, `tau`, `e`, `True`, `False`, and other plugs by name (`ctrl.ry`, `foot.roll`)
- `+ - * / % **`, `< <= > >= == !=`, `and`, `or`, `not`, `a if condition else b`
- `abs min max clamp lerp sin cos tan asin acos atan atan2 sqrt exp pow log sign fmod hypot degrees radians wrap mapRange`

Anything else (other functions, lists, chained comparisons) runs as Python each time an input changes: slower, and it stays in Lila. `python=True` forces Python.

## Troubleshooting

**The expression didn't compile to nodes.** `expression(...)` returns `native: False` and the reason, such as a function outside the list above. Rewrite it with the listed functions, or accept the Python version.

**"isn't a number; drive one of its components".** Expressions drive one number: drive `box.tx`, not `box.translate`.

**Connect Attributes greys an input out.** It doesn't fit the output picked: a single number can't feed a whole vector.

**Match by Name skipped an input.** It already had a connection. `connectByName(..., force=True)` replaces them.
