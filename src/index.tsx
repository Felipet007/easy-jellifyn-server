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
import { SiJellyfin } from "react-icons/si";

//import logo from "../assets/logo.png";

const jellyfinStatus = callable<[], boolean>("jellyfin_status");
const startJellyfinServer = callable<[], boolean>("start_jellyfin");
const stopJellyfinServer = callable<[], boolean>("stop_jellyfin");
const getServerAddress = callable<[], string>("get_server_address");

function Content() {
  const [running, setRunning] = useState(false);
  const [pending, setPending] = useState(false);
  const [serverAddress, setServerAddress] = useState("");

  const refreshStatus = async () => {
    const status = await jellyfinStatus();
    setRunning(status);
  }

  useEffect(() => {
    refreshStatus();
    if(running) {
        getServerAddress().then(result => {
            setServerAddress(result);
        });
    }
  }, []);

  useEffect(() => {
    const listenerStarting = addEventListener<[]>(
        "server_starting_event",
        async () => {
          toaster.toast({
            title: "Starting Jellyfin",
            body: `Jellyfin server is starting, please wait.`,
          });

          setPending(true);
        }
    );

    return () => removeEventListener("server_starting_event", listenerStarting);
  }, []);

    useEffect(() => {
        const listenerRunning = addEventListener<[]>(
            "server_running_event",
            async () => {
                await refreshStatus();
                const serverAddress = await getServerAddress();
                setServerAddress(serverAddress);
                toaster.toast({
                    title: "Running Jellyfin",
                    body: `Server running on ${serverAddress}`,
                });

                setPending(false);
            }
        );

        return () => removeEventListener("server_running_event", listenerRunning);
    }, []);

    useEffect(() => {
        const listenerStop = addEventListener<[]>(
            "server_stopped_event",
            async () => {
                toaster.toast({
                    title: "Stopped",
                    body: `Server has been stopped`,
                });

                refreshStatus()
                setPending(false)
                setServerAddress("")
            }
        );

        return () => removeEventListener("server_stopped_event", listenerStop);
    }, []);

  const startJellyfin = async () => {
      await startJellyfinServer();
  };

  const stopJellyfin = async () => {
    setPending(false);
    await stopJellyfinServer();
  };

  const pendingJellyfin = async () => {
      toaster.toast({
          title: "Jellyfin is starting",
          body: `Please wait until Jellyfin starts`,
      });
  }

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
              background: pending ? "#f1ce50" : running ? "#d93939" : "#2e9e44",
              boxShadow: pending? "0 0 18px rgba(255,193,7,0.95)" : running
                  ? "0 0 14px rgba(57,255,20,0.9)"
                  : "0 0 14px rgba(216,67,67,0.9)",
              flexShrink: 0,
            }}
        />

            <span style={{ fontSize: "16px", fontWeight: 600 }}>
          Estado: {pending? "Server is starting" : running ? "Server is on" : "Server is off"}
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
                  {serverAddress}
                </div>
              </div>
            </PanelSectionRow>
        )}

        <PanelSectionRow>
          <button
              onClick={pending ? pendingJellyfin : running ? stopJellyfin : startJellyfin}
              style={{
                width: "100%",
                height: "86px",
                border: "none",
                borderRadius: "12px",
                background: pending ? "#f1ce50" : running ? "#d93939" : "#2e9e44",
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
          {pending? "" : running ? "■" : "▶"}
        </span>

            <span>
          {pending? "Server is starting" : running ? "Stop server" : "Start server"}
        </span>
          </button>
        </PanelSectionRow>
      </PanelSection>
  );
};

export default definePlugin(() => {
  console.log("Easy Decky Server plugin initializing, this is called once on frontend startup")

  return {
    // The name shown in various decky menus
    name: "Easy Jellyfin Server",
    // The element displayed at the top of your plugin's menu
    titleView: <div className={staticClasses.Title}>Easy Jellyfin Server</div>,
    // The content of your plugin's menu
    content: <Content />,
    // The icon displayed in the plugin list
    icon: <SiJellyfin />,
    // The function triggered when your plugin unloads
    onDismount() {
      console.log("Unloading");
    },
  };
});
