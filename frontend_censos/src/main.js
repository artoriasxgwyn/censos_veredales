import { createApp } from 'vue'
import { Quasar, Notify, Dialog, Loading } from 'quasar'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth.store'

import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'
import 'quasar/src/css/index.sass'

import App from './App.vue'
import './style.css'
import './sidebar-overrides.css'

// Import router after Pinia to avoid circular dependency
const pinia = createPinia()
const { router } = await import('./routes')

const app = createApp(App)

// Directiva v-permission para verificar permisos
app.directive('permission', {
  beforeMount(el, binding) {
    const authStore = useAuthStore()
    const { module, action } = binding.value

    if (!authStore.hasPermission(module, action)) {
      // Remover elemento del DOM si no tiene permiso
      el.remove()
    }
  }
})

// Directiva v-permission-any para verificar múltiples permisos (cualquiera)
app.directive('permissionAny', {
  beforeMount(el, binding) {
    const authStore = useAuthStore()
    const permissions = binding.value // array de { module, action }

    const hasAnyPermission = permissions.some(perm =>
      authStore.hasPermission(perm.module, perm.action)
    )

    if (!hasAnyPermission) {
      el.remove()
    }
  }
})

app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
    Loading
  },
  config: {
    dark: true,
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

// Restaurar sesión ANTES de montar el router
const authStore = useAuthStore()
await authStore.restoreSession()

app.use(router)

app.mount('#app')
