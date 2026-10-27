# Scene origin

## Move the scene to the origin

**Modify > Scene Origin > Relocate Scene to Selection**

Select what should end up at 0,0,0 (the ground under a character, a building) and run it. The whole scene moves so the bottom centre of the selection lands on the world origin. Skin, deformers, constraints, IK, spaces and keys in every take move with it, so nothing changes shape or animates differently. It is one undo step.

Before anything changes, Lila checks that every node can follow. After the move it compares every transform and every deformed point, at several frames and in every take, with where it was. If anything is off by more than 0.00001 mm, the scene is put back as it was and the message names the node.

If it refuses:

- **May hold world-space data**: the scene has a node Lila can't move safely: Edge to Curve history, an extension node its extension doesn't describe, or a skeleton edit in progress. Finish the skeleton edit or delete the history, then run it again.
- **Object Info node ... reads ...'s world transform**: a geometry nodes group reads another object where it stands in the world, so moving both would change the result. Set that Object Info node's **Relative To** to **owner**, which reads the object against the mesh the group runs on.
- **Keyed on separate X, Y and Z curves**: with **Rotation** set, a root keyed on Euler curves can only turn about the outermost axis of its rotate order. Set **Rotation** to None, or convert its keys to a rotation curve (`convertRotationCurves`) first.
- **Links ... which moves, and ... which doesn't**: with **Only the selected hierarchies**, a skin, deformer or constraint ties something inside to something outside. Select both.
- **The parent is animated**: a hierarchy can only take a fixed move under a parent that stays still. Pick the top of the hierarchy.

Meshes and curves made by curve history (sweeps, lofts, revolves, pipes, hair cards) are rebuilt from their moved curves, so their own transforms stay where they are; anything parented under them is moved for them.

Poses saved in the scene move with their root. Poses in the workspace or user library keep their old root positions.

Options:

- **Move from**: the selection's bottom centre, its centre, its pivot, or the centre of the selected components.
- **To**: where that point lands instead of the origin.
- **Axes**: `xz` keeps every height.
- **Rotation**: **Yaw** turns the scene about the up axis so the selected object faces along the world axes; **Full** lines up its whole orientation.
- **Only the selected hierarchies**: move one character or asset instead of the whole scene.
- **Offset**: move by an exact amount instead.

In Python, `relocateScene(dryRun=True)` reports what would move without changing anything, and `from="Hero"` takes the point from an object's pivot.

## Display origin

**Modify > Scene Origin > Set Display Origin** draws the grid and world axes about the selection's bottom centre, and grid snapping (**X**) snaps to that grid, without moving anything. The HUD shows **Display Origin** while one is set. It is saved with the scene. The channel box and typed values still read world positions. **Clear Display Origin** puts the grid back.
