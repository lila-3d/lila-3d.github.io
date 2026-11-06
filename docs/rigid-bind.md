# Rigid bind

Scales, armour plates, shingles and wood strips ride a deforming mesh without bending, and push apart instead of passing through each other.

<!-- media: scales on a bending arm, rigid bind beside a proximity pin -->

## Get it working

1. Put the pieces in one mesh (**Mesh > Combine**) sitting on the body at its bind pose. Each connected part is one piece.
2. Select the pieces mesh, then the body, and choose **Deform > Surface > Rigid Bind**.
3. Pose or animate the body. Each piece follows the surface under it and keeps its shape.

To see a finished setup first, open the **Rigid Bind** example from the welcome screen, or run `openExample("Rigid Bind")`.

```python
rigidBind("Scales", "Arm", params={"collisionLift": 1.0})
```

## Send it to a game

Unreal runs skin weights, joints and vertex animation, not a rigid bind. Pick one:

| Route | Keeps collision and relaxation | Cost in game | Use for |
| --- | --- | --- | --- |
| Skin weights | No | None: the body's own joints | Most armour and scales |
| One joint per piece | Yes | A joint per piece, baked animation | Tens to a few hundred pieces |
| Rigid VAT | Yes | Two textures, any number of pieces | Thousands of scales or strips |

**Skin weights.** Select the pieces mesh and choose **Deform > Bake for Unreal > Rigid Bind to Skin Weights**. Every point of a piece takes the body's skin weights under that piece, so the piece moves with the body's joints as one part. The body must have a skinCluster.

```python
rigidBindToSkin("Scales", maxInfluences=4)
```

**One joint per piece.** Bakes the animation onto a new mesh skinned one joint per piece, ready to export as an FBX skeletal mesh.

```python
bakePiecesToJoints("Scales", start=1, end=120)
```

**Rigid VAT.** One position and one rotation per piece per frame. When it reaches Unreal, LilaLink builds a material function (`MF_LilaVATRigid_UV<n>`) to drop into your own materials, plus a ready material (`M_LilaVATRigid_UV<n>`) built on it.

```python
exportVertexAnimation("Scales", mode="rigid")
```

## Troubleshooting

**Two parts move as one piece.** They share points. Separate them, or give the mesh an int point attribute `piece` naming each piece, then **Deform > Rebind Deformer**.

**Pieces sit offset after Rigid Bind to Skin Weights.** The wrap was bound with the body away from its bind pose. Run `goToBindPose` on the body, rebind the wrap, then convert again.

**"the mesh's pieces changed since binding" or "a driver's points changed since binding".** The pieces or the body changed topology. Run **Deform > Rebind Deformer**.

**Pieces still pass through each other.** Raise **Collision Iterations**, then **Reach** if pieces stop at the edge of how far they may move, and lower **Collision Softness** for harder contacts. Thin plates collide as boxes at least a tenth as deep as they are wide; lower **Collision Scale** if they push apart too early.

**Pieces jitter or tilt wildly where the body creases.** The skin folds there. Raise **Rotation Smoothing** so pieces turn with the wider surface, and lower **Reach** so collisions can't throw them far.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `collisionShape` | `box` | Each piece collides as a box, capsule or sphere fitted at rest, or not at all. |
| `collisionLift` | `0.5` | Where pieces overlap, the upper one climbs over the lower (1) or both slide apart along the surface (0). Upper means higher at rest. |
| `relaxation` | `0` | Pieces slide along the surface to keep their rest spacing where the body stretches or squashes. |
| `attachment` | `0` | Pulls pieces back toward where the surface put them on every relaxation and collision pass. |
| `reach` | `0.5` | How far collision, relaxation and the push off the body may move a piece from where the surface put it, as a fraction of the piece's size. |
| `maxSlide`, `maxLift` | `0` | The same limit in cm, along and off the surface; 0 for none. |
| `rotationSmoothing` | `0.5` | Pieces turn with the surface under them and their neighbours rather than only their own patch, so they stay steady where the body creases. |
| `collisionSoftness` | `0.1` | Contacts ease in over this fraction of a piece's size instead of snapping, at the cost of a little leftover overlap. |
| `tangentBlend` | `0` | At 1, pieces tilt with the surface normal but ignore its twist. |
| `collideDriver` | on | Pieces never sink deeper into the body's surface under them than at rest. |

Pieces overlapping at rest, like scales, may keep that overlap; only extra overlap is pushed apart. Pieces apart at rest keep at least `thickness` between them.
