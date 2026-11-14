# Node editor

Keys and gestures for the node canvas, in geometry nodes and the texture graph. Every edit undoes, and the layout (reroutes, portals, frames, ties, muting, collapsed nodes, saved views) saves with the scene. Most of these are also on the canvas right-click menu; rebind keys under **Node Editor** in the hotkey editor.

<!-- TODO image: a tidy graph with a frame, a zip tie, a reroute and a portal pair (images/node-editor/overview.png) -->

## Keys

| Key | Does |
| --- | --- |
| **W** | Pick the selection up to follow the cursor. Tap **W** and click, press **Enter** or tap **W** again to place it; or hold **W** and let go. **Esc** or right-click puts it back. **X** / **Y** lock an axis, **Shift** snaps to the grid |
| **R** | Spread or tighten the gaps between the selected nodes from their centre without resizing them, placed like **W**; nodes never pack closer than a small gap. **X** / **Y** scale one axis, **Shift** steps in tenths |
| **E** | Turn the zip tie under the cursor, placed like **W**; away from a tie, press one and drag to turn it. 15 degree steps, **Ctrl** turns freely |
| **T** (hold) + drag across wires | Zip-tie them |
| **L** (hold) / **Shift+L** | Light up everything upstream and downstream of the selection |
| **M** | Mute the selection |
| **H** / **Ctrl+H** | Collapse nodes / hide their unlinked sockets |
| **Ctrl+J** | Frame the selection |
| **Q** | Straighten the wires into the selection |
| **Ctrl+L** | Auto layout the selection, or the whole graph with nothing selected |
| **Alt+Arrows**, **Alt+C**, **Alt+Shift+M** | Align left, right, top, bottom, centre, middle |
| **Alt+Shift+H** / **Alt+Shift+V** | Distribute evenly across / down |
| **Ctrl+Shift++ - * /** | Merge the selection: Join Geometry, Math, or Blend in texture graphs |
| **Alt+S** | Swap a node's two inputs of the same type |
| **Alt+W** | Show only the selected nodes' wires |
| **Shift+M** | Minimap |
| **Ctrl+F** | Find a node by name or type |
| **Ctrl+1..5** / **1..5** | Save the view / go back to it |

## Gestures

| Gesture | Does |
| --- | --- |
| Double-click a wire | Add a reroute there |
| **Shift**+drag across wires | Add a reroute on each |
| Double-click near a wire's end | Jump to the node at its other end |
| Drag an unlinked node onto a wire | Wire it in; what is downstream slides aside |
| Let a wire go on empty canvas | Pick a node that fits; it comes wired |
| **Alt**+right-drag from node to node | Connect the best matching sockets |
| **Ctrl**+drag a linked input | Move its link to another input |
| **Shift**+drag a linked input | Copy its link to another input |
| **Alt**+click a socket | Disconnect it |
| Drag a reroute's rim | Wire it to more inputs (its middle moves it) |
| Drag a frame's title / corner | Move it with its nodes / resize it |
| Drop a node inside a frame | It joins; drag it out and it leaves |
| Click a frame's arrow | Collapse it |
| Double-click a frame's title | Rename it |
| Double-click a Receive | Jump to its Send |
| Drag a zip tie / **Shift**+drag | Move it / turn it (**Ctrl** turns freely) |
| Right-click a tie or frame title | Colour, rename, remove |

## Reroutes, portals and muting

- A reroute takes the type and colour of what feeds it. Selecting one lights the whole wire through it.
- A **Send** names the value wired into it; a **Receive** picks a Send in the side panel and reads it with no wire. Hover either to see ghost lines between them.
- A muted node passes its first input of a matching type to each output; outputs with no such input give nothing. Group Input, Group Output and the material output can't be muted.

## Zip ties

- Several ties can sit along the same wires.
- A tie is removed when fewer than two of its wires are left.
- Ties and frames copy and paste with their nodes.

## Troubleshooting

**T doesn't tie.** The key went to the viewport. Click empty canvas first, then hold T.

**"A zip tie needs two or more wires".** The line crossed fewer than two wires. Drag across at least two, or start the drag on a tie to add one wire to it.

**A Receive has a red badge.** No Send has its name, two Sends share it, or reading it would loop back into its own Send. Hover the badge for which.

**Merging says nothing merges these values.** The selected nodes' first outputs have no merge node for their type, or a texture graph was asked to divide (Blend has no divide mode).

## Options

Preferences > Node Editor.

| Option | Default | What it does |
| --- | --- | --- |
| Slide downstream nodes aside | On | Make room when a node drops into a wire |
| Wire style | Curved | Curved, straight or right-angle wires |
| Dim wires away from the hovered and selected nodes | Off | Fade the rest of the graph while you look at one part |
| One grey for every wire in a grey theme | Off | Wires otherwise take their socket type's shade |
