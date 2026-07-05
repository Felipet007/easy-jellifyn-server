import os

# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code repo
# and add the `decky-loader/plugin/imports` path to `python.analysis.extraPaths` in `.vscode/settings.json`
import decky
import asyncio
import socket
import re

APP_ID = "org.jellyfin.JellyfinServer"

class Plugin:

    async def jellyfin_status(self):
        result = await self.check_status()
        return result["returncode"] == 0

    async def check_status(self):
        return await self.run_cmd(
            "flatpak ps --columns=application | grep -Fx org.jellyfin.JellyfinServer"
        )

    async def start_jellyfin(self):
        await self.run_cmd("nohup flatpak run org.jellyfin.JellyfinServer >/tmp/jellyfin-flatpak.log 2>&1 &")
        await decky.emit("server_starting_event", "Server is starting!")
        self.loop.create_task(self.wait_for_server())

    async def stop_jellyfin(self):
        await self.run_cmd("pkill -f jellyfin")
        await asyncio.sleep(2)
        await decky.emit("server_stopped_event")

    async def wait_for_server(self):
        await asyncio.sleep(5)
        for _ in range(30):
            result = await self.check_status()

            if result["returncode"] == 0:
                await decky.emit("server_running_event")
                return

            await asyncio.sleep(0.5)

    async def get_server_address(self):
        ip = self.get_local_ip()
        port = await self.get_jellyfin_port()

        return f'{ip}:{port}'

    def get_local_ip(self):
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
        except:
            ip = "127.0.0.1"
        finally:
            s.close()

        return ip

    async def get_jellyfin_port(self):
        result = await self.run_cmd("ss -tulpn | grep -i jellyfin")

        if result["returncode"] != 0:
            return "8096"

        for line in result["stdout"].splitlines():
            match = re.search(r":(\d+)\s", line)
            if match:
                port = match.group(1)

                if port not in ["1900", "7359"]:
                    return port

        return "8096"

    async def run_cmd(self, cmd: str):
        xdg_runtime_dir = os.environ.get("XDG_RUNTIME_DIR")

        if not xdg_runtime_dir:
            uid = os.getuid()
            xdg_runtime_dir = f"/run/user/{uid}"

        env = dict(os.environ)

        env.pop("LD_LIBRARY_PATH", None)
        env.pop("LD_PRELOAD", None)

        env["XDG_RUNTIME_DIR"] = xdg_runtime_dir

        proc = await asyncio.create_subprocess_shell(
            cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env
        )

        stdout, stderr = await proc.communicate()

        return {
            "returncode": proc.returncode,
            "stdout": stdout.decode(),
            "stderr": stderr.decode(),
        }

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        self.loop = asyncio.get_event_loop()
        decky.logger.info("Hello World!")

    # Function called first during the unload process, utilize this to handle your plugin being stopped, but not
    # completely removed
    async def _unload(self):
        decky.logger.info("Goodnight World!")
        pass

    # Function called after `_unload` during uninstall, utilize this to clean up processes and other remnants of your
    # plugin that may remain on the system
    async def _uninstall(self):
        decky.logger.info("Goodbye World!")
        pass

    # Migrations that should be performed before entering `_main()`.
    async def _migration(self):
        decky.logger.info("Migrating")
        # Here's a migration example for logs:
        # - `~/.config/decky-template/template.log` will be migrated to `decky.decky_LOG_DIR/template.log`
        decky.migrate_logs(os.path.join(decky.DECKY_USER_HOME,
                                               ".config", "decky-template", "template.log"))
        # Here's a migration example for settings:
        # - `~/homebrew/settings/template.json` is migrated to `decky.decky_SETTINGS_DIR/template.json`
        # - `~/.config/decky-template/` all files and directories under this root are migrated to `decky.decky_SETTINGS_DIR/`
        decky.migrate_settings(
            os.path.join(decky.DECKY_HOME, "settings", "template.json"),
            os.path.join(decky.DECKY_USER_HOME, ".config", "decky-template"))
        # Here's a migration example for runtime data:
        # - `~/homebrew/template/` all files and directories under this root are migrated to `decky.decky_RUNTIME_DIR/`
        # - `~/.local/share/decky-template/` all files and directories under this root are migrated to `decky.decky_RUNTIME_DIR/`
        decky.migrate_runtime(
            os.path.join(decky.DECKY_HOME, "template"),
            os.path.join(decky.DECKY_USER_HOME, ".local", "share", "decky-template"))
