# Attributes and arrays

Add, edit and organise attributes and components on any node. Attributes can be added to any node, and an attribute can be an array: any number of elements, `node.attr[0]`, `node.attr[1]` and so on. A grouped array gives each element several children, `node.targets[2].weight`.

## In the Attribute Editor

1. Select an object and click **+** next to the search field.
2. Type a name (`health:max`) and press Enter: pick the type, default, range and heading, then Enter again. Or pick a component, or an object under **Copy from** to copy its added attributes.
3. The attribute appears under its heading in **Extra Attributes**.

- **Edit**: double-click the label, or hover the row and click the pencil. Renaming keeps connections, keys and drivers; changing the type converts the value and drops its connections.
- **Move**: drag a row's grip onto another row to put it before that one, or onto a heading to move it there. Drag a heading onto another to reorder components.
- **Search**: the field at the top matches nice, long and short names and docs; sections with no match hide.
- **Right-click a heading** to save it as a component (yours, or the studio library), choose how it goes to Unreal, or remove it.

```python
renameAttr("Crate.mass", "weight")
editAttr("Crate.weight", minValue=0, maxValue=False, niceName="Weight (kg)", category="Physics")
reorderAttr("Crate.weight", before="tags")
copyAttr("Crate", "Barrel", category="Physics", connections=True)
saveComponent("Crate", category="Physics")      # appears under + > Components
addComponent("Barrel", name="Physics")
```

`maxValue=False` removes a limit. `editAttr(plug, query=True)` returns every setting.

## Components

A component is the added attributes under one heading. Saved ones are `.lilacomponent` files in your prefs folder (`components/`) or the studio's. USD API schemas Lila knows are offered too: adding one lists it in `usdApiSchemas`, so USD export applies the schema.

How a component reaches Unreal through LilaLink is per object and component:

| Mode | In Unreal |
| --- | --- |
| Asset User Data (default) | A `LilaComponentUserData` on the mesh or actor, values by name |
| Actor Tags | Tags `Component.attr=value` |
| Actor Component | A component of the class you name, properties set by matching names |
| Data Asset | A data asset of the class you name, referenced from the user data |
| Custom Exporter | Your C++ `ILilaComponentExporter` or a Python function registered under that name |
| Don't Export | Nothing |

```python
componentExport("Crate", component="Physics", mode="component", unrealClass="/Script/MyGame.PhysicsTuning")
```

LilaLink ships examples of each: `ULilaExampleHealthComponent`, `ULilaExampleComponentData`, a C++ exporter and `lila_example_exporter.py` (import it from your project's `init_unreal.py`).

## Edit several objects

With several objects selected, a Channel Box edit changes every selected object that has the channel, unless its **Edit all selected** setting is off. An Attribute Editor edit changes only the lead object (the one last selected, or the one you click in the header chips). Hold **Alt** while editing to change every selected object that has the attribute. While Alt is held the header shows **Editing 3 objects**, fields that differ show `--`, and each changed field gets a count. Turn off the reminder strip with its **Turn off this hint** link.

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

- `attributeType`: `bool`, `long`, `float`, `double`, `double3`, `enum`, `matrix`, `compound`; `multi=True` makes it an array.
- `dataType`: `string`, `stringArray`, `doubleArray`, `Int32Array`, `vectorArray`.
- Added attributes show under **Extra Attributes** in the attribute editor, keyable ones in the channel box. They save with the scene and duplicate with the node.

## Compounds

```python
addAttr("Rig", longName="targets", attributeType="compound", multi=True)
addAttr("Rig", longName="weight", defaultValue=1, parent="targets")
addAttr("Rig", longName="label", dataType="string", parent="targets")
setAttr("Rig.targets[2].weight", 0.25)

addAttr("Rig", longName="settings", attributeType="compound")       # not multi: Rig.settings.speed
addAttr("Rig", longName="speed", defaultValue=3, parent="settings")
deleteAttr("Rig.settings")                                           # and its children
```

- A compound exists once its first child is added.
- Compounds nest one level: a compound can't be a child.
- A multi compound's children hold one value per element, so `doubleArray` and other arrays can't be its children. A plain compound can hold them.

## Arrays

```python
mesh, op = loft(*rings)
connectAttr(circle(radius=8, name="Ring") + ".worldSpace", op + ".sections")  # appends: returns 'CurveLoft.sections[20]'
connectAttr("Ring.worldSpace", op + ".sections[3]", force=True)               # element 3
disconnectAttr(op + ".sections")                                              # every element
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

**"has no compound".** Add the compound with `attributeType="compound"` before its children.

**"belongs to the node's type".** Only attributes added with `addAttr` can be edited, renamed, moved or deleted.

**An edit changed only one object.** Several objects are selected: hold Alt to edit all of them.

**Unreal reports names that don't match.** For Actor Component and Data Asset, attribute names must match the class's property names (case blind; `health:max` also matches `max`).

**A node type that replaced numbered attributes.** Set `fileAlias` on the array, `#` standing for the number: `"target#Weight"` loads `target0Weight`, `target1Weight` ... as elements 0, 1 ..., in scene files and in scripts. List attributes that no longer mean anything in `retiredAttrs` so loading skips them quietly.
