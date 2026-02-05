import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'; // Import createI18n

import App from './App.vue'
import router from './router'

import './assets/main.css'

// Import messages
import en from './locales/en.json';
import zh from './locales/zh.json';

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: 'en', // set locale
  fallbackLocale: 'en', // set fallback locale
  messages: {
    en,
    zh,
  },
});


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n) // Use i18n

app.mount('#app')
