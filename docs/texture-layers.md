# Texture layers

Build a texture set from layers in the Texture Set dock: fills, paint, materials and filters stacked bottom to top, each with its own masks.

## Get it working

1. Select a mesh and run **Texture > New Texture Set**. The Texture Set dock shows its layer stack.
2. Add a layer with the stack's **+** button, or drag a material from the library onto the stack.
3. Select the layer to edit its channels and masks below the stack.

## Projections

A fill or material layer, and a generator or paint mask, can land on the mesh by projection instead of by uvs, so seams and stretched uvs don't show.

1. Select the layer (or mask) and set **Projection > Mode**: Planar, Triplanar, Spherical, Cylindrical or Warp.
2. Click **Place on Mesh**, then click the mesh where the projection should sit. Drag to move it over the surface, **Shift**+drag turns it, **Ctrl**+drag scales it. Press **Enter** when done.
3. Fine-tune the numbers under **Projection**: position, rotation and size are in the mesh's object space.

| Mode | Use it for |
| --- | --- |
| Planar | Decals, labels, anything seen from one side. **Follow** carries it over edges that turn away. |
| Triplanar | Tiling materials on any shape: three planar projections blended by the surface's facing (**Sharpness**). |
| Spherical, Cylindrical | Round props: barrels, pipes, domes. |
| Warp | Planar with its four corners pulled, to bend content onto a curved panel. |

A fill layer's channel can be an image file instead of a value; it is read through the layer's projection.

```python
texSetLayer("Crate", "L2", {"material": {"baseColor": "textures/label.png"},
                            "projection": {"mode": "planar", "positionY": 12, "sizeX": 20, "sizeY": 10, "follow": 1}})
```

## Troubleshooting

**A projection shows the content stretched or flat.** The texture set has no position and normal maps to project with. Set its bake project (**Baking**) so the mesh maps exist.

**The projection lands in the wrong place.** Position, rotation and size are in the mesh's object space, not world space; **Place on Mesh** sets them from a click.
