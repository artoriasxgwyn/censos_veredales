<template>
  <div class="forgot-container">
    <div class="forgot-card">
      <div class="forgot-header">
        <div class="logo-container">
          <span class="material-symbols-outlined logo-icon">lock_reset</span>
        </div>
        <h1 class="title">Recuperar Contraseña</h1>
        <p class="subtitle">Ingresa tu correo electrónico para recibir las instrucciones de recuperación</p>
      </div>

      <q-form @submit="handleForgotPassword" class="forgot-form">
        <q-input
          v-model="email"
          label="Correo electrónico"
          type="email"
          outlined
          color="primary"
        >
          <template v-slot:prepend>
            <q-icon name="email" color="primary" />
          </template>
        </q-input>

        <q-btn
          type="submit"
          color="primary"
          label="Enviar instrucciones"
          class="full-width submit-btn"
          :loading="authStore.loading"
          size="lg"
        >
          <template v-slot:loading>
            <q-spinner-dots color="white" size="24px" />
          </template>
        </q-btn>
      </q-form>

      <div class="forgot-footer">
        <router-link to="/login" class="back-link">
          <span class="material-symbols-outlined">arrow_back</span>
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
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  padding: 20px;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

@media (max-width: 599px) {
  .forgot-container {
    padding: 16px;
  }
}

.forgot-card {
  background: var(--surface-container-lowest);
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 440px;
  border: 1px solid var(--surface-container-highest);
}

@media (max-width: 599px) {
  .forgot-card {
    padding: 32px 24px;
    max-width: 100%;
  }
}

.forgot-header {
  text-align: center;
  margin-bottom: 32px;
}

@media (max-width: 599px) {
  .forgot-header {
    margin-bottom: 24px;
  }
}

.logo-container {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 40, 142, 0.2);
}

@media (max-width: 599px) {
  .logo-container {
    width: 64px;
    height: 64px;
    margin: 0 auto 16px;
  }
}

.logo-icon {
  font-size: 40px;
  color: var(--white);
}

@media (max-width: 599px) {
  .logo-icon {
    font-size: 32px;
  }
}

.title {
  font-size: 26px;
  font-weight: 800;
  color: var(--on-surface);
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

@media (max-width: 599px) {
  .title {
    font-size: 22px;
  }
}

.subtitle {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 599px) {
  .subtitle {
    font-size: 13px;
  }
}

.forgot-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (max-width: 599px) {
  .forgot-form {
    gap: 16px;
  }
}

.submit-btn {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: var(--on-primary);
  padding: 14px 24px;
  border-radius: 10px;
  font-weight: 700;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(0, 40, 142, 0.3);
  transition: all 0.2s;
  font-size: 15px;
  letter-spacing: -0.01em;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 40, 142, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

.forgot-footer {
  margin-top: 28px;
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  padding: 8px 12px;
  border-radius: 8px;
}

.back-link:hover {
  background: var(--primary-50);
  text-decoration: none;
}

.back-link .material-symbols-outlined {
  font-size: 18px;
}

@media (max-width: 599px) {
  .back-link {
    font-size: 13px;
  }
}

/* Input styles */
.forgot-form :deep(.q-field) {
  width: 100% !important;
}

.forgot-form :deep(.q-field__control) {
  min-height: 56px !important;
}

.forgot-form :deep(.q-field__control:before),
.forgot-form :deep(.q-field__control::after) {
  border: none !important;
}

.forgot-form :deep(.q-field__native) {
  color: var(--on-surface) !important;
  min-height: 56px !important;
  outline: none !important;
  box-shadow: none !important;
}

.forgot-form :deep(.q-field__native:focus) {
  outline: none !important;
  box-shadow: none !important;
}

.forgot-form :deep(.q-field__label) {
  color: var(--on-surface-variant) !important;
}

.forgot-form :deep(.q-field__prepend .q-icon) {
  color: var(--primary) !important;
}
</style>
