# Telemetry and privacy

What Lila sends when you opt in, and how to turn it off.

Usage statistics and crash reports are separate checkboxes, shown when Lila first starts and in **Help > Telemetry and Privacy** or **Preferences > General > Telemetry**. Usage statistics start ticked in that first dialog, so untick them there if you'd rather not send them. Crash reports start off. Click **What's Sent...** there to see the exact data queued on your machine.

## What it's used for

Lila is free and made by one developer. Telemetry is how I find out what to work on next:

- Which tools get used, so they get the polish, and which don't, so I can find out why.
- Where Lila crashes, on which GPUs and versions, so the worst crashes get fixed first.
- Whether people keep using Lila after the first week, and whether a release made that better or worse.
- How many people come from Maya, Blender or elsewhere, and how many work in studios, so Lila's workflows and pipeline features fit the people actually using it.
- How many people use the Unreal link and which Unreal versions to support.

It's never sold, never used for advertising, and never shared except as totals, such as "40% of users came from Maya". If Lila is ever funded or acquired, those totals may be shown to the people involved; the data itself stays under this page's terms.

## What's sent

Usage statistics, once per session:

| When | What |
| --- | --- |
| Lila starts | Lila version, OS, GPU model and memory, RAM (rounded to a range), display count, language, whether Lila came from Steam, the installer or a source build, how long ago it was installed (as a range), how many extensions are loaded |
| Lila closes | Session length, minutes you were actively using it, whether it crashed, how many times each built-in command ran and whether from the UI, Python or an AI agent, how many extension or script commands ran (counted, never named), how often the Unreal link was used and the Unreal version |
| You answer the optional questions | Your role, team size and the DCC you used before Lila |

Crash reports, when Lila crashes and you click **Send Crash Report** in the crash dialog (or every time, if you tick **Always send crash reports without asking**, also in **Preferences > General > Telemetry**):

- The crash report: the call stack, Lila and Windows versions, your GPU and driver, and the names of the last commands you ran. Your username, computer name, file paths, log and command arguments are removed before it's sent.
- A minidump: a snapshot of the memory Lila was using around the crash (the crashed code and the data it was working on). Sentry reads the call stack out of it and then discards it.

To send a report you didn't send at the time, run `lilacrash.exe --send <folder>` from Lila's install folder, with the report's folder from **Help > Open Crash Reports Folder**.

Everything is tied to a random ID made when Lila is installed, not to you, your account or your machine.

## Never sent

- File names, folder paths or scene content
- Your username, computer name or email
- Your IP address: the country is read from it on arrival and the address is thrown away
- The names of your own scripts' or extensions' commands

## Turn it off

- Untick the boxes in **Preferences > General > Telemetry**. Anything not yet sent is deleted.
- Or set the environment variable `DO_NOT_TRACK=1` or `LILA_NO_TELEMETRY=1`. Nothing is collected or sent while either is set, whatever the preferences say.
- Studios can lock it off for everyone: put `{"telemetry": {"usage": false, "crashReports": false}, "$locked": ["/telemetry"]}` in the studio folder's `general.json` (see [Studio setup](studio-setup.md)).

Nothing is sent from `lilabatch`.

Update checks are separate from telemetry: at startup Lila downloads `latest.json` from Lila's newest release on GitHub to see whether a newer version exists. Nothing about you is sent. Turn it off with **Check for Lila updates at startup** in **Preferences > General**, or `LILA_NO_UPDATE_CHECK=1`. Steam builds never check; Steam updates them.

## Your ID and your data

**Reset ID** in **Preferences > General > Telemetry** gives you a new random ID. What's sent from then on can't be linked to what was sent before.

To have your data deleted, email [lila3d.app@gmail.com](mailto:lila3d.app@gmail.com) with the ID shown in `%APPDATA%\Lila\prefs\general.json` under `telemetry` > `installId`. It's deleted within 30 days.

## Where it goes

| Data | Service | Kept for |
| --- | --- | --- |
| Usage statistics | PostHog, EU region | 1 year |
| Crash reports | Sentry, US region | 30 days |

Sending happens in the background, at startup and every half hour. If it fails it tries again later, and gives up on an event after five tries. It never slows Lila down or stops it working offline.
