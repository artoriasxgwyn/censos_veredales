<template>
  <div class="reset-container">
    <div class="reset-card">
      <div class="reset-header">
        <div class="logo-container">
          <span class="material-symbols-outlined logo-icon">password</span>
        </div>
        <h1 class="title">Nueva Contraseña</h1>
        <p class="subtitle">Ingresa tu nueva contraseña</p>
      </div>

      <q-form @submit="handleResetPassword" class="reset-form">
        <q-input
          v-model="password"
          label="Nueva contraseña"
          :type="isPwd ? 'password' : 'text'"
          outlined
          :rules="[val => !!val || 'La contraseña es requerida', val => val.length >= 6 || 'Mínimo 6 caracteres']"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>

        <q-input
          v-model="confirmPassword"
          label="Confirmar contraseña"
          :type="isPwd ? 'password' : 'text'"
          outlined
          :rules="[val => !!val || 'Confirma tu contraseña', val => val === password || 'Las contraseñas no coinciden']"
        >
          <template v-slot:prepend>
            <q-icon name="lock_outline" />
          </template>
        </q-input>

        <q-btn
          type="submit"
          color="primary"
          label="Restablecer contraseña"
          class="full-width"
          :loading="authStore.loading"
          size="lg"
        />
      </q-form>

      <div class="reset-footer">
        <router-link to="/login" class="back-link">
          <q-icon name="arrow_back" size="sm" />
          Volver al inicio de sesión
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const isPwd = ref(true)
const password = ref('')
const confirmPassword = ref('')

const token = computed(() => route.query.token)

const handleResetPassword = async () => {
  if (!token.value) {
    $q.notify({
      type: 'negative',
      message: 'Token de recuperación no válido',
      caption: 'El enlace ha expirado o es inválido',
      timeout: 5000
    })
    return
  }

  if (password.value !== confirmPassword.value) {
    $q.notify({
      type: 'negative',
      message: 'Las contraseñas no coinciden',
      caption: 'Verifica que ambas contraseñas sean iguales',
      timeout: 4000
    })
    return
  }

  if (password.value.length < 6) {
    $q.notify({
      type: 'negative',
      message: 'Contraseña muy corta',
      caption: 'Debe tener al menos 6 caracteres',
      timeout: 4000
    })
    return
  }

  const result = await authStore.resetPassword(token.value, password.value)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Contraseña restablecida exitosamente',
      timeout: 3000
    })
    router.push('/login')
  } else {
    const errorMsg = result.message || ''

    if (errorMsg.toLowerCase().includes('token') || errorMsg.toLowerCase().includes('expirado')) {
      $q.notify({
        type: 'negative',
        message: 'Token expirado o inválido',
        caption: 'Solicita una nueva recuperación de contraseña',
        timeout: 5000,
        actions: [
          {
            label: 'Recuperar contraseña',
            color: 'white',
            handler: () => router.push('/forgot-password')
          }
        ]
      })
    } else if (errorMsg.toLowerCase().includes('contraseña') || errorMsg.toLowerCase().includes('password')) {
      $q.notify({
        type: 'negative',
        message: 'Error con la contraseña',
        caption: 'Debe tener al menos 6 caracteres',
        timeout: 4000
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Error al restablecer contraseña',
        caption: errorMsg,
        timeout: 5000
      })
    }
  }
}
</script>

<style scoped>
.reset-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--tertiary) 0%, var(--tertiary-container) 100%);
  padding: 20px;
}

.reset-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 420px;
}

.reset-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-container {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, var(--tertiary) 0%, var(--tertiary-container) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  font-size: 40px;
  color: white;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: var(--outline);
  margin: 0;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.reset-footer {
  margin-top: 24px;
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--tertiary);
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
