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

## Clay Tool

**Mesh > Clay > Clay Tool** works on the selected clay object, or makes one at your first click.

| Input | Does |
| --- | --- |
| Click, drag | Place a shape where you click; drag to size it |
| **Ctrl** | Place a cut instead |
| **Shift**-click | Select the shape under the cursor |
| **1**-**7** | Sphere, ellipsoid, box, capsule, cylinder, cone, torus |
| **S** | Strokes: drag over the clay to lay a tube. Start on a stroke's tip to extend or branch it |
| **T** | Taper strokes |
| **[** **]** | Radius |
| **,** **.** | Blend |
| **Esc** | Exit |

With a clay object selected, its shapes show as outlines; cuts are red. Click an outline to select its shape.

## Joins

Each shape has an **operation** (add, subtract, intersect) and a **blend** radius in cm. Blend 0 is a hard edge; larger values melt the join.

**Group Clay Shapes** joins the selected shapes to each other first. A cut inside a group only carves that group, so an eye socket can cut the head without touching the eyeball added after it.

## Geometry nodes

The **Clay** node melts spheres at points and tubes along curves into one mesh, radii from fields. Tick **Cut with Points** or **Cut with Curves** to carve with one input instead.

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
