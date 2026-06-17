/* eslint-disable no-undef */
// @ts-nocheck
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')
// ... resto del archivo igual

firebase.initializeApp({
  apiKey: 'AIzaSyDV7IeUDu2L80gN9lpDtZQrOf56RPCejk0',
  authDomain: 'bersulm-fe523.firebaseapp.com',
  projectId: 'bersulm-fe523',
  storageBucket: 'bersulm-fe523.firebasestorage.app',
  messagingSenderId: '448544301221',
  appId: '1:448544301221:web:bd51d7c82cbeb94838ad4c',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {}

  self.registration.showNotification(title || 'BERSULM', {
    body: body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'bersulm-notification',
    requireInteraction: false,
  })
})