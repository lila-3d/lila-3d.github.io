# Viewport toasts

Pop a short message up in the bottom-right corner of the viewport, such as "Exported 12 meshes", from a script or extension. It fades out on its own.

> Available for Python (`lila.ops.viewportToast`) and C++ (`#include <lila/Viewport.h>`, `lila::ui::viewportToast`).

## Get it working

Run in the script editor:

```python
import lila
lila.ops.viewportToast("Exported 12 meshes")
```

From a C++ extension built with `UI`:

```cpp
#include <lila/Viewport.h>

lila::ui::viewportToast::showActive("Exported 12 meshes");
```

## Troubleshooting

- **Nothing shows:** in batch mode (`lilabatch`, `lila -b`) there is no viewport, so the call does nothing.
- **Only one toast for repeated calls:** the same text restarts the one already showing rather than stacking a copy. Vary the text, for example with a count, to stack them.

## Options

| Python | C++ | What it does |
| --- | --- | --- |
| `duration=4` | `durationMs` (`4000`) | How long it shows, fade included. Default 2 seconds. |
| `all=True` | `show(text)` | Every viewport instead of only the active one. |
| `error=True` | `Kind::Error` | A red accent, for something that failed. |
|  | `show(text, view)` | One viewport, by its widget. |
