import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<any>;
  }
}

export const getEcho = (): Echo<any> | null => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");

  if (!window.Echo) {
    window.Pusher = Pusher;

    window.Echo = new Echo<any>({
      broadcaster: "reverb",
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || "",
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "127.0.0.1",
      wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
      wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
      forceTLS: false,
      enabledTransports: ["ws", "wss"],
      authEndpoint: "http://127.0.0.1:8000/api/broadcasting/auth",
      auth: {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Accept: "application/json",
        },
      },
      Pusher: Pusher,
    });
  } else if (token && window.Echo.options.auth?.headers) {
    window.Echo.options.auth.headers.Authorization = `Bearer ${token}`;
  }

  return window.Echo;
};
