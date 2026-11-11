# Support

How to get help with Lila, report bugs and request features.

> Lila is free and made by one person. There's no help desk and no guarantee of a reply.

## Get help

1. Check the [FAQ](faq.md), [System requirements](requirements.md) and the page for the tool you're using.
2. Ask in the [Lila discussions on Steam](https://steamcommunity.com/app/5520720/discussions/). Other users can often answer faster than I can.

## Report a bug

**Help > Report a Bug** sends it to the [Lila issue tracker](https://github.com/lila-3d/issues), and **Help > Request a Feature** sends a feature request the same way. You don't need a GitHub account.

1. Pick a **Type**: Bug, Crash, Performance, Feature Request or Question. Each asks its own questions.
2. Answer them. If you know the **Steps to reproduce**, the shortest steps that make it happen every time are the most useful thing you can send.
3. Leave **Attach support bundle** on for bugs, crashes and performance. It holds your Lila version, system and GPU, this session's log, your last crash reports and your preferences (tokens and passwords removed). Tick **Include the open scene** if it only happens in one file and you can share it.
4. Click **Send**.

The title and answers are public. The support bundle, screenshot and attached file are private: only I can open them.

Replies show in **Help > My Reports**, and Lila tells you when a new one arrives. If I ask for more, the report shows **Needs Info**: type your answer under the replies and click **Send Reply**. Like the report, it's public; an attached file stays private. Fill in **GitHub user** if you'd also like GitHub to notify you.

**If Lila crashed**, click **Report Crash...** in the window Lila shows when it starts again. The report opens as a Crash with that crash's report attached.

**Already on GitHub?** You can [open an issue there](https://github.com/lila-3d/issues/issues/new/choose) instead. Anything attached there is public, so leave the support bundle out and use **Help > Report a Bug** when you need to send one.

## Report a slow viewport

1. Open the scene where it's slow, then **Help > Report a Bug** and set **Type** to **Performance**.
2. Click **Record Trace...**, then **Record**, and do the slow thing (orbit, select, scrub) until it stops. 10 seconds is plenty. The trace attaches to the report by itself.
3. Fill in the rest and click **Send**.

For more detail, click **Restart as Administrator** in the recorder first. Lila reopens with your report as you left it. Windows only lets Lila sample where its time goes, including inside the graphics driver, while it runs as administrator. It changes nothing else, and the recording works without it. Open Lila normally again afterwards.

The trace holds timings, Lila's function names, your system and GPU and this session's log. It holds no scene data.

## Troubleshooting

**Lila won't start, or the viewport is black.** Usually the GPU driver. See [System requirements](requirements.md).

**Lila crashed and I had unsaved work.** Start Lila again. It offers to restore what it recovered.

**Lila crashes on startup after an update or a prefs change.** Close Lila, open `%APPDATA%\Lila`, and rename the `prefs` folder to `prefs-old`. Lila starts with default preferences. If that fixes it, mention it in your bug report and zip the old folder into **Attach File...**.

**Report a Bug says a file or the support bundle is over 25 MB.** Untick **Include the open scene** if it's ticked. For a file that has to be bigger, send the report without it and email the file to lila3d.app@gmail.com with the report number.

**Report a Bug says it can't reach the report service.** Check your connection and click **Send** again; the dialog keeps what you typed. If it keeps failing, save a support bundle and try later.

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
