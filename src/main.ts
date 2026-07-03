import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useAuthStore } from './stores/auth'
import './assets/styles/global.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
// 尽早初始化 auth，确保后续 API 请求能读取 token
useAuthStore(pinia)
app.use(router)
app.mount('#app')
