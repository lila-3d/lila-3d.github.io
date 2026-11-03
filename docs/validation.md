# Validation

Show your pipeline's info, warnings and errors on the objects, components and attributes they're about. The outliner badges the rows, the Attribute Editor marks the exact field, and **File > Validation** lists everything.

> Available for Python (`reportIssue` and friends), MCP and C++ (`#include <lila/Diagnostics.h>`, `lila::scene::diagnostics`).

## Get it working

1. Select an object and run in the script editor:

```python
reportIssue("crate", m="No collision mesh", severity="error", blocks=["exportFbx"])
reportIssue("crate.translate", m="Off the grid")
reportIssue("/World/crate.health:max", m="Max health must be above 0", severity="error",
            fix="setAttr('crate.health:max', 100)")
```

2. The row gets a badge; hover it for every issue on the object. Select it, and the Attribute Editor lists them at the top and badges the attributes.

3. Make it a validator so it runs again on demand and replaces its old results:

```python
from lila import extension

def check_crates():
    for name in ls(type="transform"):
        if name.startswith("crate") and getAttr(name + ".scaleX") != 1:
            reportIssue(name + ".scale", m="Crates stay at scale 1")

extension.register_command("checkCrates", check_crates, "Crate rules.", undoable=False)
addValidator("crates", command="checkCrates", doc="Crate rules")
validate()   # or File > Validate Scene, or Validate in the panel
```

### Targets

`<object>[.<component>[:<attribute>]]`

| Target | Lands on |
|---|---|
| `crate`, `\|props\|crate`, `/World/crate` | The object. Prim paths resolve through live USD stages. |
| `crate.translate`, `/World/crate.health:max` | That attribute, when the object has one by that name. |
| `crate.transform` | A component: a node type, an attribute category, an Attribute Editor section or an attribute namespace (`health` for `health:*`). |
| `crate.healthcomponent:health` | `healthcomponent:health` if the object has it, else `health` within that component. |
| *(none)* | The scene as a whole. Shown only in the panel. |

## Troubleshoot

**An issue shows in the panel, greyed, but on no row.** Its object doesn't exist yet. It attaches when a node by that path appears (a USD stage loading, for example).

**A command fails with "is blocked by".** An issue lists that command in `blocks`. Fix it, or clear it with `clearIssues(id=...)`.

**An Unreal send fails with "blocked by validation".** `unrealPlaceInstances`, `unrealSync` and `unrealSendCurve` run every validator first and stop on an issue on what they send whose `blocks` lists `unreal`, `*` or the command. Other issues on it come back in the result's `issues` (placements) or the log.

**Issues are gone after reopening the scene.** They're never saved. Run your validators again.

**Info has no badge in the outliner.** It's off by default: turn on **Preferences > Interface > Issues > Badge info in the outliner**.

## Tune it

| Call | What it does |
|---|---|
| `reportIssue(target, m=, severity=, source=, blocks=, fix=)` | `severity`: `info`, `warning` (default) or `error`. `blocks`: commands refused while it stands. `fix`: Python run by **Fix**. |
| `clearIssues(objects, source=, severity=, id=)` | Removes matching issues; everything when nothing narrows it. |
| `listIssues(objects, source=, severity=, blocking=, hierarchy=)` | Issues as dicts; `severity` keeps that and worse. |
| `validate(names)`, `validate(list=True)` | Runs validators, all when none are named. |
| `addValidator(name, command=, doc=)`, `removeValidator(names)` | A validator's issues are cleared each time it runs, and when it's removed. |
| `fixIssue(ids)` | Runs fixes, then that issue's validator again. |

**Preferences > Interface > Issues** has two settings: **Badge info in the outliner** (`/issues/badgeInfo`, off by default) and **Color outliner names by their issues** (`/issues/tintRows`: `off`, `error`, `warning` or `info`). A studio can enforce either for everyone in its studio `general.json` (see [Studio setup](studio-setup.md)):

```json
{
  "issues": { "badgeInfo": true, "tintRows": "warning" },
  "$locked": ["/issues"]
}
```

The badge colors are the **Issue info**, **Issue warning** and **Issue error** theme colors.
