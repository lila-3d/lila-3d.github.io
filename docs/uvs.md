# UVs

Unwrap and lay out UVs in the UV Editor, then let bake lint find the UV problems a normal map would show and select the exact edges and faces for you.

## Get it working

1. Open **UV > UV Editor**, select the mesh and press **Unwrap**.
2. Press **Relax** or **Optimize** to even out stretch, then **Pack**.
3. Open **Bake > Baker**, select the mesh and press **Low**. Lint checks every mesh in a bake group.
4. The Baker's group shows an **Issues** row when lint finds something. It checks again a moment after you edit the mesh, so you can fix and watch the count drop.
5. Click an issue row to select its edges or faces on the mesh, then fix them in the viewport or the UV Editor.

**Check** in the Baker, or **Bake > Check Bake Setup**, runs every check, including the ones that need the high meshes. Baking runs it first and lists its warnings.

## What lint finds in UVs

Hover an issue row for the full message and the fix.

| Issue row | What's wrong | Fix |
| --- | --- | --- |
| **Hard edges off UV seams** | The normal map can't hide the shading split along a hard edge inside an island. | Split the UVs along those edges, or soften them with **Surface > Soften Normals**. |
| **Missing UVs** | A mesh has no UVs, or triangles with no UV area get no texels. | Unwrap the mesh, or see Troubleshooting below. |
| **Overlapping UVs** | Islands writing one texture overwrite each other, also across meshes in one bake. | **Pack**. |
| **Mirrored or folded UVs** | A mirrored island decodes inverted where the tangent sign disagrees; a folded island bakes twice. | **Unwrap** or **Relax** a folded island. |
| **Texel density outliers** | Islands far from the project's median density look sharper or blurrier than the rest. | Even them out with **Texel Density** in the UV Editor. |

The other checks (rays missing the high, the cage) are on the [Baking](baking.md) page.

## Troubleshooting

**Missing UVs on a mesh with Auto Bevel or Subdivision, though its UVs look fine.** The modifiers squeeze the exported mesh's UVs at island corners where a seam meets bevelled edges. Try these in order, checking the Issues row after each:

1. Run **Optimize** on the mesh.
2. In the UV Editor, open up the reported corner of the island so its angle matches the surface, then run **Optimize** again.
3. Move the seam so it runs along a bevelled edge instead of ending at the bevelled corner.
4. On the **Auto Bevel** modifier, use **Edit Edges** to take that corner's edge out of the bevel.
5. **UV > Unwrap Exported Mesh** applies the modifiers and unwraps the result, so nothing collapses. The modifiers are gone afterwards; undo brings them back.

**Hard edges reported on a mesh with a Weighted Normals modifier.** The message names the modifier: its **Keep Hard Edges** is on, so it keeps the mesh's hard edges split. Turn it off; you don't need to soften the edges first.

**No Issues row at all.** Lint only checks meshes in a bake group. Add the mesh with **Low** in the Baker.

See [UVs under modifiers](essentials.md#uvs-under-modifiers) for how the UV tools work on a mesh with modifiers.
