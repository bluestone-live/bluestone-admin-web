import { createApp } from 'vue'
import { VuesticPlugin } from 'vuestic-ui'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import store from './store'
import router from './router'
import vuesticGlobalConfig from './services/vuestic-ui/global-config'

const i18nConfig = {
    locale: 'en',
    fallbackLocale: 'en',
    message: {
        en: new URL('./i18n/en', import.meta.url).href,
        cn: new URL('./i18n/cn', import.meta.url).href,
    }
}

const app = createApp(App)
app.use(router)
app.use(store)
app.use(createI18n(i18nConfig))
app.use(VuesticPlugin, vuesticGlobalConfig)
app.mount('#app')
