# Clay

Block out characters and organic forms from shapes that melt into each other. Everything is in **Mesh > Clay**.

<!-- TODO image: a stylised creature blocked out in clay, shapes shown as crosses (images/clay/overview.png) -->

## Getting started

1. **Mesh > Clay > Create Clay** makes a clay object with one shape, mirrored across X. Pick the shape or turn mirroring off in its option box or the adjust popup.
2. **Add Clay Shape** adds a sphere, ellipsoid, box, capsule, cylinder, cone or torus. Pick the shape in the option box.
3. Move, rotate and scale shapes like any object.
4. **Add Clay Cut** carves into everything before it.
5. **Convert Clay to Mesh**. The clay stays, hidden, so you can change it and convert again. Tick **Remesh** in its option box for clean quads.

> Shapes join in Outliner order: a cut only reaches the shapes above it.

## Clay Tool

**Mesh > Clay > Clay Tool** works on the selected clay object, or makes one at your first click.

The **Clay** palette opens while the tool is on: shape or stroke, add or cut, radius, blend and **Mirror X**. Float or dock it anywhere; it closes with the tool. The tool's keys are listed in the corner of the view.

In stroke mode, a lit tip under the cursor means a stroke started there extends or branches it.

**Chain** (C) works like ZSpheres: each click places a shape linked to the selected one, and the new shape is next in the chain. Shift-click a shape to branch from it. Links follow their shapes as you move or resize them; **Thickness** sets their radius as a fraction of each end shape's size, for new links or the selected ones. In Python, `addClayLink(["Body", "Head"])` links two shapes.

Hold Shift while dragging out a shape to give it the last shape's radius.

**Edit > Duplicate** (Ctrl+D) copies shapes and links into the same clay. Duplicate a whole finger (its shapes and links) and the copied links join the copied shapes; a link to a shape you didn't copy, like the palm, stays joined to it.

With a clay object selected, its shapes show as outlines; cuts are red. Clicking its surface then selects the shape or link under the cursor.

With one shape selected, drag its solid ring to size it and its dashed ring to set its blend.

## Joins

Each shape has an **operation** (add, subtract, intersect) and a **blend** radius in cm. Blend 0 is a hard edge; larger values melt the join.

**Group Clay Shapes** joins the selected shapes to each other first. A cut inside a group only carves that group, so an eye socket can cut the head without touching the eyeball added after it.

## Geometry nodes

The **Clay** node melts spheres at points and tubes along curves into one mesh, radii from fields. Tick **Cut with Points** or **Cut with Curves** to carve with one input instead.

## Joints

`clayJoints` makes a root joint for the body and a joint chain down each stroke. Give it the converted mesh and it binds it, starting each vertex's weights from the clay shapes it lies nearest:

```python
mesh = convertClayToMesh("Worm")
clayJoints("Worm", mesh=mesh)
```

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Shapes stopped updating after dragging them in the Outliner | **Mesh > Clay > Refresh Clay** |
| Surface vanished and the surface node shows a warning | The voxel size is too small for the clay's size. Raise **voxelSize** on the claySurface node |
| Surface looks blocky | Lower **voxelSize**. Convert uses the finer **finalVoxelSize** |
| A thin part breaks up | It is thinner than two voxels. Lower the voxel size or thicken the shape |

## Settings

On the **claySurface** node:

| Setting | Does |
| --- | --- |
| **voxelSize** | Surface detail while editing, cm |
| **finalVoxelSize** | Surface detail for Convert, cm |
| **symmetry** | Mirror the clay across the object's YZ plane. Model either side |
| **sharpEdges** | Keep box edges and hard joins sharp, for hard-surface clay. Slower |
| **colors** | Write each shape's **color** to the `clay` color set, blended across joins |
