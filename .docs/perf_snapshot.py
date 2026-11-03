"""Snapshots of docs/performance.md, kept so past results stay readable after the page moves on.

Take one after a major performance push, once performance.md shows the new numbers:

    python .docs/perf_snapshot.py add 2026-10-27 "First comparison with Maya" path/to/results.json

That freezes the page as docs/performance/<date>.md (with the snapshot bar pinned on top), keeps the results JSON
beside it, lists it in docs/performance/snapshots.json and rewrites the History section of performance.md.

    python .docs/perf_snapshot.py history

rewrites only the History section, after editing snapshots.json by hand.
"""

import json
import re
import shutil
import sys
from datetime import date
from pathlib import Path

DOCS = Path(__file__).resolve().parent.parent / "docs"
PAGE = DOCS / "performance.md"
DIR = DOCS / "performance"
INDEX = DIR / "snapshots.json"
START, END = "<!-- history:start -->", "<!-- history:end -->"
ANCHOR = "## How it was measured"


def long_date(iso):
    d = date.fromisoformat(iso)
    return f"{d.day} {d.strftime('%B %Y')}"


def load_index():
    return json.loads(INDEX.read_text(encoding="utf-8")) if INDEX.exists() else []


def without_history(text):
    return re.sub(re.escape(START) + r".*?" + re.escape(END) + r"\n*", "", text, flags=re.S)


def measured_on(text):
    """The rows of the page's "Measured on" table, by their first cell."""
    rows = {}
    for line in text.splitlines():
        m = re.match(r"\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$", line)
        if m and m.group(1) not in ("", "---"):
            rows[m.group(1)] = re.sub(r"\s*\(.*?\)", "", m.group(2))
    return rows


def bar(entry, versions):
    apps = " · ".join(f"{name} {versions[name]}" if name in versions else name for name in entry["versions"])
    return (
        f'<div class="snapshot-bar"><strong>Snapshot of {long_date(entry["date"])}</strong>'
        f"<span>{apps}. These numbers hold for those versions only.</span>"
        f'<a href="#/performance">Latest results</a></div>'
    )


def fmt(v, unit):
    if v is None or isinstance(v, str):
        return "—" if v is None else v
    if unit == "s" and v < 1e-3:
        return f"{v * 1e6:.0f} µs"
    digits = 3 if v < 1 else 2 if v < 10 else 1 if v < 100 else 0
    return f"{v:.{digits}f} {unit}"


def over_time(index):
    """Lila's number for each task across the snapshots, for the tasks measured in more than one."""
    results = [(e, json.loads((DIR / f"{e['date']}.json").read_text(encoding="utf-8"))) for e in index]
    rows = {}
    for entry, res in results:
        if "Lila" not in res["apps"]:
            continue
        lila = res["apps"].index("Lila")
        for table in res["tables"]:
            for row in table["rows"]:
                key = (table["title"], row["task"])
                rows.setdefault(key, {"unit": table["unit"], "values": {}})["values"][entry["date"]] = row["values"][lila]
    shown = [(k, r) for k, r in rows.items() if sum(isinstance(v, (int, float)) for v in r["values"].values()) > 1]
    if not shown:
        return []
    dates = [e["date"] for e in index]
    lines = ["### Lila over time", "", "| Task | " + " | ".join(long_date(d) for d in dates) + " |", "|---" * (len(dates) + 1) + "|"]
    for (title, task), r in shown:
        lines.append(f"| {task} | " + " | ".join(fmt(r["values"].get(d), r["unit"]) for d in dates) + " |")
    return lines + [""]


def history(index):
    lines = [START, "## History", "", "Snapshots of this page from major performance pushes, each kept as it was measured.", ""]
    lines += ["| Date | Push | Compared with | |", "|---|---|---|---|"]
    for e in reversed(index):
        others = ", ".join(a for a in e["apps"] if a != "Lila") or "—"
        lines.append(f"| {long_date(e['date'])} | {e['label']} | {others} | [Snapshot](performance/{e['date']}.md) |")
    lines.append("")
    lines += over_time(index)
    return "\n".join(lines + [END, ""])


def ending(path):
    """The file's own line ending, so a rewrite doesn't turn every line into a diff."""
    return "\r\n" if b"\r\n" in path.read_bytes() else "\n"


def write_history(index):
    text = without_history(PAGE.read_text(encoding="utf-8"))
    if ANCHOR not in text:
        sys.exit(f"performance.md has no '{ANCHOR}' heading to put the History section before")
    text = text.replace(ANCHOR, history(index) + "\n" + ANCHOR, 1)
    PAGE.write_text(text, encoding="utf-8", newline=ending(PAGE))


def add(day, label, results):
    date.fromisoformat(day)
    res = json.loads(Path(results).read_text(encoding="utf-8"))
    text = without_history(PAGE.read_text(encoding="utf-8"))
    versions = measured_on(text)
    # The versions as the page names them: "Maya 2026.3" in the results is "Maya" in the Measured on table.
    names = [a.split(" ")[0] for a in res["apps"]]
    entry = {"date": day, "label": label, "versions": names, "apps": res["apps"]}
    DIR.mkdir(exist_ok=True)
    shutil.copyfile(results, DIR / f"{day}.json")
    # Docsify resolves a page's images against its own folder, one level below the live page.
    text = re.sub(r"\]\((images/[^)]+)\)", r"](../\1)", text)
    lines = text.split("\n")
    title = next(i for i, l in enumerate(lines) if l.startswith("# "))
    lines[title + 1 : title + 1] = ["", bar(entry, versions)]
    (DIR / f"{day}.md").write_text("\n".join(lines), encoding="utf-8", newline=ending(PAGE))
    index = [e for e in load_index() if e["date"] != day] + [entry]
    index.sort(key=lambda e: e["date"])
    INDEX.write_text(json.dumps(index, indent=2) + "\n", encoding="utf-8", newline="\n")
    write_history(index)


if __name__ == "__main__":
    if len(sys.argv) == 5 and sys.argv[1] == "add":
        add(*sys.argv[2:])
    elif sys.argv[1:] == ["history"]:
        write_history(load_index())
    else:
        sys.exit(__doc__)
