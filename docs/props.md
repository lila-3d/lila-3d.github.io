# Props and weapons

Put a sword, pistol, rifle, launcher or any prop in a character's hands, hand it from hand to hand, holster it and aim it at a target, with both arms sharing the work of a two-handed grip. The character's own bones carry the animation, so takes drop into Unreal with the prop attached to a socket on the hand.

<!-- media: props.mp4, Manny drawing a greatsword from his back into both hands, swapping a pistol to the left hand, then shouldering a rifle that tracks a moving target -->

## Get it working

1. Make a Puppeteer character for the skeleton (**Puppeteer > Create Character**). Its hands are set up with it.
2. Select the prop's mesh or group and open **Puppeteer > Props > Props**. Click its class, for example **Greatsword**. Grip, tip, muzzle and stock points are fitted to the mesh and drawn on it while the prop is selected.
3. Go to the frame the character takes it and click **Hold**. The prop settles into the hand over **Blend** frames and the fingers close round it. Two-handed classes put the other hand on the off grip; both arms move to meet it.
4. Later frames: **Other Hand** hands it over, **Holster** puts it away, **Drop** leaves it in the world, **Hold** again draws it.
5. Select a target (or nothing, to get a new locator in front of the character) with the prop and click **Aim**. Long guns go to the shoulder, pistols and bows are held out, blades go to guard.

```python
puppeteerPropSetup("rifle", kind="rifle")
puppeteerPropHold("rifle", time=0.0)
puppeteerPropAim("rifle", target="enemy", time=1.0)
puppeteerPropHolster("rifle", time=3.0)
```

Each change happens at the current frame with no pop: the prop keeps its place on that frame and eases into the new hold. **Holds** lists who has it from which frame; click a row to go there. The prop's space keys also show on the time slider and in the Stacker.

## Grip points

Points are transforms under the prop. Move and turn them like any object. For a grip, the long line runs along the handle toward the thumb and the short one shows which way the palm faces; a muzzle or tip line points where the prop aims. **Fit Points** places them again from the mesh, and **Add Grip** adds an alternative grip a hand can take with `puppeteerPropHold(..., point="grip")`.

| Class | Hands | Hand poses | Aim | Put away |
| --- | --- | --- | --- | --- |
| Sword, Axe / Hammer | One | Grip | Guard | Left hip |
| Greatsword, Spear / Staff | Both | Grip | Guard | Back |
| Dagger | One | Grip | Guard | Right thigh |
| Shield | One | Grip | Guard | Back |
| Bow | Both | Grip, string hook | Extend | Back |
| Pistol | One | Trigger | Extend | Right thigh |
| Rifle, Shotgun, Launcher | Both | Trigger, grip | Shoulder | Back |
| Generic | One | Grip | Turn | Belt |

**Hands** on the panel overrides the class for this prop. A holster is a point on the character made the first time the prop is put away; move it to taste.

## Solve

Holds and aims solve the arms and body over the playback range onto the `<character>_props` layer: off hands on their grips, the reach shared between both arms, aims turned onto their targets. **Solve Props** runs it again after you change the animation underneath. Mute the layer to see the animation without it. Pass `solve=False` to the commands to batch several edits, then solve once.

## Unreal

1. Open **Unreal** on the Props panel and click **Set Up**. The prop attaches to the bone holding it (`hand_r` by default) through a socket (`weapon_r`) at the offset it is held at.
2. Send the character, then the prop, with the Unreal link. The socket is made on the character's skeletal mesh.
3. Export the take as usual: the character's bones carry it, nothing else is needed.

Projects whose locomotion reads hand IK bones can tick **IK Bones** (shown when the skeleton has `ik_hand_gun`, `ik_hand_r` and `ik_hand_l`): those bones are keyed every frame to follow the holding hand, the right hand and the left hand. Other names: `puppeteerPropUnreal("rifle", ikBones=True, gunBone="ik_weapon")`.

## Troubleshooting

**A log line says a finger started inside the target.** The grip point sits too deep in the hand for that finger, which keeps the class pose. Increase the grip point's **Radius** in the Attribute Editor, or move the point out of the palm, and **Hold** again.

**The off hand doesn't reach its grip.** **Gap** beside **Solve Props** is the distance left. The grip is out of the arms' reach from where the body stands; move the off grip closer, or pose the body nearer, then **Solve Props**.

**"…is still in hand_r".** Another prop rides that hand. Holster or drop it first; the new prop takes over the hand's contacts.

**Set Up warns the prop moves against the hand.** A socket holds one offset. Keep the prop still in the hand over the exported range (one hold), or export each hold as its own take.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `blend` | `0.2` s | How long a hold, handoff, holster or aim takes to settle after its frame; 0 snaps. |
| `hands` | class | 1 or 2. |
| `hand` | prop's | `right` or `left` for the main hand. |
| `style` | class | Aim: `shoulder`, `extend`, `guard` or `turn`. |
| `weight` | `1.0` | Aim: how fully it turns onto the target; key it to blend. |
| `fingers` | on | Pose and wrap the fingers. |
