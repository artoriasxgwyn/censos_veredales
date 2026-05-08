<template>
  <div class="auth-page">
    <main class="auth-main">
      <div class="auth-card">
        <!-- Logo Institucional -->
        <div class="auth-header">
          <div class="logo-container">
            <span class="material-symbols-outlined logo-icon">account_balance</span>
          </div>
          <h1 class="logo-title">Censos Veredales</h1>
          <p class="logo-subtitle">Gestión Institucional de Comunidades</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <!-- Campo de Email/Documento -->
          <div class="form-group" :class="{ 'has-error': hasError('email') }">
            <label class="field-label">Cédula o correo electrónico</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined input-icon">person</span>
              <input
                v-model="form.email"
                type="text"
                placeholder="Ej: 1.234.567-8 o usuario@mail.com"
                class="auth-input"
              />
            </div>
            <span v-if="hasError('email')" class="error-message">{{ getFieldError('email') }}</span>
          </div>

          <!-- Campo de Contraseña -->
          <div class="form-group" :class="{ 'has-error': hasError('password') }">
            <label class="field-label">Contraseña</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined input-icon">lock</span>
              <input
                v-model="form.password"
                :type="isPwd ? 'password' : 'text'"
                placeholder="••••••••"
                class="auth-input"
              />
              <button
                type="button"
                @click="isPwd = !isPwd"
                class="toggle-password"
                :aria-label="isPwd ? 'Mostrar contraseña' : 'Ocultar contraseña'"
              >
                <span class="material-symbols-outlined" aria-hidden="true">
                  {{ isPwd ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
            <span v-if="hasError('password')" class="error-message">{{ getFieldError('password') }}</span>
          </div>

          <!-- Olvidó contraseña -->
          <div class="forgot-password">
            <router-link to="/forgot-password" class="forgot-link">
              ¿Olvidaste tu contraseña?
            </router-link>
          </div>

          <!-- Botón de Login -->
          <button
            type="submit"
            class="auth-button"
            :disabled="authStore.loading"
          >
            <q-spinner v-if="authStore.loading" size="20px" color="white" />
            <span v-else>Iniciar sesión</span>
          </button>
        </form>

        <!-- Links inferiores -->
        <div class="auth-footer">
          <div class="footer-divider"></div>
          <div class="footer-links">
            <router-link to="/register" class="footer-link">
              Registrar nueva comunidad
            </router-link>
            <div class="create-account">
              <span class="no-account-text">¿Ya tienes código de comunidad?</span>
              <router-link to="/public-register" class="create-account-btn">
                Unirme a comunidad
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="auth-footer-legal">
      <p class="legal-text">© {{ currentYear }} CENSOS VEREDALES • SISTEMA DE GESTIÓN COMUNAL</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth.store'
import { loginSchema } from '@/schemas/user.schema'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const isPwd = ref(true)
const currentYear = new Date().getFullYear()
const errors = ref({})
const form = ref({
  email: '',
  password: ''
})

// Helpers para errores
const getFieldError = (field) => errors.value[field] || null
const hasError = (field) => !!getFieldError(field)

const handleLogin = async () => {
  // Resetear errores previos
  errors.value = {}

  // Validar con Zod
  const validation = loginSchema.safeParse({
    email: form.value.email,
    password: form.value.password
  })

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors
    errors.value = fieldErrors

    // Mostrar notificación con el primer error
    const firstError = Object.values(fieldErrors)[0]?.[0]
    $q.notify({
      type: 'warning',
      message: firstError || 'Error de validación'
    })
    return
  }

  const result = await authStore.login(validation.data.email, validation.data.password)

  console.log('[LoginView] Resultado login:', result)
  console.log('[LoginView] User role:', authStore.user?.role)
  console.log('[LoginView] isPresident:', authStore.isPresident)

  if (result.success) {
    // Redirigir según el rol
    let targetPath = '/login'
    if (authStore.isPresident) {
      targetPath = '/president/dashboard'
    } else if (authStore.isTreasurer || authStore.isSecretary) {
      targetPath = '/admin/dashboard'
    } else if (authStore.isCensista) {
      targetPath = '/censista/dashboard'
    } else if (authStore.isResident) {
      targetPath = '/resident/dashboard'
    }

    console.log('[LoginView] Redirigiendo a:', targetPath)

    // Esperar la navegación y solo mostrar éxito si funciona
    try {
      await router.push(targetPath)
      $q.notify({
        type: 'positive',
        message: '¡Bienvenido!'
      })
    } catch (navError) {
      console.error('[LoginView] Error en navegación:', navError)
      // Si falla navegación, hacer logout y mostrar error
      authStore.logout()
      $q.notify({
        type: 'negative',
        message: 'Error al iniciar sesión'
      })
    }
  } else {
    // Debug: ver qué mensaje llega del backend
    console.log('[LoginView] Error del login:', result)
    console.log('[LoginView] Mensaje:', result.message)

    // Analizar el mensaje de error para determinar qué campo falló
    const errorMsg = result.message || ''

    // Errores específicos según la respuesta del backend
    if (errorMsg.toLowerCase().includes('correo') || errorMsg.toLowerCase().includes('email') || errorMsg.toLowerCase().includes('usuario no encontrado')) {
      errors.value.email = ['El correo electrónico no está registrado']
      console.log('[LoginView] Mostrando notificación: email no registrado')
      $q.notify({
        type: 'negative',
        message: 'El correo electrónico no está registrado',
        caption: 'Verifica tu correo o crea una nueva cuenta'
      })
    } else if (errorMsg.toLowerCase().includes('contraseña') || errorMsg.toLowerCase().includes('password') || errorMsg.toLowerCase().includes('clave')) {
      errors.value.password = ['La contraseña es incorrecta']
      form.value.password = '' // Limpiar password
      console.log('[LoginView] Mostrando notificación: contraseña incorrecta')
      $q.notify({
        type: 'negative',
        message: 'La contraseña es incorrecta',
        caption: 'Intenta nuevamente o restablece tu contraseña'
      })
    } else if (errorMsg.toLowerCase().includes('rol') || errorMsg.toLowerCase().includes('role')) {
      // Usuario sin rol asignado (registro público sin vivienda)
      errors.value.email = ['Sin rol asignado']
      console.log('[LoginView] Mostrando notificación: sin rol')
      $q.notify({
        type: 'warning',
        message: 'Tu usuario no tiene un rol asignado',
        caption: 'Contacta al administrador de tu comunidad para que asigne tu rol',
        timeout: 5000
      })
    } else if (errorMsg.toLowerCase().includes('pendiente') || errorMsg.toLowerCase().includes('aprobación') || errorMsg.toLowerCase().includes('vivienda')) {
      // Residente pendiente de aprobación (sin vivienda asignada o sin triple aprobación)
      errors.value.email = ['Registro pendiente']
      console.log('[LoginView] Mostrando notificación: pendiente de aprobación')
      $q.notify({
        type: 'warning',
        message: 'Tu registro está pendiente',
        caption: 'Debes tener una vivienda asignada y la aprobación del presidente, tesorero y secretario',
        timeout: 5000
      })
    } else {
      // Error genérico "Credenciales inválidas" - no especificamos cuál para seguridad
      // Marcar ambos campos como con error
      errors.value.email = [' ']
      errors.value.password = [' ']
      form.value.password = '' // Limpiar password por seguridad
      console.log('[LoginView] Mostrando notificación: credenciales inválidas')
      $q.notify({
        type: 'negative',
        message: 'Credenciales inválidas',
        caption: 'El correo o la contraseña son incorrectos',
        timeout: 4000,
        actions: [
          {
            label: '¿Olvidaste tu contraseña?',
            color: 'white',
            handler: () => router.push('/forgot-password')
          }
        ]
      })
    }
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--surface-container-low);
}

.auth-main {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

@media (min-width: 640px) {
  .auth-main {
    padding: 48px;
  }
}

.auth-card {
  width: 100%;
  max-width: 440px;
  background: var(--surface-container-lowest);
  border-radius: var(--radius-xl);
  box-shadow: 0 16px 32px rgba(25, 28, 30, 0.06);
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (min-width: 640px) {
  .auth-card {
    padding: 48px;
  }
}

@media (max-width: 599px) {
  .auth-card {
    padding: 24px;
  }
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.logo-icon {
  font-size: 48px;
  color: var(--primary);
}

@media (max-width: 599px) {
  .logo-icon {
    font-size: 40px;
  }
}

.logo-title {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--primary);
  margin: 0;
}

@media (max-width: 599px) {
  .logo-title {
    font-size: 20px;
  }
}

.logo-subtitle {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--outline);
  margin: 4px 0 0 0;
}

@media (max-width: 599px) {
  .logo-subtitle {
    font-size: 12px;
  }
}

.auth-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--on-surface-variant);
  margin-left: 2px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: var(--outline);
  font-size: 20px;
  pointer-events: none;
}

