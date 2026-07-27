import { initializeApp, getApps } from 'firebase/app';
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from 'firebase/messaging';
import Cookies from 'js-cookie';
import BasicProvider from 'src/constants/BasicProvider';
import {
  getFirebaseWebConfig,
  getFirebaseVapidKey,
  isFirebaseConfigured,
} from 'src/config/firebase';

let messagingInstance = null;
let initializedForUser = null;

async function fetchFirebaseConfigFromApi() {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_NODE_URL}/api/push-notifications/firebase-config`,
    );
    const json = await response.json();
    return json?.data || null;
  } catch (error) {
    console.warn('Could not load Firebase config from API:', error?.message || error);
    return null;
  }
}

async function resolveFirebaseConfig() {
  if (isFirebaseConfigured()) {
    return {
      ...getFirebaseWebConfig(),
      vapidKey: getFirebaseVapidKey(),
    };
  }
  return fetchFirebaseConfigFromApi();
}

function showForegroundNotification(payload) {
  if (!payload?.notification) return;
  const title = payload.notification.title || 'ValuXpert';
  const body = payload.notification.body || '';
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/logo.png',
      data: payload.data || {},
      tag: payload.data?.case_id || 'valuxpert-case',
    });
    notification.onclick = () => {
      window.focus();
      const caseId = payload?.data?.case_id;
      if (caseId) {
        window.location.hash = `#/case/${caseId}/show`;
      } else {
        window.location.hash = '#/case/mypendingcase';
      }
      notification.close();
    };
  }
}

export async function initPushNotifications() {
  const role = Cookies.get('current_user_role');
  const feRole = process.env.REACT_APP_FE || 'field-engineer-fe';
  if (role !== feRole) return;

  if (!(await isSupported())) {
    console.warn('Push notifications are not supported on this browser.');
    return;
  }

  const userId = Cookies.get('primery_user_id');
  if (!userId || initializedForUser === userId) return;

  const firebaseConfig = await resolveFirebaseConfig();
  if (!firebaseConfig?.apiKey || !firebaseConfig?.vapidKey) {
    console.warn('Firebase push is not configured yet.');
    return;
  }

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;
  } else if (Notification.permission !== 'granted') {
    return;
  }

  const app =
    getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

  const apiBase = process.env.REACT_APP_NODE_URL || '';
  const registration = await navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?api=${encodeURIComponent(apiBase)}`,
  );

  await navigator.serviceWorker.ready;

  messagingInstance = getMessaging(app);

  const token = await getToken(messagingInstance, {
    vapidKey: firebaseConfig.vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) return;

  await new BasicProvider('push-notifications/register').postRequest({
    token,
    platform: 'web',
    device_info: navigator.userAgent,
  });

  onMessage(messagingInstance, (payload) => {
    showForegroundNotification(payload);
  });

  initializedForUser = userId;
}

export async function unregisterPushNotifications() {
  initializedForUser = null;
  messagingInstance = null;
}
