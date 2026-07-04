import {
  PanelSection,
  PanelSectionRow,
  staticClasses
} from "@decky/ui";
import {
  addEventListener,
  removeEventListener,
  callable,
  definePlugin,
  toaster,
  // routerHook
} from "@decky/api"
import { useEffect, useState } from "react";
import { FaShip } from "react-icons/fa";

// import logo from "../assets/logo.png";

const jellyfinStatus = callable<[], boolean>("jellyfin_status");
const startJellyfinServer = callable<[], boolean>("start_jellyfin");
const stopJellyfinServer = callable<[], boolean>("stop_jellyfin");
const longTimer = callable<[], boolean>("long_running");


function Content() {
  const [running, setRunning] = useState(false);
  const refreshStatus = async () => {
    const status = await jellyfinStatus();
    setRunning(status);
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  const startJellyfin = async () => {
    await startJellyfinServer();
    await longTimer();
    await refreshStatus();
  };

  const stopJellyfin = async () => {
    await stopJellyfinServer();
    await longTimer();
    await refreshStatus();
  };

  return (
      <PanelSection title="Jellyfin">
        <PanelSectionRow>
          <div
              style={{
                width: "100%",
                padding: "14px 18px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxSizing: "border-box",
              }}
          >
        <span
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: running ? "#65d841" : "#d84343",
              boxShadow: running
                  ? "0 0 10px rgba(101,216,65,0.8)"
                  : "0 0 10px rgba(216,67,67,0.8)",
              flexShrink: 0,
            }}
        />

            <span style={{ fontSize: "16px" }}>
          Estado: {running ? "Server is on" : "Server is off"}
        </span>
          </div>
        </PanelSectionRow>

        <PanelSectionRow>
          <div
              style={{
                display: "flex",
                gap: "10px",
                width: "100%",
              }}
          >
            <button
                onClick={startJellyfin}
                style={{
                  flex: 1,
                  minHeight: "58px",
                  border: "none",
                  borderRadius: "8px",
                  background: running ? "rgba(255,255,255,0.08)" : "#2f9e28",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: 600,
                  opacity: running ? 0.45 : 1,
                }}
                disabled={running}
            >
              ▶ Start Jellyfin
              <br />
              Server
            </button>

            <button
                onClick={stopJellyfin}
                style={{
                  flex: 1,
                  minHeight: "58px",
                  border: "none",
                  borderRadius: "8px",
                  background: running ? "#b83232" : "rgba(255,255,255,0.08)",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: 600,
                  opacity: running ? 1 : 0.45,
                }}
                disabled={!running}
            >
              ■ Stop Jellyfin
              <br />
              Server
            </button>
          </div>
        </PanelSectionRow>
      </PanelSection>
  );
};

export default definePlugin(() => {
  console.log("Easy Decky Server plugin initializing, this is called once on frontend startup")

  // Add an event listener to the "timer_event" event from the backend
  const listener = addEventListener<[
    test1: string,
    test2: boolean,
    test3: number
  ]>("timer_event", (test1, test2, test3) => {
    console.log("Template got timer_event with:", test1, test2, test3)
    toaster.toast({
      title: "template got timer_event",
      body: `${test1}, ${test2}, ${test3}`
    });
  });

  return {
    // The name shown in various decky menus
    name: "Easy Jellyfin Server",
    // The element displayed at the top of your plugin's menu
    titleView: <div className={staticClasses.Title}>Easy Jellyfin Server</div>,
    // The content of your plugin's menu
    content: <Content />,
    // The icon displayed in the plugin list
    icon: <FaShip />,
    // The function triggered when your plugin unloads
    onDismount() {
      console.log("Unloading")
      removeEventListener("timer_event", listener);
      // serverApi.routerHook.removeRoute("/decky-plugin-test");
    },
  };
});
