import { PowerOffIcon, PowerIcon, CircleDotDashed } from "lucide-react";
import routerImage from "@/assets/router.jpg";
import { Button } from "./ui/button";
import { load } from "@tauri-apps/plugin-store";
import { useState } from "react";
import { fetch as axi } from "@tauri-apps/plugin-http";

type ConnectState = "connecting" | "disconnected" | "requestingInfo" | "connected";

const Hertz6RouterPageHomePage = () => {
  // State for power toggle and connection status
  const [connectionState, setConnectionState] = useState<ConnectState>("disconnected");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleConnect = async () => {
    const store = await load('store.json', { autoSave: false });

    if (connectionState === "disconnected" || connectionState === "requestingInfo") {
      try {
        setConnectionState("connecting");

        // Use provided credentials or get stored ones
        let authUsername = username;
        let authPassword = password;
        if (connectionState === "disconnected") {
          const storedAuth = await store.get<{ username: string; password: string }>('auth');
          if (!storedAuth) {
            setConnectionState("requestingInfo");
            return;
          }
          authUsername = storedAuth.username;
          authPassword = storedAuth.password;
          setUsername(authUsername);
          setPassword(authPassword);
        }

        // Generate a timestamp and encode login parameters
        const timestamp = new Date().getTime();
        const loginParam = encodeURIComponent(JSON.stringify({ username: authUsername, password: authPassword }));

        // Build URL as in the working example
        const url = `http://192.168.1.1/adminLogin&cur_time=${timestamp}?loginParam=${loginParam}&_=${timestamp}`;

        // setLog(`Fetching: ${url}`);

        const response = await axi(url);

        const data = await response.json();
        if (data["state"] == 0) {
          setConnectionState("disconnected");
          setLog("Failed to connect");
          return;
        }

        console.log(data);
        // setLog(`Session ID: ${data["sessionID"]}`);

        await store.set("sid", { "value": data.sessionId });
        await store.set("auth", { "value": { username: authUsername, password: authPassword } });

        // Simulate delay before marking as connected
        setTimeout(() => {
          setConnectionState("connected");
          setLog("Connection Successful");
        }, 5000);
      } catch (error) {
        // setLog(`Error: ${error}`);
        setConnectionState("disconnected");
      }
    }
  };


  const handleSubmitExtraAuthInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleConnect();
  };

  return (

    <div className="flex flex-col items-center place-content-start grid-rows-12 h-screen w-screen max-w-screen bg-primary-foreground">
      <div className="header p-4 flex flex-row place-content-between w-full m-2 mx-4 mb-6 py-4 pb-4 border-b">
        <h1 className="text-xl font-semibold text-neutral-500 decoration-1 my-auto">Hertz6 Router.</h1>
        <img src={routerImage} onClick={async () => {
          const store = await load("store.json");

          await store.clear();
          setConnectionState("disconnected");

        }} className="size-10 rounded-full border border-dashed border-green-200" alt="Router" />
      </div>
      {/* <span>{log}</span> */}
      <div className="centre-body h-full w-full flex">
        <div
          onClick={handleConnect}
          className={`transition-colors flex flex-row place-content-center m-auto inset-2 size-48 animate-in animate-out ring-4 rounded-full border-3
            ${connectionState === "connecting" && "ring-blue-600 border-blue-300"}
            ${connectionState === "requestingInfo" && "ring-blue-600 border-blue-300"}
            ${connectionState === "disconnected" && "ring-red-600 border-red-400"}
            ${connectionState === "connected" && "ring-green-400 border-green-500"}`}
        >
          <span className="text-center text-2xl font-bold m-auto text-green-100 flex flex-row space-x-2">
            <span>
              {connectionState === "connected"
                ? "Connected"
                : (connectionState === "connecting" || connectionState === "requestingInfo")
                  ? "Connecting"
                  : "Connect"}
            </span>
            {connectionState === "connecting" && <CircleDotDashed className="animate-spin text-green-900" />}
          </span>
        </div>
      </div>
      <div className="w-full rounded-t-3xl bg-neutral-950 mt-12 border-t border-neutral-700 shadow-2xl">
        <div className="w-full flex flex-row flex-wrap place-content-between p-4 mx-auto">
          <Button className="rounded-full p-1" variant={"outline"} size={"icon"}>
            <PowerOffIcon className="text-red-400" />
          </Button>
          <span className="text-xs my-auto text-neutral-600 animate-pulse">
            {connectionState === "disconnected" && "Click connect or Swipe to connect"}
            {(connectionState === "connecting" || connectionState === "requestingInfo") && "Connecting"}
          </span>
          <Button className="rounded-full p-1" variant={"ghost"} size={"icon"}>
            <PowerIcon className="text-green-400" />
          </Button>
        </div>
        {connectionState === "requestingInfo" && (
          <form onSubmit={handleSubmitExtraAuthInfo} className="info flex flex-col flex-nowrap w-full p-2 space-y-5 mt-2 rounded-2xl">
            <input
              type="text"
              name="username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              placeholder="Admin"
              className="w-full bg-neutral-900 border rounded-full p-3"
            />
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              placeholder="*******"
              className="w-full bg-neutral-900 border rounded-full p-3"
            />
            <input type="submit" value="Continue" className="text-blue-200 bg-blue-700 rounded-full p-3" />
          </form>
        )}
      </div>
    </div>
  );
};

export default Hertz6RouterPageHomePage;
