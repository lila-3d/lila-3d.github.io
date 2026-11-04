# Reference images

Your reference photos in tabbed windows beside the viewport, and one laid over the model at low opacity to sculpt against.

<!-- TODO image: a head sculpt with a front photo overlaid at 30%, the Reference Images window docked beside it (images/reference-images/overlay.png) -->

## Get it working

1. Open **Create > Reference Images > Add Reference Images...** and pick your photos. They open as tabs of the Reference Images window (**Windows > Editors > Reference Images**); dropping files on it does the same.
2. Drag a tab onto the viewport. It shows over the model as an overlay, with handles and a toolbar to place it.
3. Drag the image to move it, a corner to scale it, an edge to crop it. Press **Esc** or click outside it when it's placed.
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

## Use one part of a model sheet

1. Drag an edge of the overlay inward until only the front view shows.
2. Click **Duplicate** in the overlay toolbar and crop the copy to the side view. Do the same for the back.
3. Bind each one to its view, as above, so each shows only from its own side.

## Repose a drawing

When a character sheet has the arms at a poor angle, cut its image plane at the joints and turn the pieces. **Shift**+click the image plane button on the viewport toolbar to tear off **Create > Reference Images** beside you.

1. Make an image plane from the sheet (**Create > Reference Images > Image Plane...**) and open **Create > Reference Images > Cut Image Plane**.
2. Click either side of the shoulder, then click around the arm and press **Enter**. Everything inside that loop becomes the arm piece. The dot between the first two points is where it pivots.
3. Cut the elbow, then the wrist, the same way. Each cut part is parented under the part it came from, so the forearm follows the upper arm.
4. To aim for an angle, open **Create > Reference Images > Image Plane Guides** and drag from the shoulder: the guide snaps to 15 degree steps (**Shift** for any angle) and shows its angle. **Ctrl**+click a guide to delete it.
5. Select a piece and rotate it around Z. With mirroring on (**X** in the tool, on by default), the other arm is cut too and follows it, pivot included.

Cut pieces clear their background (the picture's top left colour) so a turned piece doesn't cover its neighbours.

```python
imagePlaneCut(points=[(20, 150, 0), (18, 130, 0)], symmetry="x")
```

## Troubleshooting

**O does nothing.** O works on the active view's overlays. Click in the view first; a message says so when it has none.

**Can't find an overlay to change it.** Every overlay is listed under **Reference Overlays** at the bottom of the Outliner. Click one to get its handles back.

**The overlay vanished after orbiting.** It's bound to a view. Click **Go to View**, or **Bind** again to unbind it.

**A tab shows "Can't read this image".** The file moved. Drop the file on the window with **Shift** held to point the tab at it again.

**A floating window ignores clicks.** It's set to click-through. Use **Windows > Reference Windows Clickable**.

**A cut takes part of the body with the arm, or leaves part of the arm behind.** With only the two joint points, the cut runs on to the picture's edge (dashed) and guesses the limb. Undo, and click around the limb before pressing **Enter**.

**The background around a piece doesn't clear, or the figure's edges do.** Change **keyTolerance** on the pieces in the Attribute Editor, or turn **keyBackground** off for a picture with its own transparency.

**The wrong image plane draws in front.** Raise **drawOrder** on the one that belongs in front (Channel Box). Pieces add their own to the plane they were cut from, so set it on the uncut plane to move the whole figure.

**Cut Image Plane won't start a cut on a plane.** Planes that follow the perspective camera can't be cut. Planes on an orthographic view (front, side, top) become free planes when cut.

**Closed a torn-off window by mistake.** Closing it closes its tabs; **Ctrl+Z** brings them back.

## Options

| Key in the viewport | Does |
| --- | --- |
| **O** hold | Overlays at full strength while held, to compare with the model |
| **O** + left / right / middle drag | Move / scale / rotate (Shift snaps rotation to 15°) |
| **O** + wheel | Opacity |
| **Shift+O** | Handles and toolbar on the overlay; **Esc** leaves, **H** hides or shows it, **Ctrl+D** duplicates it, **Delete** removes it |
| **Alt+O** | Next overlay on its own (front, side, three-quarter) |

| Overlay toolbar | Does |
| --- | --- |
| **Front** / **Behind** | Over the model, or under it |
| **Image** / **Gray** / **Outline** | Outline shows only the photo's edges, so the whole model stays visible |
| **Ghost** | The model see-through while the overlay shows |
| **Park** | Overlays opaque down the right edge, beside the model |
| **Full Image** | Undoes the crop |

The Sculpt panel's **Reference Overlay** section has the same settings for the active view.

In a Reference window, drag a tab out to give it a window of its own, onto another window to move it (**Ctrl** copies), or onto a viewport for an overlay. **Alt**+click picks a paint color from the image. A floating window's **...** menu sets **Window Opacity**, **Stay on Top of Other Apps** and **Click-Through**.

References save with the scene. To share one set across scenes, open **... > Keep Set In** and pick **Project Folder** (`references.lilaref` in the project) or **User Settings**. **Save Set...** and **Load Set...** move a set as a `.lilaref` file, and **Embed in Set** keeps an image inside the set so it works without the file.
