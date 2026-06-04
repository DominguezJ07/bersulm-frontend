import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let messaging: Messaging | null = null

function getFirebaseMessaging(): Messaging | null {
  if (!firebaseConfig.apiKey) return null
  if (messaging) return messaging

  try {
    const app = initializeApp(firebaseConfig)
    messaging = getMessaging(app)
    return messaging
  } catch {
    return null
  }
}

export async function requestFcmToken(): Promise<string | null> {
  const msg = getFirebaseMessaging()
  if (!msg) return null

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
    const currentToken = await getToken(msg, {
      vapidKey: vapidKey || undefined,
    })
    return currentToken || null
  } catch {
    return null
  }
}

export function onForegroundMessage(
  callback: (payload: { title?: string; body?: string }) => void,
): () => void {
  const msg = getFirebaseMessaging()
  if (!msg) return () => {}

  const unsubscribe = onMessage(msg, (payload) => {
    callback({
      title: payload.notification?.title,
      body: payload.notification?.body,
    })
  })

  return unsubscribe
}
