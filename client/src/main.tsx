import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Safari detection and service worker prevention
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isSafariBrowser = isSafari || isIOS;

// Register service worker only for non-Safari browsers to prevent reload issues
if (!isSafariBrowser && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      console.log('Service Worker registered:', registration);
    })
    .catch((error) => {
      console.log('Service Worker registration failed:', error);
    });
}

createRoot(document.getElementById("root")!).render(<App />);
