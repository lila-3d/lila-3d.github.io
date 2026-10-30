"""Fails when a page in docs/_sidebar.md has no icon in docs/theme.css (its ::before selector and its --icon line)."""
import pathlib
import re
import sys

docs = pathlib.Path(__file__).resolve().parent.parent / "docs"
sidebar = (docs / "_sidebar.md").read_text(encoding="utf-8")
css = (docs / "theme.css").read_text(encoding="utf-8")
pages = sorted(set(re.findall(r"\]\(([a-z0-9-]+)\.md\)", sidebar)))
missing = [p for p in pages if f'a[href="#/{p}"]::before' not in css or not re.search(rf'a\[href="#/{re.escape(p)}"\] \{{ --icon', css)]
if missing:
    print("docs/theme.css has no sidebar icon for: " + ", ".join(missing))
    print('Add a[href="#/<page>"]::before to the icon selector list and an --icon line beside the others.')
    sys.exit(1)
