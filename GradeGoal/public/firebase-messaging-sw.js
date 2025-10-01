// Firebase Cloud Messaging Service Worker
// This file must be in the public directory to be accessible by the browser

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// Note: Replace these with your actual Firebase config values from your .env file
const firebaseConfig = {
  apiKey: "AIzaSyC9b8_ssZDagQ_BFULum_lGJjw-Z-IK_pY", // Replace with your actual API key
  authDomain: "grade-goal.firebaseapp.com",
  projectId: "grade-goal",
  storageBucket: "grade-goal.appspot.com",
  messagingSenderId: "1058949248764",
  appId: "1:1058949248764:web:e4c320be1ab253f6008979", // Replace with your actual App ID
};

firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.svg',
    badge: '/logo.svg',
    tag: 'gradegoal-notification',
    requireInteraction: true,
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'view') {
    // Open the app or navigate to relevant page
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default click behavior
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

