// import './polyfills' 

import { createApp } from 'vue'
import { VuesticPlugin } from 'vuestic-ui'
import { i18n } from './i18n'
import App from './App.vue'
import router from './router'
import store from './store/index.js'
import vuesticGlobalConfig from './services/vuestic-ui/global-config'
import 'vuestic-ui/css'


const app = createApp(App)

app.use(store)
app.use(router)
app.use(i18n)
app.use(VuesticPlugin, vuesticGlobalConfig)
app.mount('#app')
