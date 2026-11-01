# Reference images

Your reference photos in tabbed windows beside the viewport, and one laid over the model at low opacity to sculpt against.

<!-- TODO image: a head sculpt with a front photo overlaid at 30%, the Reference Images window docked beside it (images/reference-images/overlay.png) -->

## Get it working

1. Open **Create > Reference Images > Add Reference Images...** and pick your photos. They open as tabs of the Reference Images window (**Windows > Editors > Reference Images**); dropping files on it does the same.
2. Drag a tab onto the viewport. It shows over the model as an overlay.
3. Hold **O** and drag in the viewport to move the overlay; turn the wheel while holding **O** to fade it.
4. Tap **O** to hide it, and again to bring it back.

Hold **Shift** while dropping an image on the window to replace the tab you're looking at instead of adding one. **Alt**+drop an image file straight on the viewport to make an overlay without a tab.

```python
referenceImage("refs/front.jpg", "refs/side.jpg")
referenceOverlay("ref1", view="persp", opacity=0.25)
```

## Line up a photo with a view

For likeness work, match the camera to each photo once and come back to it later:

1. Turn the camera to where the photo was taken from, and move the overlay over the model.
2. Press **Shift+O** for the overlay toolbar. Click **Lens** to set the view to the photo's lens, then **Bind**.
3. Repeat for each photo. A bound overlay fades out as you turn away from its view, so a front and a profile photo each show only from their own side.
4. Click **Go to View** to put the camera back where that overlay was bound.

## Troubleshooting

**O does nothing.** O works on the active view's overlays. Click in the view first; a message says so when it has none.

**The overlay vanished after orbiting.** It's bound to a view. Click **Go to View**, or **Bind** again to unbind it.

**A tab shows "Can't read this image".** The file moved. Drop the file on the window with **Shift** held to point the tab at it again.

**A floating window ignores clicks.** It's set to click-through. Use **Windows > Reference Windows Clickable**.

**Closed a torn-off window by mistake.** Closing it closes its tabs; **Ctrl+Z** brings them back.

## Options

| Key in the viewport | Does |
| --- | --- |
| **O** hold | Overlays at full strength while held, to compare with the model |
| **O** + left / right / middle drag | Move / scale / rotate (Shift snaps rotation to 15°) |
| **O** + wheel | Opacity |
| **Shift+O** | Handles and toolbar on the overlay; **Esc** leaves |
| **Alt+O** | Next overlay on its own (front, side, three-quarter) |

| Overlay toolbar | Does |
| --- | --- |
| **Front** / **Behind** | Over the model, or under it |
| **Image** / **Gray** / **Outline** | Outline shows only the photo's edges, so the whole model stays visible |
| **Ghost** | The model see-through while the overlay shows |
| **Park** | Overlays opaque down the right edge, beside the model |

The Sculpt panel's **Reference Overlay** section has the same settings for the active view.

In a Reference window, drag a tab out to give it a window of its own, onto another window to move it (**Ctrl** copies), or onto a viewport for an overlay. **Alt**+click picks a paint color from the image. A floating window's **...** menu sets **Window Opacity**, **Stay on Top of Other Apps** and **Click-Through**.

References save with the scene. To share one set across scenes, open **... > Keep Set In** and pick **Project Folder** (`references.lilaref` in the project) or **User Settings**. **Save Set...** and **Load Set...** move a set as a `.lilaref` file, and **Embed in Set** keeps an image inside the set so it works without the file.
