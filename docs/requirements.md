# System requirements

What Lila needs to run.

> These are estimates, not benchmarks. Benchmarks will come later.

## Get it working

Lila runs on **64-bit Windows 10 or 11** for now. Linux and macOS are planned.

| | Minimum | Recommended |
| --- | --- | --- |
| GPU | Vulkan 1.3 | Discrete GPU with hardware ray tracing (NVIDIA RTX 20 series, AMD RX 6000, Intel Arc or newer) |
| GPU memory | 4 GB | 8 GB or more for UDIM texture sets and high-poly bakes |
| System memory | 8 GB | 16 GB, 32 GB for sculpting and texturing dense meshes |
| Disk | SSD | SSD |

> Update your GPU driver first. Most GPUs from 2016 on support Vulkan 1.3, but only with a current driver.

## Troubleshooting

**Lila starts, but the viewport is black or missing.** The log says `vulkan: no GPU with Vulkan 1.3` or `no Vulkan loader found`. Install the latest driver from NVIDIA, AMD or Intel, not the one Windows Update provides.

**Bakes are much slower than expected.** Your GPU has no hardware ray tracing, so Lila uses its software tracer. It still runs on the GPU and gives the same results, only slower.

**Large texture sets are slow, or run out of GPU memory.** Virtual texturing streams only the parts of a texture you can see, but it needs descriptor indexing, 64-bit shader integers and fragment stores. Older and integrated GPUs may lack one of them, and then Lila loads every texture whole. Work at a lower resolution, or bake fewer tiles at a time.

**Rendering glitches or a crash on one GPU only.** Usually a driver bug. Update the driver, then try the environment variables below to switch features off one at a time. Mention which one helped when you report it.

## Options

Environment variables, set before launching Lila:

| Variable | What it does |
| --- | --- |
| `LILA_VK_NO_RT` | Turns hardware ray tracing off. Bakes use the software tracer. |
| `LILA_VK_NO_BINDLESS` | Turns descriptor indexing off. This also turns virtual texturing off. |
| `LILA_VK_VALIDATION` | Turns on the Vulkan validation layers, if installed. Slow; only for bug reports. |
| `LILA_BAKE_GPU_TRACE=sw` | Forces the software tracer in bakes and leaves ray tracing on for everything else. |
