import {
  ButtonItem,
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
          <ButtonItem>
            Estado: {running ? "🟢 Server is on" : "🔴 Server is off"}
          </ButtonItem>
        </PanelSectionRow>

        <PanelSectionRow>
          <ButtonItem onClick={() => startJellyfin()}>
            Start Jellyfin Server
          </ButtonItem>
        </PanelSectionRow>

        <PanelSectionRow>
          <ButtonItem onClick={() => stopJellyfin()}>
            Stop Jellyfin Server
          </ButtonItem>
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
