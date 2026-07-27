export function getFirebaseWebConfig() {
  return {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
  };
}

export function getFirebaseVapidKey() {
  return process.env.REACT_APP_FIREBASE_VAPID_KEY || '';
}

export function isFirebaseConfigured() {
  const config = getFirebaseWebConfig();
  return Boolean(
    config.apiKey &&
      config.projectId &&
      config.messagingSenderId &&
      config.appId &&
      getFirebaseVapidKey(),
  );
}
