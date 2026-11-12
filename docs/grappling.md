# Grappling

Hold one character's hand, arm or body to another's (a wrist grab, a collar, a headlock, a lift, a carry, a push) and both are solved together every frame: each yields its share, the auto-poser places the rest of the body, and the two don't pass through each other. The result bakes to plain keys, so takes export to Unreal with it.

<!-- media: grappling.mp4, one Manny grabbing another's wrist and pulling him off balance, then a throw on the ragdoll -->

## Get it working

1. Have two characters in the scene, each with its own skeleton. Two imports of the same skeleton work when each is under its own group.
2. Go to the frame the contact should be on and run **Animation > Grapple > Grapple Tool** (also in **Puppeteer > Grapple**). The Grapple palette opens.
3. Pick a **Kind**: **Grab**, **Hold**, **Push** or **Lift**.
4. Drag from a hand of one character onto the other character's body and release where it should hold. The body part under the cursor lights up.
5. The contact blends in over **Blend** frames and, with **Auto Bake** on, the grapple bakes over the playback range. Scrub: the hand stays on that spot while the other character moves, and both bodies give.
6. At the release frame, select the contact in the palette's list (or click its line in the viewport) and click **Contact Off**.

```python
hand = "attacker|root|pelvis|spine_01|spine_02|spine_03|spine_04|spine_05|clavicle_r|upperarm_r|lowerarm_r|hand_r"
forearm = "defender|root|pelvis|spine_01|spine_02|spine_03|spine_04|spine_05|clavicle_l|upperarm_l|lowerarm_l"
grappleContact(hand, forearm, kind="grab", time=1.0, blend=0.2)
bakeGrapple("grapple1")
```

## Kinds and who yields

| Kind | Holds | Yields |
| --- | --- | --- |
| Grab | Position and the grip's rotation | By mass |
| Hold | Position; the hand turns freely (an arm round a neck) | By mass |
| Push | Position | The other body is moved by the hand |
| Lift | Position, and the lifted character's feet leave the ground | The other body is moved by the hand |

**Lead** overrides the kind for new contacts and for the selected ones: **Source** brings the other body to the hand, **Target** makes the hand reach all the way, **Even** splits it. Under **Characters**, **Mass** sets the by-mass share (the heavier side moves less) and **Planted** keeps a character's feet where its animation puts them.

A contact rides the joint it holds, so it follows the other character's animation like a space. Its **weight** in the Channel Box blends it: 0 is the animation as it was, 1 holds. **Contact On** and **Contact Off** key the weight, and the motion between has no pop.

## Physics

For throws, falls, shoves and struggles, run **Grapple Ragdoll** on the palette (also in **Animation > Physics**). Both characters become one ragdoll: physics markers on their labelled joints, pulled toward the animation with the grapple's bake by pose matching, colliding with each other, each contact a spring between the two bodies. Key a contact off at the release and the thrown body carries on with what the throw gave it. **Record Physics** bakes it onto a layer above the grapple's; recording again gives the same keys.

Key the markers' **poseStiffness** down to let a body go limp, and a contact's **stiffness** for a softer or harder grip. The solver is an ordinary Physics Animation solver: its markers, pins and fields all work.

## Troubleshooting

**The hand stops short of the point.** The point is out of reach with both characters' feet planted. Turn off **Planted** for the character that should step, or change **Lead**.

**The mesh doesn't show the contact.** The bake is off or older than the edit: click **Bake Grapple**, or keep **Auto Bake** on. Edits made outside the palette (the Channel Box, the animation underneath) need a bake.

**The bodies push apart oddly.** Collision capsules come from physics markers, else the skinned mesh, else the bones; a skeleton with no mesh gets bone-sized capsules and the log says so. Run `fitGrappleBodies("grapple1")` after adding the mesh, or turn off **Collide**.

**The log says marker shapes are sized from the skeleton.** Those joints have no skinned faces of their own (a bare skeleton, or joints whose region the twist joints take), so their physics shapes come from the skeleton's height and shoulder span. The ragdoll stands with them; run **Fit Physics Marker** after skinning for a closer fit.

**A skinned character jumps away from its mesh when moved.** Move it by its root joint. Moving a group above the mesh double-transforms the mesh, as in Maya.

**The palette shows a gap at some frames.** **Gap** and **Overlap** are what the solve left at the current frame, in cm. A gap that won't close means the contact fights the planted feet or another contact.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `margin` | `0.5` | Gap kept between the bodies, cm. |
| `iterations` | `12` | Most rounds of solving the characters against each other per frame. |
| `startFrame` | `0` | First frame solved. |

`grappleInfo("grapple1")` reports each character's bodies and mass, the contacts, and the gap and overlap at the current frame.
