import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/typography.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .catch((err) => {
        console.error("Service Worker registration failed:", err);
      });
  });
}
