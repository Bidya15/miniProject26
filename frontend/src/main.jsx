import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";

// Replace with your actual Google Client ID from Cloud Console
const GOOGLE_CLIENT_ID =
  "946370464466-1coup8f9blft028p2c9cq0vennsmtpta.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);

// ─── Register Service Worker (PWA + keepalive) ────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("Service Worker registered", reg);
        // Trigger an immediate backend ping on every page load.
        // This wakes the Render backend container as soon as a user visits,
        // reducing the cold-start wait if the container had just spun down.
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: "PING_BACKEND" });
        }
      })
      .catch((err) => console.error("Service Worker registration failed", err));
  });
}
