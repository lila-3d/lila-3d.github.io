# Install Lila

Lila installed on Windows, started, and keeping itself up to date.

## Get it working

1. Click **Download Lila** on [the Lila site](https://lila-3d.github.io/ ':ignore') and run `Lila-<version>-Setup.exe`.
2. Windows shows **Windows protected your PC**, because the installer isn't code-signed yet. Click **More info**, then **Run anyway**.
3. Choose **Install for me only**, which needs no administrator rights.
4. Accept the licence and click through the installer. Leave **Launch Lila** ticked on the last page.

<!-- TODO image: the "Windows protected your PC" dialog with More info clicked and Run anyway showing (images/install/smartscreen.png) -->

Check your PC against the [system requirements](requirements.md) first: Lila needs 64-bit Windows 10 or 11 and a GPU with Vulkan 1.3.

## Updates

Lila checks for a new version each time it starts. When there is one, click **Install Now**, or **Install When Lila Closes** to keep working: Lila downloads it in the background and installs it once you close Lila. Usually it downloads only the files that changed, and an interrupted download picks up where it stopped.

To check now, choose **Help > Check for Updates...**.

## Uninstall

In Windows, open **Settings > Apps > Installed apps**, find **Lila** and choose **Uninstall**. Your preferences stay in `%APPDATA%\Lila`. Delete that folder to remove them too.

## Troubleshooting

**There's no Run anyway button.** Click **More info** first. If it's still missing, your organisation blocks unsigned apps: ask IT to allow the installer.

**The browser says the download isn't commonly downloaded.** Choose **Keep** from the download's menu. To be sure the file is the real one, compare its SHA-256 with the one on the download dialog:

```powershell
Get-FileHash .\Lila-0.1.0-Setup.exe
```

**"The update couldn't be downloaded."** Lila already retried. What it downloaded is kept, so **Help > Check for Updates...** later resumes from there. Or click **Download Lila** on the site and run the new installer over the old one. Your preferences and scenes aren't touched.

**"Lila files differ from the release, so this update needs the full installer."** Something changed Lila's files since they were installed, often antivirus. **Show Details...** lists them. Download the full installer, or click **Cancel** and update later.

**Lila is broken after an update, or files are missing.** Choose **Help > Reinstall Lila...**. It downloads the full installer and replaces every Lila program file. Your preferences and scenes aren't touched.

**Lila starts, but the viewport is black or missing.** Your GPU driver is too old: see [system requirements](requirements.md).

**Lila crashes on startup.** See [Support](support.md).

## Options

| Option | Default | What it does |
| --- | --- | --- |
| **Preferences > General > Check for Lila updates at startup** | On | Looks for a new version at startup. Nothing about you is sent. |
| **Skip This Version** on the update notice | | Stops the notice for that version. Later versions still show it. |
| `LILA_NO_UPDATE_CHECK=1` | Unset | Environment variable that turns the startup check off, for studio machines. |
