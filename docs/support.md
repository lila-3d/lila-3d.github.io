# Support

How to get help with Lila and report bugs.

> Lila is free and made by one person. There's no help desk and no guarantee of a reply.

## Get help

1. Check the [FAQ](faq.md), [System requirements](requirements.md) and the page for the tool you're using.
2. Ask in the [Lila discussions on Steam](https://steamcommunity.com/app/5520720/discussions/). Other users can often answer faster than I can.

## Report a bug

Post it in the **Bug Reports** forum of the [Steam discussions](https://steamcommunity.com/app/5520720/discussions/). Include:

- What you did, what you expected, and what happened instead. Steps that reproduce it every time are the most useful thing you can send.
- A support bundle: **Help > Save Support Bundle** saves one zip with your Lila version, system and GPU, this session's log, your last crash reports and your preferences (tokens and passwords removed). Attach it to your post.
- A screenshot or short video if it's visual.
- The scene, if it only happens in one file and you're able to share it.

**If Lila crashed**, the support bundle already holds the crash report. To paste one into your post instead, click **Copy Crash Report** in the crash dialog, or **Help > Copy Last Crash Report** if you closed it.

## Report a slow viewport

1. Open the scene where it's slow, then **Help > Record Performance Trace**.
2. Click **Record** and do the slow thing (orbit, select, scrub) until it stops. 10 seconds is plenty.
3. Attach the zip it saves to your bug report, with a line on what you were doing.

For more detail, click **Restart as Administrator** in the same window first. Windows only lets Lila sample where its time goes, including inside the graphics driver, while it runs as administrator. It changes nothing else, and the recording works without it. Open Lila normally again afterwards.

The trace holds timings, Lila's function names, your system and GPU and this session's log. It holds no scene data.

## Troubleshooting

**Lila won't start, or the viewport is black.** Usually the GPU driver. See [System requirements](requirements.md).

**Lila crashed and I had unsaved work.** Start Lila again. It offers to restore what it recovered.

**Lila crashes on startup after an update or a prefs change.** Close Lila, open `%APPDATA%\Lila`, and rename the `prefs` folder to `prefs-old`. Lila starts with default preferences. If that fixes it, mention it in your bug report and attach the old folder.

**Steam says "No internet connection" when installing.** Steam has signed you out without saying so. Sign out of Steam and back in, then install again.

## Where Lila keeps its files

Everything lives under `%APPDATA%\Lila`. **Help > Open Prefs Folder** and **Help > Open Crash Reports Folder** open them.

| Folder | What's in it |
| --- | --- |
| `prefs` | Preferences, hotkeys, marking menus, shelves and layouts. |
| `crashes` | One folder per crash: `report.txt` and `minidump.dmp`. |
| `perf-traces` | Performance traces, one zip per recording. |
| `autosave` | Autosaves. |
| `recovered` | Work recovered after a crash. |
| `extensions` | Extensions you've installed. |
