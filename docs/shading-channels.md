# Shading channels

Shading channels give a texture set sheen, coat, subsurface, anisotropy, transmission, IOR and specular colour, painted and filled like any other channel, shown in the viewport and the path-traced view, and exported under the names your renderer uses.

## Get it working

1. Select the texture set and choose **Texture > Add Shading Channels**.
2. Fill or paint the new channels. Each starts at a value that leaves the material as it was (coat 0, specular weight 1, IOR 1.5).
3. Paint the stroke direction of brushed metal or hair with the direction brush into `anisotropyDirection`, then raise `anisotropy`.

```python
texAddShadingChannels("RockTex", channels=["coat", "coatRoughness"])
```

## Troubleshooting

**The viewport ignores the channels.** They shade materials on the default lit model only; a material set to Painterly, Toon or another stylised model keeps it.

**Transmission looks like a thin sheet.** Transmission previews as a thin surface: light passes straight through, tinted by the base colour, without refraction.

**IOR reads 0.25 in the channel.** The `ior` channel stores (IOR - 1) / 2, so 0.25 is glass's 1.5 and 8-bit channels hold every useful value. Convert back with IOR = 1 + 2 × value.

## Options

| Channel | Default | Exported as (OpenPBR, glTF, Unreal) |
| --- | --- | --- |
| `sheenColor` | black | `fuzz_color`, `KHR_materials_sheen.sheenColorTexture`, FuzzColor |
| `sheenRoughness` | `0.5` | `fuzz_roughness`, `KHR_materials_sheen.sheenRoughnessTexture.a`, FuzzRoughness |
| `coat` | `0` | `coat_weight`, `KHR_materials_clearcoat.clearcoatTexture.r`, ClearCoat |
| `coatRoughness` | `0.05` | `coat_roughness`, `KHR_materials_clearcoat.clearcoatRoughnessTexture.g`, ClearCoatRoughness |
| `coatNormal` | flat | `geometry_coat_normal`, `KHR_materials_clearcoat.clearcoatNormalTexture`, ClearCoatNormal |
| `subsurfaceColor` | black | `subsurface_color`, `KHR_materials_diffuse_transmission.diffuseTransmissionColorTexture`, SSSMFP |
| `subsurfaceRadius` | `1` | `subsurface_radius`, `KHR_materials_volume.thicknessTexture.g`, SSSMFPScale |
| `anisotropy` | `0` | `specular_anisotropy`, `KHR_materials_anisotropy.anisotropyTexture.b`, Anisotropy |
| `anisotropyDirection` | along U | `geometry_tangent`, `KHR_materials_anisotropy.anisotropyTexture.rg`, Tangent |
| `transmission` | `0` | `transmission_weight`, `KHR_materials_transmission.transmissionTexture.r`, Transmission |
| `ior` | `0.25` (1.5) | `specular_ior`, `KHR_materials_ior.ior`, Refraction |
| `specularWeight` | `1` | `specular_weight`, `KHR_materials_specular.specularTexture.a`, Specular |
| `specularColor` | white | `specular_color`, `KHR_materials_specular.specularColorTexture`, SpecularColor |

Exports write each channel the set has as its own file. OpenPBR presets name the file after the OpenPBR input; other presets use a short suffix (`CC` for coat) and record the target property as the map's slot.
