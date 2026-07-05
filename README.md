# Easy Jellyfin Server

A simple **Decky Loader** plugin to manage a local **Jellyfin Server** installed as a **Flatpak** on **Bazzite** or **SteamOS**.

The plugin allows you to start and stop the server directly from Gaming Mode without switching to Desktop Mode.

## Features

- ▶️ Start Jellyfin Server
- ■ Stop Jellyfin Server
- 🟢 Live server status
- ⏳ Startup detection while the server is initializing
- 🌐 Display the current server address (`IP:PORT`)
- 🔔 Toast notifications for server events

## Requirements

- SteamOS or Bazzite
- Decky Loader
- Jellyfin Server installed as Flatpak

```bash
flatpak install flathub org.jellyfin.JellyfinServer
```

## Installation

1. Download the latest release.
2. Open **Decky Loader**.
3. Install the plugin from the downloaded ZIP.
4. Make sure Jellyfin Server is installed.

## Usage

### Start the server

Press **Start Server**.

The plugin will:

- Launch Jellyfin.
- Detect when the server is actually running.
- Display the server address.
- Notify when the server is ready.

### Stop the server

Press **Stop Server**.

The plugin will terminate the Jellyfin process and update the interface accordingly.

## Current limitations

- Designed for the Flatpak version of Jellyfin Server.
- The plugin assumes a single Jellyfin instance.
- The first startup may take a few seconds depending on the device.

## Planned features

- Display current connected users.
- Show Jellyfin version.
- Open the server URL directly.
- Optional automatic metadata refresh.
- Better error reporting.
- Localization.

## License

MIT