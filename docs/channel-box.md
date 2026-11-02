# Channel Box

The Channel Box works like Maya's, plus a filter, an object strip and a stripe on each channel that says what drives it.

## Get it working

1. Select objects. With more than one, the strip at the top lists them in selection order: click one to make it the lead, drag to reorder.
2. Type in **Filter channels**, or click the chips: once for only those channels, twice for all but those, again for off.
3. Click a value and type. It goes to the lead object; hold **Alt** to set it on every selected object.

The stripe left of each name:

| Colour | Means | Click it to |
| --- | --- | --- |
| Red (full at a key) | Keyed | Open the Graph Editor |
| Green | Breakdown key at this frame | Open the Graph Editor |
| Brown | Muted | Open the Graph Editor |
| Blue | Driven key | Select the driver |
| Purple | Expression | Select the expression's node |
| Cyan | Constraint | Select the constraint |
| Yellow | Other connection | Select the source |
| Grey | Locked | |

The right-click menu shows only what applies: key, breakdown and mute; copy and paste values; **Drive...**; break or select the source; lock; hide or make nonkeyable an added attribute; freeze; add to an anim layer.

## Troubleshooting

**A value changed on one object only.** Several are selected: hold Alt while you type or scrub.

**Middle-drag in the viewport doesn't scrub the highlighted channels.** The scrub setting (gear button) is **Off**, or **Select tool only** with the move, rotate or scale tool active.

**The Graph Editor shows only some curves.** Its sync button in the Channel Box is on: it shows the highlighted channels.

## Options

The gear button: scrub speed, hyperbolic scrubbing (faster drags go further), when a viewport middle drag scrubs, decimal places and namespaces (both shared with the Attribute Editor), and the lead-only hint. The **Nice/Long/Short** button switches names in both editors.

| Chip | Shows |
| --- | --- |
| Keyed | Channels with keys |
| Driven | Driven keys, expressions, constraints |
| Connected | Anything with an input |
| User | Added attributes |
| Locked | Locked channels |
| TRS | Translate, rotate, scale |
| Type | Attributes the object's own type declares, not inherited ones |
