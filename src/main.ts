import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VuesticPlugin } from 'vuestic-ui'
import { i18n } from './i18n'
import App from './App.vue'
import store from './store'
import router from './router'
import {pinia} from './router'
import vuesticGlobalConfig from './services/vuestic-ui/global-config'
// import { createVuesticEssential, VaButton } from 'vuestic-ui'
import 'vuestic-ui/css'

const app = createApp(App)

// const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(store)
app.use(i18n)
app.use(VuesticPlugin, vuesticGlobalConfig)
// app.use(createVuesticEssential({ components: { VaButton } }));
app.mount('#app')
