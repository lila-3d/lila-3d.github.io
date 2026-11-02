# Lighting Channels and Relationships

Limit a light to some objects: it lights the objects that share a Lighting Channel with it, as in Unreal, with as many named channels as the scene needs.

## Get it working

1. Open **Windows > Editors > Relationships**.
2. Select the light and the objects it should light.
3. Type a channel name (`rim`) in the search field and click **+**: everything selected joins it.
4. Untick **default** on the light: it now lights only the objects in `rim`.

The Relationships panel lists the selected objects down the side and every lighting channel, object set, display layer and anim layer as a column; tick or untick to change membership. Lights and objects share the channel columns, so you can link from either side.

```python
lightingChannels("RimLight", "Hero", set=["rim"])
lightingChannels("Hero", add=["default"])
lightingChannel("rim", rename="back")
```

Everything starts in **default**, Unreal's channel 0.

## Export and import

Every export that carries channels says so in its option box and its report, with a toggle to leave them out.

| Format | Channels become |
| --- | --- |
| Unreal (LilaLink) | `bLightingChannels`: **default** is channel 0, the next two used channels 1 and 2. More than three: the rest are dropped, with a warning naming them |
| USD | UsdLux light-link collections on each light |
| Maya and USD import | Light links baked into channels: one per distinct set of linked objects, named after the light |

## Troubleshooting

**A light lights nothing.** It shares no channel with any object: tick one of the objects' channels on the light's row.

**Unreal warns about dropped channels.** Unreal has three channels. Merge channels in the Relationships panel until three or fewer are used by what you send.

**The viewport ignores a channel.** The viewport tells 20 channels apart; objects in later ones are lit by every light.
