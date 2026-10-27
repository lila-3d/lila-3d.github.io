# Animation

Posing a heavy character, and the stand-ins that keep it fast.

## Anim proxy

An anim proxy is a set of light pieces, each following one joint, shown in place of a character's real meshes while you animate.

1. Select the skinned mesh and run **Rig > Anim Proxy > Anim Proxy Tool**. Planes appear where its joints meet, and the pieces preview in colours.
2. Move, turn or delete planes as in [Split Mesh](essentials.md#split-mesh), or add your own by dragging across the mesh. Planes mirror across the mesh's symmetry plane.
3. Press Enter. Each piece is remeshed, bound to the joint that dominates it, and grouped under `<mesh>_animProxy`. The real mesh hides.
4. Tune the result in the popup that opens: remesh, face count, **Piece Faces** (`0:150 3:80` sets those pieces' counts) and **Exact Pieces** (`1 4` keeps those pieces as the real surface). Each change regenerates the pieces.

Undo after creating gives you the tool back with your planes. Selecting the mesh, its set or a piece and opening the tool again loads the set's planes, and Enter regenerates it.

**Rig > Anim Proxy > Create Anim Proxy** does the same in one go with the suggested planes. **Toggle Proxy/Real** swaps between the pieces and the real meshes; in Puppeteer the Spinner has the same toggle on its settings tab.

Clicking a piece selects its joint. Pieces never export (FBX, glTF, USD, Send to Unreal) and do not bake.

### Your own proxies

Model any mesh, select a proxy set and the mesh, and run **Add Selected to Proxy Set**. It moves under the set and follows its nearest bone (`addToProxySet(joint=...)` picks another). From then on it behaves exactly like a generated piece. **Create Empty Proxy Set** starts a set with no pieces, for a character you proxy entirely by hand.

### The real head for facial animation

Give the head a true piece: `animProxyFromMesh("Body", trueJoints=["head"])`, or set its piece's remesh to `none`. A true piece is the real surface, split but skinned like the real mesh, so face joints deform it. Select the head joint and run **Toggle Real Piece** (right-click the Spinner's proxy button) to show the real head while the body stays proxy; run it again to follow the set.

### Proxies per LOD

Make one set per level and give each a `lodLevel`. The viewport shows the set for the level it draws the character at, and the LOD menu in the panel toolbar forces one. A set at `-1` stands in at any level.

### Troubleshooting

**Two pieces share a colour in the preview.** The plane's disc does not reach round the whole cross-section; scroll over the plane to widen it.

**A piece follows the wrong joint.** It went to the joint that dominates most of its faces. Fix it with `addToProxySet("<set>", "<piece>", joint="<joint>")`, or move the plane.

**A true piece looks bent before you pose.** It was made while the skeleton was off its bind pose and deformers after the skin changed the mesh's points; make it from the bind pose.

### Options

| Option | Default | What it does |
| --- | --- | --- |
| `remesh` | `voxelRemesh` | `none`, `quadRemesh`, `voxelRemesh` or `decimate` for every piece. |
| `resolution` | `32` | Voxel remesh: voxels along a piece's longest side. |
| `targetFaces` | `300` | Quad remesh: faces per piece. |
| `ratio` | `0.25` | Decimate: share of triangles kept. |
| `pieceSettings` | none | Per piece index, e.g. `{"0": {"remesh": "none"}}`. |
| `trueJoints` | none | Joints whose pieces also get a true piece. |
| `lodLevel` | `-1` | The LOD level the set stands in at. |

Puppeteer's preferences page has **Use anim proxy** (on), **Show proxy when Puppeteer turns on** and **Show real mesh when Puppeteer turns off**.
