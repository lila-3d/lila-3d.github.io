# Component Spreadsheet

Type exact skin weights, positions and colours for the selected vertices, one column per value, like Maya's Component Editor but showing only the influences that matter.

## Get it working

1. Open **Windows > Editors > Component Spreadsheet**.
2. Select vertices on a skinned mesh. Columns show only the joints that weight them, heaviest first; **+N more** shows the rest.
3. Click a cell and type: the other influences of that vertex (not held ones) rescale so it still sums to 1.

Selecting row labels selects those vertices in the viewport; selecting a joint lights up and scrolls to its column.

| Key or action | Does |
| --- | --- |
| Any number | Starts typing into every selected cell; Enter writes them all |
| Ctrl+V | Pastes a block, or one number into every selected cell |
| Ctrl+C | Copies the selected cells as a block |
| Middle-drag a header | Scrubs that column for the selected rows (Ctrl finer, Shift coarser) |
| Ctrl+arrows | Jumps to the table's edges |
| Right-click a header | Pin Left, Hold or Release, Normalize |
| Alt while editing | Also edits rows of other selected meshes |

```python
componentValues("Body", columns=["weights", "position"])
setComponentValues("Body", column="spine_02", values=0.5, vertices=[12, 13])
```

## Troubleshooting

**A row is dimmed and won't change.** It belongs to a mesh other than the lead: hold Alt.

**"is held".** That influence is held: right-click its header and **Release**.

**A vertex sums to less than 1.** Every other influence on it is held, so nothing takes up the difference. Release one, or right-click a header and **Normalize**.

**No columns for UVs or blend shapes.** The spreadsheet shows skin weights, positions and colours. Edit UVs in the UV Editor.
