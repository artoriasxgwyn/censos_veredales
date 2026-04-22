import { createApp } from 'vue'
import { Quasar, Notify, Dialog, Loading } from 'quasar'
import { createPinia } from 'pinia'

import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'
import 'quasar/src/css/index.sass'

import App from './App.vue'
import './style.css'

// Import router after Pinia to avoid circular dependency
const pinia = createPinia()
const { router } = await import('./routes')

const app = createApp(App)

app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
    Loading
  },
  config: {
    notify: {
      position: 'top-right',
      timeout: 3000,
      textColor: 'white',
      actions: [{ icon: 'close', color: 'white' }]
    },
    loading: {
      spinner: 'QSpinnerGears',
      message: 'Cargando...'
    }
  }
})

app.use(pinia)
app.use(router)

app.mount('#app')
