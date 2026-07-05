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
const getServerAddress = callable<[], string>("get_server_address");

function Content() {
  const [running, setRunning] = useState(false);
  const [serverAddress, setServerAddress] = useState("");

  const refreshStatus = async () => {
    const status = await jellyfinStatus();
    setRunning(status);
  }

  const printIP = async () => {
    const ip = await getServerAddress();
    setServerAddress(ip);
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  useEffect(() => {
    const listener = addEventListener<[]>(
        "server_running_event",
        async () => {
          //await refreshStatus();
          //await printIP();

          toaster.toast({
            title: "Evento: Server is on!",
            body: `Server running on ${serverAddress}`,
          });
        }
    );

    return () => removeEventListener("server_running_event", listener);
  }, []);

  const startJellyfin = async () => {
      toaster.toast({
          title: "Click!",
          body: `Clicked`,
      });

    await startJellyfinServer();
    await refreshStatus();
    await printIP();


  };

  const stopJellyfin = async () => {
    await stopJellyfinServer();
    longTimer();
    setServerAddress("");
  };

  return (
      <PanelSection title="Jellyfin">
        <PanelSectionRow>
          <div
              style={{
                width: "100%",
                padding: "14px 18px",
                marginBottom: "22px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.04)",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                boxSizing: "border-box",
              }}
          >
        <span
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: running ? "#39ff14" : "#d84343",
              boxShadow: running
                  ? "0 0 14px rgba(57,255,20,0.9)"
                  : "0 0 14px rgba(216,67,67,0.9)",
              flexShrink: 0,
            }}
        />

            <span style={{ fontSize: "16px", fontWeight: 600 }}>
          Estado: {running ? "Server is on" : "Server is off"}
        </span>
          </div>
        </PanelSectionRow>

        {running && (
            <PanelSectionRow>
              <div
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    marginBottom: "22px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.04)",
                    boxSizing: "border-box",
                  }}
              >
                <div
                    style={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.65)",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                >
                  Dirección del servidor
                </div>

                <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      fontFamily: "monospace",
                    }}
                >
                  {serverAddress}:8096
                </div>
              </div>
            </PanelSectionRow>
        )}

        <PanelSectionRow>
          <button
              onClick={running ? stopJellyfin : startJellyfin}
              style={{
                width: "100%",
                height: "86px",
                border: "none",
                borderRadius: "12px",
                background: running ? "#d93939" : "#2e9e44",
                color: "white",
                fontSize: "18px",
                fontWeight: 700,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
          >
        <span style={{ fontSize: "32px", lineHeight: 1 }}>
          {running ? "■" : "▶"}
        </span>

            <span>
          {running ? "Stop server" : "Start server"}
        </span>
          </button>
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
