# Attributes and arrays

Attributes can be added to any node, and an attribute can be an array: any number of elements, `node.attr[0]`, `node.attr[1]` and so on. A grouped array gives each element several children, `node.targets[2].weight`.

## Add attributes from Python

```python
addAttr("Crate", longName="mass", defaultValue=20, keyable=True)        # Crate.mass
addAttr("Crate", longName="tags", dataType="stringArray")
addAttr("Crate", longName="samples", dataType="doubleArray")
addAttr("Crate", longName="mode", attributeType="enum", enumName="off:soft:hard")

setAttr("Crate.tags", ["metal", "heavy"])    # the whole array: elements 0..n-1
setAttr("Crate.samples[4]", 1.5)              # one element
getAttr("Crate.samples")                      # [1.5]: values in index order
getAttr("Crate.samples", multiIndices=True)   # [4]
removeMultiInstance("Crate.samples[4]")
deleteAttr("Crate.mode")
```

`lila.nodes` does the same: `Node("Crate").add_attr("mass", "float", default_value=20)`, `delete_attr`, `user_attrs()`, `is_array_attr(name)`.

- `attributeType`: `bool`, `long`, `float`, `double`, `double3`, `enum`, `matrix`; `multi=True` makes it an array.
- `dataType`: `string`, `stringArray`, `doubleArray`, `Int32Array`, `vectorArray`.
- Added attributes show under **Extra Attributes** in the attribute editor, keyable ones in the channel box. They save with the scene and come along on duplicate.

## Arrays

```python
mesh, op = loft(*rings)
connectAttr(circle(radius=8, name="Ring") + ".worldSpace", op + ".sections")  # appends: returns 'CurveLoft.sections[20]'
connectAttr("Ring.worldSpace", op + ".sections[3]", force=True)              # element 3
disconnectAttr(op + ".sections")                                             # every element
```

- Connecting to the whole array adds an element after the last one.
- Arrays that hold values (`samples` above, constraint weights) keep an element when its connection goes. Input-only arrays (loft `sections`, wrap `drivers`) drop it, so deleting a section curve removes that section.
- Elements keep their indices: removing `[5]` leaves `[6]` as `[6]`.

Grouped arrays in Lila: constraint `targets` (`matrix`, `weight`, `offset`), space switch `spaces` (`target`, `offset`), wrap `drivers` (`mesh`, `matrix`), collision `colliders` and `capsules`. `removeMultiInstance("pointConstraint1.targets[2]")` removes every child at index 2.

## C++

```cpp
// An input-only array, and a grouped array: children are named "group.child".
t.ownAttrs.push_back({.name = "sections", .type = PlugType::Data, .defaultValue = DataPtr(), .flags = AttrInput | AttrHidden | AttrArray});
t.ownAttrs.push_back({.name = "targets.matrix", .type = PlugType::Matrix, .defaultValue = glm::dmat4(1.0), .flags = AttrInput | AttrArray});
t.ownAttrs.push_back({.name = "targets.weight", .type = PlugType::Float, .defaultValue = 1.0,
                      .flags = AttrInput | AttrStorable | AttrKeyable | AttrArray});

// In compute(): elements are (index, value), ascending.
for (const auto& [i, m] : elements(kTargetMatrix))
    use(std::get<glm::dmat4>(m), elementOr<double>(kTargetWeight, i));

g.connect({src, attr}, {node, sectionsAttr});                  // appends; returns the element plug
g.setValue({node, kTargetWeight, -1, 7}, 0.5);                 // element 7
g.elements({node, attr});                                      // element plugs, ascending
g.groupIndices(node, "targets");                               // indices any child uses
g.addAttr(node, def);  g.deleteAttr({node, attr});
```

## Troubleshooting

**"is an array input and takes connections, not values".** The array has no `AttrStorable`: connect to it.

**"is an array: set one element".** `setValue` was given the whole array. Set an element, or every element with `setAttr(plug, [...])` / `Graph::setElements`.

**"belongs to the node's type".** Only attributes added with `addAttr` can be deleted.

**A node type that replaced numbered attributes.** Set `fileAlias` on the array, `#` standing for the number: `"target#Weight"` loads `target0Weight`, `target1Weight` ... as elements 0, 1 ..., in scene files and in scripts. List attributes that no longer mean anything in `retiredAttrs` so loading skips them quietly.
