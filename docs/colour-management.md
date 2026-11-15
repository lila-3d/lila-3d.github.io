# Colour management

Show the viewport and write renders through an OpenColorIO config's display and view (ACES, AgX, your studio's own) instead of Lila's tonemapper.

## Get it working

1. **Render > Colour Management** selects the scene's colour management node.
2. Set **Mode** to **ocio**. The built-in config is OpenColorIO's latest studio config, so the view switches to its default view (ACES 2.0 SDR) straight away.
3. In the node's **OCIO** section, pick the **Display** your monitor is (sRGB for most), the **View**, and a **Look** if the config has any.

```python
colorManagement(mode="ocio", display="sRGB - Display", view="ACES 2.0 - SDR 100 nits (Rec.709)")
ocioInfo()  # displays, views, looks and colour spaces the config offers
```

To use your own config, set **Config** to **file** and **Config Path** to the `.ocio` file, or **environment** to use the one `$OCIO` names. A studio can force a config for everyone by setting `/colorManagement/ocioConfig` in its studio preferences folder.

PNG, JPG and video renders come out as the view shows them. EXR renders stay scene-linear Rec.709 (tagged with chromaticities) for compositing; set **EXR Output** to **display** to write the viewed picture instead.

Colour textures in another colour space (ACEScg, a camera log): set the material's **Base Color Map Ocio Space** or **Emissive Map Ocio Space** to that colour space name. Data maps (normal, roughness, metallic) stay raw.

## Troubleshooting

**The top right of the view says OCIO failed.** The config didn't load (missing file, unreadable `$OCIO`, a typo in it), so Lila's tonemapper draws instead. The message and the log say why; the node's OCIO section shows the same.

**Colours look oversaturated or washed out.** The **Display** doesn't match the monitor. Pick the display your monitor is calibrated to.

**A texture looks wrong only with OCIO on.** Its OCIO space names a colour space the config doesn't have; it falls back to its sRGB or linear setting and the log names the texture. Use a name from `ocioInfo()["colorSpaces"]`.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| **Mode** | lila | `lila` uses the post process's tonemapper; `ocio` the config's display and view. |
| **Config** | builtin | `builtin`, `file` (Config Path) or `environment` (`$OCIO`). |
| **EXR Output** | sceneLinear | `display` writes the picture as viewed. |
| `/colorManagement/ocioConfig` | empty | A config path that overrides every scene's; studio folders can lock it. |

> **Note:** Lila's working space is linear Rec.709. With a config whose scene-linear role is ACEScg (the studio config), Lila converts from the config's Rec.709 linear space, so colours stay as you picked them.
