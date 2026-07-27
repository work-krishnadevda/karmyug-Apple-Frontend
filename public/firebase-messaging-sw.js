/* global importScripts, firebase */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

let messaging = null;

async function loadFirebaseConfig() {
  try {
    const params = new URLSearchParams(self.location.search);
    const apiBase = params.get('api');

    if (!apiBase) {
      console.error(
        'firebase-messaging-sw: missing ?api= backend URL. FE app should register this worker with REACT_APP_NODE_URL.',
      );
      return null;
    }

    const response = await fetch(
      `${apiBase}/api/push-notifications/firebase-config`,
    );
    const json = await response.json();
    return json?.data || null;
  } catch (error) {
    console.error('firebase-messaging-sw config load failed', error);
    return null;
  }
}

async function initFirebaseMessaging() {
  if (messaging) return messaging;

  const config = await loadFirebaseConfig();
  if (!config?.apiKey) {
    return null;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    });
  }

  messaging = firebase.messaging();
  return messaging;
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

initFirebaseMessaging().then((instance) => {
  if (!instance) return;

  instance.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || 'ValuXpert';
    const options = {
      body: payload.notification?.body || '',
      icon: '/logo.png',
      badge: '/logo.png',
      data: payload.data || {},
      tag: payload.data?.case_id || 'valuxpert-case',
    };
    self.registration.showNotification(title, options);
  });
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
    }),
  );
});
