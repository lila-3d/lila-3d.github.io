# Weight painting

Paint skin weights where you decide where every bit of weight goes, see where Lila split weight for you, and relax or settle weights with a solver instead of averaging them.

<!-- media: Paint Weights palette beside a bent elbow, Strict refusing a stroke, then Settle smoothing the elbow -->

## Get it working

1. Select a skinned mesh and choose **Rig > Paint Skin Weights**. The **Paint Weights** palette opens.
2. Click the joint to paint in the influence list.
3. Ctrl+click the joint that should take the weight you remove: the **receiver**. Its name shows under the list.
4. Drag on the mesh. Weight moves between the painted joint and the receiver only; every other joint keeps its weight.

Without a receiver, removed weight goes to the one other unlocked joint with weight at that vertex. Where more than one could take it, **Strict** refuses the vertex: the brush ring turns amber, the refused vertices flash and the readout says why.

```python
floodSkinWeights("Body", influence="elbow_l", receiver="upperarm_l", value=0.0, vertices=[812, 813, 840])
```

## Troubleshooting

**The stroke does nothing and the ring is amber.** Several unlocked joints share those vertices and **Strict** won't pick between them. Ctrl+click a receiver, or Alt+click a lock in the influence list to lock every other joint.

**"Nowhere for the weight to go".** Every other joint at those vertices is locked or has no weight there. Unlock one, or set a receiver that has weight there.

**"Influence limit reached".** The vertex already has `maxInfluences` joints and the receiver isn't one of them. Lock or remove a joint there, or raise `maxInfluences` on the skinCluster.

**A warning badge on the mesh: "vertices have automatic weights".** Lila chose those weights: binding, a split with **Strict** off, normalize, prune, copy or remove influence. Turn on **Show Automatic** to dot them, or run **Rig > Select Automatic Weights**. Paint, relax or settle them, or accept them as they are with **Rig > Accept Automatic Weights**.

**Painting changes nothing you can see on a layered skin.** The layer's opacity is 0, it's hidden, or you're painting a layer under another that covers those vertices.

## Relax and Settle

| Brush or command | What it does |
| --- | --- |
| **Relax** (or hold Shift) | Eases weights toward their neighbours, weighted by edge length so dense and sparse areas spread alike. Locked joints keep their weights. |
| **Rig > Relax Weights** | Holds every vertex you set and settles the automatic ones between them. Paint the key areas, then relax the rest into place. |
| **Settle** brush, **Rig > Settle Weights** | Fits the weights so the current pose loses its pinches and collapses: each vertex aims at a delta mush of the posed mesh. |
| **Rig > Settle Weights (Simulate)** | Relaxes the posed mesh toward its rest edge lengths, keeping folds from passing through themselves, then fits the weights to that. |

Pose the joint first: Settle works in the pose you see. To fit over an animation, give a frame range:

```python
settleSkinWeights("Body", start=0, end=60, step=5)
```

Settle stays within `maxInfluences`, keeps locked joints and exports as plain linear weights.

## Weight layers

Layers keep a fix separate from the weights under it, so you can fade, hide or drop it.

1. In **Layers**, click **+**. The first layer also makes **Base** from the current weights.
2. Paint. Each vertex you paint on the layer shows it; the rest show the layers below.
3. Use **Opacity** to fade it, the check to hide it, or **Mask** to paint where it shows (white shows, black hides).

**Flatten Weight Layers** in the layer menu merges them into plain weights.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| **Strict** | On | Refuse vertices where more than one joint could take the weight. Off, Lila splits it in proportion and marks those weights automatic. |
| **Show Automatic** | On | Dot the vertices with automatic weights. |
| **Mirror** | Off | Paint the other side too, on the `_l`/`_r` partner joint and receiver. |
| **Under Brush** | Off | List only the joints with weight under the brush. |

The influence list's context menu has **Set as Receiver**, **Lock**, **Lock Others** and **Unlock All**.
