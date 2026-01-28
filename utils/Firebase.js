"use client";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";
import firebase from "firebase/compat/app";
import { getAuth } from "firebase/auth";
import { toast } from "sonner";
import { createStickyNote, t } from ".";
import { getFcmToken } from "@/redux/reducer/settingSlice";

const FirebaseData = () => {
  let firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const app = initializeApp(firebaseConfig);
  const authentication = getAuth(app);
  const firebaseApp = !getApps().length
    ? initializeApp(firebaseConfig)
    : getApp();

  const messagingInstance = async () => {
    try {
      const isSupportedBrowser = await isSupported();
      if (isSupportedBrowser) {
        return getMessaging(firebaseApp);
      } else {
        createStickyNote();
        return null;
      }
    } catch (err) {
      console.error("Error checking messaging support:", err);
      return null;
    }
  };
  const isValidVapidKey = (key) => {
    if (!key || typeof key !== "string") return false;
    // Allow URL-safe base64 chars; Firebase expects base64url-encoded key
    return /^[A-Za-z0-9_-]+$/.test(key);
  };

  const fetchToken = async (setFcmToken) => {
    try {
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
        // Disable FCM if VAPID key is missing or invalid - fail silently
        if (!isValidVapidKey(vapidKey)) {
          // FCM disabled - no error logging to avoid console noise
          return;
        }
        const messaging = await messagingInstance();
        if (!messaging) {
          // Messaging not supported - fail silently
          return;
        }
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          getToken(messaging, {
            vapidKey,
          })
            .then((currentToken) => {
              if (currentToken) {
                getFcmToken(currentToken);
                setFcmToken(currentToken);
              }
              // No token found - fail silently (don't show error)
            })
            .catch((err) => {
              // Catch all FCM errors (including atob InvalidCharacterError) and fail silently
              // FCM is disabled/not configured - don't log errors to console
              // Only log if it's a service worker issue that we can potentially fix
              if (err.message && err.message.includes("no active Service Worker")) {
                registerServiceWorker();
              }
            });
        }
        // Permission not granted - fail silently
      }
    } catch (err) {
      // Catch any unexpected errors and fail silently
      // FCM is disabled - don't log errors
    }
  };

  const registerServiceWorker = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registration successful with scope: ",
            registration.scope
          );
          // After successful registration, try to fetch the token again
          fetchToken();
        })
        .catch((err) => {
          console.log("Service Worker registration failed: ", err);
        });
    }
  };

  const onMessageListener = async (callback) => {
    try {
      const messaging = await messagingInstance();
      if (messaging) {
        return onMessage(messaging, callback);
      }
      // Messaging not available - return null silently
      return null;
    } catch (err) {
      // FCM disabled or error - return null silently
      return null;
    }
  };
  const signOut = () => {
    return authentication.signOut();
  };
  return { firebase, authentication, fetchToken, onMessageListener, signOut };
};

export default FirebaseData;
