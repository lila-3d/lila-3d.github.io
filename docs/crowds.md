# Crowds

Fill a scene with hundreds of people who wander, queue, chat in groups, walk the sidewalks of a settlement or run from a monster, each with generated motion, then bake them onto real characters or send them to Unreal.

<!-- media: a plaza with a hundred agents wandering, a queue at a stall and an idle group, Crowds panel open -->

## Get it working

1. Select one or more skinned characters (any humanoid: UE5 Manny or Quinn, Mixamo, MetaHuman) and choose **Animation > Crowds > New Crowd**. The **Crowds** panel opens on the new crowd.
2. Under **Spawn**, press a behaviour, for example **Wander**. Its option box sets the count, the area and the speed range. The agents appear as markers where they start.
3. Press **Simulate**, or play. The agents walk, avoid each other and pause; scrubbing back reads the cache.

```python
crowdCreate(characters=["Manny", "Quinn"])
crowdSpawn("crowd", count=100, behaviour="wander", radius=2500)
crowdSimulate("crowd")
```

The status line at the top of the panel says how many agents there are, what the motion runs on (the GPU through DirectML, or the CPU) and which frames are cached.

## Behaviours

Each spawn is a group with one behaviour. Spawn again to add more groups to the same crowd; a group with the same name is replaced.

| Behaviour | Needs | What agents do |
| --- | --- | --- |
| Wander | an area (centre and radius), or the network | walk to random goals, pause, walk on |
| Go To | `goal`: a node or a point | walk there and stand; an animated goal is followed |
| Follow Path | `path`: a curve | walk along it, once or with `loop` round and round |
| Queue | `path`: a curve, its end the head | line up at `spacing`; every `serve` seconds the head leaves |
| Idle Group | a centre | stand in a ring and turn to each other now and then |
| Spot | `spots`: motionSpot nodes | walk to a spot and perform it (sit, pick up), then stay or leave |
| Flee | `threat`: a node | run from it when it comes within `range` |
| Chase | `target` node, or `prey` group | run after it; within `range` counts as caught |

`then` sets what Go To, Queue and Spot agents do afterwards (Queue and Spot wander by default). Spots come from [Generated motion](motion.md#paths-and-spots).

Where agents start depends on what is selected (or `source`): a curve spreads them along it, a mesh or terrain scatters them over its upward faces, anything else spawns a disc around it.

## Sidewalks and crosswalks

Set the crowd's **Network** to a settlement (and any curves you want walkable). Spawn with **onNetwork** and agents start on the sidewalks and walk the lane graph, crossing at crosswalks.

```python
crowdCreate(characters=["Manny"], network=["Settlement"], ground="Settlement")
crowdSpawn("crowd", count=300, behaviour="wander", onNetwork=True)
```

**Ground** stands the agents on a mesh or terrain; **Obstacles** lists nodes whose footprints they walk round.

## Detail

Generating motion for every agent costs one model run per batch of agents (about 0.4 s for 32 on a desktop GPU). To keep big crowds quick, set **Focus** to a camera or hero character: agents within **Generated Radius** of it (up to **Generated Max**) generate their motion, the rest play gait cycles that cost nothing. **Detail** set to `cycles` previews a whole crowd instantly; set it to `generated` before a final bake.

The viewport draws the nearest **Full Limit** agents as their characters and the rest as proxy skeletons; **Quality** in the panel forces Full, Proxy or Points.

## Bake and export

**Bake** gives every agent its own copy of its character, keyed every frame, feet planted where the motion has contact, under one group. **Export** bakes and writes one FBX per agent to a folder; `combined=True` writes one file.

```python
crowdBake("crowd", start=1, end=240)
crowdExport("crowd", path="D:/out/plaza", format="fbx")
crowdExport("crowd", path="D:/out/plaza.glb", format="gltf", combined=True)
```

**Send to Unreal** bakes, imports each character's skeletal mesh once and each agent's animation on its skeleton, and builds a Level Sequence with one skeletal mesh actor per agent in the open level, in an outliner folder named after the sequence. Sending again replaces those actors.

```python
crowdSendToUnreal("crowd", folder="/Game/Crowds/Plaza")
```

## Troubleshooting

**Agents play stiff cycles instead of generated motion.** The panel's warning says why: the motion model is missing, **Detail** is `cycles`, or the agents are outside **Generated Radius** of the **Focus**. A bake reports how many frames came from cycles.

**Agents draw as capsule skeletons.** The crowd has no characters, or the warning names a character with no skinned mesh on its skeleton. Select the crowd and the characters and press **Characters** under **Display**.

**Scrubbing far ahead is slow.** Every frame up to the one shown is simulated once, then cached. **Simulate** with the playback range set fills the cache with a progress bar you can cancel.

**Spawn fails with "needs a path curve" (or a goal, threat, target, spots).** That behaviour needs it: pass it in the option box or select it with the crowd.

**"the crowd has no network".** Set **Network** on the crowd before spawning with **onNetwork**.

## Options

On the crowd node in the Attribute Editor:

| Option | Default | What it does |
| --- | --- | --- |
| `seed` | `1` | Every random choice; the same seed gives the same crowd on any machine. |
| `batch` | `32` | Agents per model run. On a GPU a batch costs about the same at any size. |
| `lookahead` | `0.15` | Seconds early an agent may ask for its next motion so batches fill. |
| `avoidance` | on | Agents steer round each other and the obstacles. |
| `timeHorizon` | `2.0` | Seconds ahead agents look for each other. |
| `startFrame` | playback start | Frame every agent stands at its spawn point. |
