/* global importScripts, firebase */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCwfglZlfDBXVeklxM9tN4vpNPLTXb2KX8',
  authDomain: 'valuxpert-966.firebaseapp.com',
  projectId: 'valuxpert-966',
  messagingSenderId: '675708757089',
  appId: '1:675708757089:web:78462fcf3d4a5587403620',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};
  const data = payload.data || {};
  const title = notification.title || data.title || 'ValuXpert';
  const body = notification.body || data.body || '';

  const options = {
    body,
    icon: '/logo.png',
    badge: '/logo.png',
    data,
    tag: data.case_id || 'valuxpert-case',
    vibrate: [200, 100, 200],
  };

  return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const caseId = data.case_id;
  const target = caseId ? `/#/case/${caseId}/show` : '/#/case/mypendingcase';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(target);
      }
      return undefined;
    }),
  );
});

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
