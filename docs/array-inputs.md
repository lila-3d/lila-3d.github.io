# Array inputs

An array input takes any number of connections, one per element: `CurveLoft.sections[0]`, `CurveLoft.sections[1]` and so on. The node reads its elements in index order. Loft sections, curve network curves, border blend profiles, the planar curve tools' `inCurves` and contour's `inMeshes` are arrays.

## Use them from Python

```python
rings = [circle(radius=10, center=(0, y, 0)) for y in range(0, 200, 10)]
mesh, op = loft(*rings)

connectAttr(circle(radius=8, center=(0, 200, 0), name="Ring") + ".worldSpace", op + ".sections")  # appends: returns 'CurveLoft.sections[20]'
connectAttr("Ring.worldSpace", op + ".sections[3]", force=True)  # replaces element 3
disconnectAttr(op + ".sections[5]")                                # removes element 5; the others keep their indices
disconnectAttr(op + ".sections")                                   # removes every element
getAttr(op + ".sections")                                          # every element's value, in index order
```

- Connecting to the whole plug (`op.sections`) adds an element after the last one.
- Deleting an object connected to an element removes that element.
- `lila.nodes.Node.is_array_attr("sections")` tells an array from an ordinary attribute.

## Use them from C++

Declare the attribute with `AttrArray`. Arrays are inputs only; they hold connections, not set values.

```cpp
t.ownAttrs.push_back({.name = "sections", .type = PlugType::Data, .defaultValue = DataPtr(),
                      .flags = AttrInput | AttrHidden | AttrArray, .doc = "Section curves, in element order."});
```

Read the elements in `compute()`. Each is an `(index, value)` pair, in ascending index order:

```cpp
for (const auto& [index, value] : elements(attrIndex))
    use(std::get<DataPtr>(value));
```

Connect with `Graph::connect`. A destination with `element = -1` appends; give an index to place it. `connect` returns the plug it connected:

```cpp
PlugRef at = g.connect({curve, CurveShape::kWorldSpace}, {op, sectionsAttr});      // next free element
g.connect({other, CurveShape::kWorldSpace}, {op, sectionsAttr, -1, 7});             // element 7
std::vector<PlugRef> connected = g.elements({op, sectionsAttr});                  // ascending
```

Two arrays can run in parallel, matched by index: contour's `meshMatrices[k]` places `inMeshes[k]`.

## Troubleshooting

**"is an array input and takes connections, not values".** `setAttr` was called on an array. Connect to it instead.

**"is not an array".** A plug name used `[n]` on an ordinary attribute.

**Scenes saved before a node used an array.** Set the array's `fileAlias` to the old numbered attributes' prefix: `.fileAlias = "section"` loads `section0`, `section1` ... as elements 0, 1 ...