.auth-input {
  width: 100%;
  padding: 14px 44px 14px 44px;
  background: var(--surface-container);
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--on-surface);
  transition: all 0.2s;
  outline: none;
}

.auth-input:hover {
  background: var(--surface-container-high);
}

.auth-input:focus {
  background: var(--surface-container-lowest);
  box-shadow: 0 0 0 2px var(--primary);
}

.auth-input.error {
  background: var(--error-container);
  box-shadow: 0 0 0 2px var(--error);
}

.form-group.has-error .auth-input {
  background: var(--error-container);
  box-shadow: 0 0 0 2px var(--error);
}

.error-message {
  font-size: 11px;
  color: var(--error);
  margin-top: 4px;
  padding-left: 2px;
  display: block;
}

.auth-input::placeholder {
  color: var(--outline);
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password .material-symbols-outlined {
  color: var(--outline);
  font-size: 20px;
  transition: color 0.2s;
}

.toggle-password:hover .material-symbols-outlined {
  color: var(--primary);
}

.forgot-password {
  display: flex;
  justify-content: flex-end;
}

.forgot-link {
  font-size: 12px;
  font-weight: 600;
  color: var(--info);
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: var(--primary);
}

.auth-button {
  width: 100%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: var(--on-primary);
  padding: 16px;
  border-radius: var(--radius-md);
  font-weight: 700;
  letter-spacing: -0.01em;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 40, 142, 0.3);
  transition: all 0.2s;
  text-transform: none;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  cursor: pointer;
}

@media (max-width: 599px) {
  .auth-button {
    padding: 14px;
    font-size: 13px;
  }
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 40, 142, 0.4);
}

.auth-button:active:not(:disabled) {
  transform: scale(0.98);
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-button .q-spinner {
  width: 20px;
  height: 20px;
}

.auth-footer {
  margin-top: 32px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.footer-divider {
  width: 100%;
  height: 1px;
  background: var(--surface-container);
}

.footer-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.footer-link {
  font-size: 14px;
  font-weight: 500;
  color: var(--on-surface-variant);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--primary);
}

.create-account {
  display: flex;
  align-items: center;
  gap: 8px;
}

.no-account-text {
  font-size: 14px;
  color: var(--on-surface-variant);
}

.create-account-btn {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-50);
  padding: 8px 20px;
  border-radius: var(--radius-full);
  text-decoration: none;
  transition: all 0.2s;
}

.create-account-btn:hover {
  background: var(--info-container);
}

.auth-footer-legal {
  padding: 32px;
  text-align: center;
}

.legal-text {
  font-size: 10px;
  color: var(--outline);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-weight: 500;
  margin: 0;
}
</style>
