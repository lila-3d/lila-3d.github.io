# Studio setup

Give every artist the same preferences, shelves, hotkeys and marking menus from a shared folder, and lock the ones they shouldn't change.

## Get it working

1. Make a folder everyone can read, for example `\\server\lila\prefs`. Only the people who manage it need write access.
2. Point Lila at it on every workstation, either way:
   - Set the environment variable `LILA_STUDIO_PREFS=\\server\lila\prefs`, from your launcher or system settings.
   - Or put a `studio.json` next to `lila.exe` in your deployed install: `{"prefs": ["\\\\server\\lila\\prefs"]}`. A relative path is read from the install folder.
3. Put prefs files in the folder. They have the same names and layout as an artist's own prefs in `%APPDATA%/Lila/prefs` (`~/.config/Lila/prefs` on Linux, `~/Library/Application Support/Lila/prefs` on macOS). The easiest start: set things up in your own Lila, then copy the files you want, such as `general.json`, `hotkeys.json` or `shelves/Rigging.json`.
4. Start Lila. The log shows `prefs: studio folder \\server\lila\prefs`, and the values from the folder are in effect.

Any value in the studio folder is a default: an artist who changes it keeps their own value. To stop that, lock it (below).

## Lock settings

List JSON pointers under `"$locked"` in a studio file. Locked keys always take the studio value; artists can't change them, and their rows in **Preferences** are greyed out with "Set by your studio".

```json
{
  "fileDialog": { "allowDelete": false },
  "$locked": ["/fileDialog/allowDelete"]
}
```

- A pointer locks everything under it: `"/fileDialog"` locks every file dialog setting.
- `"/"` locks the whole file.
- A locked key with no value in the studio file falls back to Lila's built-in default.

## Studio shelves

A file in `shelves/` in the studio folder appears as a shelf for everyone. Lock the whole file and it becomes read-only: a lock icon on its tab, no editing, renaming, deleting or dragging buttons in or out.

```json
{
  "items": [
    { "label": "Publish", "tooltip": "Publish the asset", "python": "import studio; studio.publish()" }
  ],
  "$locked": ["/"]
}
```

Unlocked, it's a starting shelf each artist can rearrange as their own.

Hotkeys (`hotkeys.json`), naming rules (`naming.json`) and Lila's marking menus (`markingMenus/<name>.json`) work the same way, since they are prefs files too. Layouts are not.

## Updating

Edit the files in the studio folder. Every running Lila picks up the change within about 5 seconds, including new or removed shelves; no restart needed.

## Troubleshooting

**Nothing from the studio folder applies.** Check the log for the `prefs: studio folder` line. No line means Lila didn't see `LILA_STUDIO_PREFS` (it must be set before Lila starts) or a `studio.json` beside the `lila.exe` that ran.

**A file is ignored.** It isn't valid JSON; the log says `is not a valid JSON object`. A running Lila keeps the last good version it read.

**An artist is off the network.** Lila keeps a copy of each studio file in `%APPDATA%/Lila/studioCache` and uses it while the folder can't be reached, so locks still hold. It catches up when the folder is back.

**A setting won't change in Preferences.** It's locked by the studio. Take it out of `"$locked"` to let artists change it.

## Options

| Option | What it does |
| --- | --- |
| `LILA_STUDIO_PREFS` | One or more folders, separated by `;` on Windows and `:` on Linux and macOS. The first wins, so list the most specific first: `\\server\lila\shows\nova;\\server\lila\prefs`. Overrides `studio.json`. |
| `studio.json` `"prefs"` | The same list, for installs where setting environment variables is awkward. |
| `"$locked"` | Per file: the keys artists can't change. |

Settings resolve in this order, later winning: Lila's built-in defaults, studio folders, the artist's own prefs, the project's `.lila` folder. Locked keys skip the last two.

### File dialog settings worth locking

| Key in `general.json` | Default | What it does |
| --- | --- | --- |
| `/fileDialog/allowEdit` | `true` | Rename and new folder. |
| `/fileDialog/allowMove` | `true` | Cut, copy, paste and drag-and-drop. |
| `/fileDialog/allowDelete` | `true` | Delete. Files under source control are marked for delete; others go to the Recycle Bin or Trash, never deleted outright. |
| `/fileDialog/native` | `false` | Use the system's file dialog instead of Lila's. |
