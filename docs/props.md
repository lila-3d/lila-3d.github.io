# Props and weapons

Put any object in a character's hands (a sword, a rifle, a bottle, a chair leg, a guitar), hand it from hand to hand, holster it, aim it, plant it, throw and catch it, put it on a table and pass it to another character, with the arms reaching to meet it. The character's own bones carry the animation, so takes drop into Unreal with the prop on a socket or on a baked bone.

<!-- media: props.mp4, Manny drawing a greatsword from his back into both hands, planting it in the ground, tossing a ball to Bob who catches it, then Bob passing a mug back -->

## Get it working

1. Make a Puppeteer character for the skeleton (**Puppeteer > Create Character**). Its hands are set up with it.
2. Select the prop's mesh or group and click **Make Prop** (**Puppeteer > Props**). Its shape is read from the mesh: grips, tip, muzzle and stock are placed where the shape has them, and its settings (one or two hands, hand poses, aim style, holster spot) follow from what it reads as. A preset tile on the Props panel (**Greatsword**, **Rifle**...) fills the settings in one click instead.
3. Go to the frame the character takes it and click **Hold**. The prop settles into the hand over **Blend** frames and the fingers close round it. With **Hands** set to **Both**, the other hand takes the off grip and both arms move to meet it.
4. Later frames: **Other Hand**, **Holster**, **Drop** and **Hold** again; under **Handoff**, **Plant**, **Put On**, **Throw**, **Catch**, **Take** and **Pass**. Each happens at the current frame with no pop.
5. Select a target with the prop (or nothing, for a new locator in front of the character) and click **Aim**.

```python
puppeteerPropSetup("rifle")
puppeteerPropHold("rifle", time=0.0)
puppeteerPropAim("rifle", target="enemy", time=1.0)
puppeteerPropThrow("rifle", time=2.0, speed=600)
puppeteerPropCatch("rifle", character="bob")
```

**Track** lists who or what has the prop from which frame (Right hand, Planted, Thrown, Caught, On table, Passed); click a row to go there. The prop's space keys also show on the time slider and in the Stacker.

## Points

Points are transforms under the prop: select one in **Points** or in the viewport and move or turn it. On a grip the long line runs along the handle toward the thumb and the short one shows the palm side; a tip or muzzle line points where it aims. **Add** puts another grip on the main one, **Remove** deletes the selected points. **Fit Points** places the fitted ones again and leaves points you added or moved.

```python
puppeteerPropPoint("guitar", role="off", name="strum", position=(10, 95, 30))
puppeteerPropPoint("guitar_strum_point", aim=(1, 0, 0), palm=(0, 0, -1), radius=2.5)
puppeteerPropPoint("guitar_strum_point", remove=True)
puppeteerPropHold("guitar", point="strum")
```


## Handoffs

- **Plant**: stands it on its tip on the ground or a surface ahead, leaning back toward where it was held; the hands carry it down, then let go. Its option box sets the lean, the end (`tip` or `base`) and how far ahead.
- **Put On**: select the prop and the object (a table, a shelf). It goes onto the object's top and rides the object from then on. Select a second transform as a hook to hang it by its grip instead.
- **Take**: the hand reaches for the prop where it is (on the table, the ground, the hook) over **Blend** and takes it.
- **Throw**: a keyed arc with spin from how the hand moves at the release, landing on the ground or a mesh. Without hand motion it goes forward at 500 cm/s and the log says so; set speed, angle, spin, or **Physics** (Jolt: it bounces and rolls to rest) in the option box.
- **Catch**: the hand (either, or the selected character's) meets the arc where it passes nearest and takes it. Select another character first for them to catch it.
- **Pass**: with two characters, select the other one. The receiver takes it by a free grip, both arms reach to meet halfway, and the giver lets go.

Click a throw in **Track** to select its arc, then drag any frame of it in the viewport: the arc goes through there, keeping its launch.

## Solve

Holds, handoffs and aims solve the arms of every character holding props onto the `props_grapple` layer: hands on their grips, the reach shared between both arms (or both characters in a pass), aims on their targets. **Solve Props** runs it again after you change the animation underneath. Mute the layer to see the animation without it. Pass `solve=False` to batch several edits, then solve once.

## Unreal

1. Open **Unreal** on the Props panel and click **Set Up**.
2. Send the character, then the prop, with the Unreal link.
3. Export the take as usual.

A prop held by one hand all the range attaches to that bone (`hand_r`) through a socket (`weapon_r`) at its held offset. A prop that leaves the hand (thrown, planted, put down, passed) gets a bone of its own under the skeleton's root, `<prop>_motion`, keyed every frame, and attaches to it with no offset. Force either with `puppeteerPropUnreal("ball", mode="socket")` or `mode="baked"`.

Projects whose locomotion reads hand IK bones can tick **IK Bones** (shown when the skeleton has `ik_hand_gun`, `ik_hand_r` and `ik_hand_l`): those bones follow the holding hand, the right hand and the left hand every frame.

## Troubleshooting

**The grips are in the wrong place.** The shape was read as something else. Pick it in **Shape** under **Settings** and click **Fit Points**, pick a preset, or move the points.

**A log line says a finger started inside the target.** The grip sits too deep in the hand for that finger. Raise the grip's **Radius** in the Attribute Editor, or move the point out of the palm, and **Hold** again.

**A hand doesn't reach its grip.** **Gap** beside **Solve Props** is the distance left. It's out of the arm's reach from where the body stands; move the grip, or pose the body nearer.

**Catch says the arc never comes within reach.** It's caught where it comes closest with the arm stretched. Drag the arc nearer the hand, or move the catcher.

**"...is caught at frame N, timed to the arc before this edit".** You changed the arc after catching it. **Catch** again.

**Put On says it isn't held over the object.** It went on the middle of the top. Hold it over where it should go, or give `position`.

**Set Up warns the prop moves against the hand.** A socket holds one offset. Keep it still in the hand over the range, or use `mode="baked"`.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `blend` | `0.2` s, `0.4` s for Plant and Put On | How long a change takes to settle after its frame; 0 snaps. |
| `reach` | `0` s (Take: Blend, Catch: `0.3` s) | Hold: the hand goes to the prop over this long before the frame. |
| `release` | `0.25` s | Plant and Put On: how long the hands take to let go. |
| `lean` | `12` deg | Plant: tilt from upright. |
| `speed`, `angle`, `spin` | from the hand | Throw: launch speed (cm/s), degrees up, degrees a second. |
| `physics` | off | Throw: simulate instead of a keyed arc. |
| `duration` | `0.6` s | Pass: from the receiver reaching to the giver letting go. |
| `hands` | prop's | 1 or 2. |
| `style` | prop's | Aim: `shoulder`, `extend`, `guard` or `turn`. |
| `weight` | `1.0` | Aim: how fully it turns onto the target; key it to blend. |
