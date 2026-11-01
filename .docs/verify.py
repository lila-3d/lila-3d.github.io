"""Checks that the commands, Python names and menu paths a Lila doc mentions exist in the Lila source.

Usage: python .docs/verify.py <file.md>...   (LILA_SRC overrides the source checkout, default ../Lila)
Run by the doc skill's `verify`. Prints `file:line: missing <kind> <value>` and a summary; exit 1 on misses.
"""
import ast
import builtins
import os
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = pathlib.Path(os.environ.get("LILA_SRC", ROOT.parent / "Lila"))
SKILL_SCRIPTS = pathlib.Path(os.environ.get("DOCS_SKILL_SCRIPTS", pathlib.Path.home() / ".claude/skills/doc/scripts"))
sys.path.insert(0, str(SKILL_SCRIPTS))
from refs import extract  # noqa: E402

MODULES = {"ops", "nodes", "math", "ui", "prefs", "extension", "tasks", "events", "stream", "debug_draw", "dd", "bake", "batch", "texture", "usd", "viewport", "scene_data", "docs"}


def python_names() -> dict[str, set[str]]:
    """Top-level names per lila module, from the stubs and sources in python/lila."""
    names: dict[str, set[str]] = {}
    # Functions bound in C++ reach a module through `from _lila.x import *`, which the AST can't see.
    native: set[str] = set()
    for f in (SRC / "src").rglob("*.cpp"):
        native.update(re.findall(r'\.def(?:_static|_prop_rw|_prop_ro|_rw|_ro)?\(\s*"(\w+)"', f.read_text(encoding="utf-8", errors="replace")))
    for f in (SRC / "python" / "lila").glob("*.py*"):
        if f.suffix not in (".py", ".pyi"):
            continue
        mod = f.stem
        try:
            tree = ast.parse(f.read_text(encoding="utf-8", errors="replace"))
        except SyntaxError:
            continue
        s = names.setdefault(mod, set())
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                s.add(node.name)
            elif isinstance(node, ast.Assign):
                s.update(t.id for t in node.targets if isinstance(t, ast.Name))
            elif isinstance(node, (ast.ImportFrom, ast.Import)):
                s.update((a.asname or a.name).split(".")[0] for a in node.names)
                if isinstance(node, ast.ImportFrom) and (node.module or "").startswith("_lila") and any(a.name == "*" for a in node.names):
                    s.update(native)
    names["dd"] = names.get("debug_draw", set())
    return names


TOKEN = re.compile(
    r"//[^\n]*|/\*.*?\*/|^[ \t]*#[^\n]*"
    r'|\bR"(?P<delim>[^(\s"]{0,16})\((?P<raw>.*?)\)(?P=delim)"'
    r"|'(?:\\.|[^'\\\n]){1,8}'"
    r'|"(?P<str>(?:\\.|[^"\\\n])*)"',
    re.S | re.M,
)


def string_literals(text: str) -> list[str]:
    """Double-quoted literals in C++ or Python source, skipping comments, char literals and raw strings' delimiters."""
    out = []
    for m in TOKEN.finditer(text):
        if m.group("raw") is not None:
            out.append(m.group("raw"))
        elif m.group("str") is not None:
            out.append(m.group("str"))
    return out


def ui_strings() -> set[str]:
    """Every short string literal in the C++ and Python sources, lowercased: menu, action and preference labels."""
    out: set[str] = set()
    for d in ("src", "extensions", "python"):
        for f in (SRC / d).rglob("*"):
            if f.suffix not in (".cpp", ".h", ".py", ".json") or "build" in f.parts:
                continue
            for lit in string_literals(f.read_text(encoding="utf-8", errors="replace")):
                if len(lit) <= 100:
                    out.add(lit.lower())
                    out.update(p.strip().lower() for p in lit.split("/"))
                    # A label with a clarifying tail, "Badge info in the outliner (warnings ...)", is named without it.
                    out.add(re.sub(r"\s*\(.*\)$", "", lit).lower())
    return out


def label_exists(label: str, strings: set[str]) -> bool:
    """A label in the source, or one composed at runtime from a literal ending in a space plus another literal ("Send to Unreal as " + kind)."""
    return label in strings or any(label.startswith(s) and label[len(s):] in strings for s in strings if s.endswith(" ") and len(s) < len(label))


def command_names() -> set[str]:
    """Commands registered in C++ (`.name = "..."` on a command) so extension commands count before stubs regenerate."""
    out: set[str] = set()
    for d in ("src", "extensions"):
        for f in (SRC / d).rglob("*.cpp"):
            out.update(re.findall(r'\.name\s*=\s*"([A-Za-z_]\w*)"', f.read_text(encoding="utf-8", errors="replace")))
    return out


def main() -> int:
    if not (SRC / "python" / "lila" / "ops.pyi").exists():
        print(f"Lila source not found at {SRC}; set LILA_SRC")
        return 2
    names = python_names()
    names.setdefault("ops", set()).update(command_names())
    every = set().union(*names.values())
    strings = ui_strings()
    misses = checked = 0
    for a in sys.argv[1:]:
        text = pathlib.Path(a).read_text(encoding="utf-8", errors="replace")
        # Names the page defines itself, and stdlib modules it imports that shadow a lila module name (math).
        local = set(re.findall(r"\bdef\s+(\w+)|\b(\w+)\s*=", text))
        local = {x for pair in local for x in pair if x}
        stdlib = set(re.findall(r"^\s*import\s+(\w+)\s*$", text, re.M))
        lines = text.splitlines()
        for r in extract(pathlib.Path(a)):
            kind, value = r["kind"], r["value"]
            cpp_line = "::" in lines[r["line"] - 1]
            miss = None
            if kind in ("call", "block-call") and (kind == "call" or r.get("lang") in ("python", "py", "")):
                head, _, rest = value.partition(".")
                if value.startswith("lila."):
                    head, _, rest = value[5:].partition(".")
                if rest and head in MODULES and head not in stdlib:
                    checked += 1
                    if rest.split(".")[0] not in names.get(head, set()):
                        miss = f"{head}.{rest}"
                # A bare inline name is only checked when it reads like a Lila command (lowerCamelCase, not on a C++ line).
                elif not rest and kind == "call" and re.fullmatch(r"[a-z]+[A-Z]\w*", head) and head not in local and head not in dir(builtins) and not cpp_line:
                    checked += 1
                    if head not in every:
                        miss = head
            elif kind == "menu":
                checked += 1
                gone = [p for p in r["parts"] if not label_exists(p.lower().rstrip(".…"), strings)]
                if gone:
                    miss = f"{value} (no '{gone[0]}' in the source)"
            if miss:
                misses += 1
                print(f"{a}:{r['line']}: missing {kind} {miss}")
    print(f"verify: {checked} references checked, {misses} missing")
    return 1 if misses else 0


if __name__ == "__main__":
    sys.exit(main())
