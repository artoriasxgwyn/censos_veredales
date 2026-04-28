<template>
  <div class="forgot-container">
    <div class="forgot-card">
      <div class="forgot-header">
        <div class="logo-container">
          <span class="material-symbols-outlined logo-icon">lock_reset</span>
        </div>
        <h1 class="title">Recuperar Contraseña</h1>
        <p class="subtitle">Ingresa tu correo para recibir instrucciones</p>
      </div>

      <q-form @submit="handleForgotPassword" class="forgot-form">
        <q-input
          v-model="email"
          label="Correo electrónico"
          type="text"
          outlined
        >
          <template v-slot:prepend>
            <q-icon name="email" />
          </template>
        </q-input>

        <q-btn
          type="submit"
          color="primary"
          label="Enviar instrucciones"
          class="full-width"
          :loading="authStore.loading"
          size="lg"
        />
      </q-form>

      <div class="forgot-footer">
        <router-link to="/login" class="back-link">
          <q-icon name="arrow_back" size="sm" />
          Volver al inicio de sesión
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth.store'

const $q = useQuasar()
const authStore = useAuthStore()

const email = ref('')

const handleForgotPassword = async () => {
  const result = await authStore.forgotPassword(email.value)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Se han enviado instrucciones a tu correo',
      caption: 'Revisa tu bandeja de entrada y spam',
      timeout: 5000
    })
  } else {
    const errorMsg = result.message || ''

    if (errorMsg.toLowerCase().includes('email') || errorMsg.toLowerCase().includes('correo')) {
      $q.notify({
        type: 'negative',
        message: 'Correo no válido',
        caption: 'Verifica el correo ingresado',
        timeout: 4000
      })
    } else if (errorMsg.toLowerCase().includes('servidor') || errorMsg.toLowerCase().includes('smtp')) {
      $q.notify({
        type: 'negative',
        message: 'Error temporal',
        caption: 'No pudimos enviar el correo. Intenta más tarde',
        timeout: 5000
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Error al solicitar recuperación',
        caption: errorMsg,
        timeout: 5000
      })
    }
  }
}
</script>

<style scoped>
.forgot-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--tertiary) 0%, var(--tertiary-container) 100%);
  padding: 20px;
}

.forgot-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 420px;
}

.forgot-header {
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

.forgot-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.forgot-footer {
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
