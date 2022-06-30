import { createApp } from 'vue'
import { VuesticPlugin } from 'vuestic-ui'
import {i18n} from './i18n'
import App from './App.vue'
import store from './store'
import router from './router'
import vuesticGlobalConfig from './services/vuestic-ui/global-config'

const app = createApp(App)
app.use(router)
app.use(store)
app.use(i18n)
app.use(VuesticPlugin, vuesticGlobalConfig)
app.mount('#app')
