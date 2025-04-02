importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Firebase configuration - hardcoded values since service workers can't access env variables
const firebaseConfig = {
   apiKey: "AIzaSyAWBQQS0pt-dEJxx3JbQaCP-dlmThIOmsQ",
  authDomain: "apnakahata.firebaseapp.com",
  projectId: "apnakahata",
  storageBucket: "apnakahata.firebasestorage.app",
  messagingSenderId: "181428736249",
  appId: "1:181428736249:web:b35981a877290fd7d1d228",
  measurementId: "G-WSMTSLK59V",
  vapidKey:
    "BJYKJFtr7C9cH_ScmusjquJGu91XIwg4ZB2TDe9Cp7MPU5VaUAuL7H2-noLsYVq84-6LbgodyXnYLYUVMTCPjMY",
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);

  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || "/logo192.png",
    badge: "/badge-icon.png",
    tag: payload.notification.tag || "default",
    data: payload.data || {},
    actions: payload.notification.actions || [],
    requireInteraction: true,
    silent: false,
  };

  self.registration.showNotification(
    payload.notification.title,
    notificationOptions
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);
  event.notification.close();

  const data = event.notification.data;
  const urlToOpen = data.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event);
});
