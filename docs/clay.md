# Clay

Block out characters and organic forms from shapes that melt into each other. Everything is in **Mesh > Clay**.

<!-- TODO image: a stylised creature blocked out in clay, shapes shown as crosses (images/clay/overview.png) -->

## Getting started

1. **Mesh > Clay > Create Clay**. You get a clay object with one sphere.
2. **Add Clay Shape** adds a sphere, ellipsoid, box, capsule, cylinder, cone or torus. Pick the shape in the option box.
3. Move, rotate and scale shapes like any object. The surface follows.
4. **Add Clay Cut** carves into everything before it.
5. When the form is done, **Convert Clay to Mesh**. Tick **Remesh** in its option box for clean quads.

> Shapes join in Outliner order: a cut only reaches the shapes above it.

## Joins

Each shape has an **operation** (add, subtract, intersect) and a **blend** radius in cm. Blend 0 is a hard edge; larger values melt the join.

**Group Clay Shapes** joins the selected shapes to each other first. A cut inside a group only carves that group, so an eye socket can cut the head without touching the eyeball added after it.

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
| **colors** | Write each shape's **color** to the `clay` color set, blended across joins |
