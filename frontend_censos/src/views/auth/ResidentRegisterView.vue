<template>
  <div class="register-page">
    <!-- TopAppBar -->
    <header class="top-app-bar">
      <div class="top-app-bar-content">
        <button @click="$router.push('/login')" class="icon-button">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <span class="top-app-bar-title">Censos Veredales</span>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="register-container">
        <!-- Background Decorative Element -->
        <div class="decorative-bg"></div>

        <!-- Registration Card -->
        <div class="register-card">
          <!-- Header Section -->
          <div class="card-header">
            <h1 class="card-title">Registro de residente</h1>
            <p class="card-subtitle">Únete a tu comunidad hoy mismo.</p>
          </div>

          <!-- Info Message -->
          <div class="info-message">
            <span class="material-symbols-outlined info-icon">info</span>
            <p class="info-text">
              Tu cuenta quedará pendiente de aprobación por los administradores de la comunidad elegida.
            </p>
          </div>

          <!-- Form -->
          <form class="register-form" @submit.prevent="handleRegister">
            <div class="form-row">
              <div class="form-field">
                <label class="field-label">Nombre completo</label>
                <input v-model="form.fullName" class="field-input" placeholder="Ej: Juan Pérez" type="text"/>
              </div>
              <div class="form-field">
                <label class="field-label">Cédula</label>
                <input v-model="form.documentNumber" class="field-input" placeholder="12345678" type="text"/>
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label class="field-label">Correo</label>
                <input v-model="form.email" class="field-input" placeholder="correo@ejemplo.com" type="text"/>
              </div>
              <div class="form-field">
                <label class="field-label">Teléfono</label>
                <input v-model="form.phone" class="field-input" placeholder="3001234567" type="text"/>
              </div>
            </div>

            <!-- Community Dropdown -->
            <div class="form-field">
              <label class="field-label">Seleccionar comunidad</label>
              <div class="select-wrapper">
                <select v-model="form.communityId" class="field-select">
                  <option disabled value="">Elige tu comunidad</option>
                  <option v-for="c in communityStore.communities" :key="c._id" :value="c._id">
                    {{ c.neighborhood }} - {{ c.city }}, {{ c.department }}
                  </option>
                </select>
                <span class="material-symbols-outlined select-icon">expand_more</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label class="field-label">Contraseña</label>
                <input v-model="form.password" class="field-input" placeholder="••••••••" type="password"/>
              </div>
              <div class="form-field">
                <label class="field-label">Confirmar contraseña</label>
                <input v-model="form.confirmPassword" class="field-input" placeholder="••••••••" type="password"/>
              </div>
            </div>

            <!-- Action Button -->
            <button
              class="submit-button"
              type="submit"
              :disabled="loading"
            >
              <q-spinner v-if="loading" color="white" size="1.2em" />
              <span v-else>Registrarse</span>
            </button>
          </form>

          <!-- Footer Link -->
          <div class="card-footer">
            <p class="footer-text">
              ¿Ya tienes cuenta?
              <router-link to="/login" class="footer-link">Inicia sesión</router-link>
            </p>
          </div>
        </div>

        <!-- Community Impact Decorative Card -->
        <div class="impact-card">
          <div class="impact-content">
            <h3 class="impact-title">Crecimiento Local</h3>
            <p class="impact-description">+120 vecinos se han unido este mes</p>
          </div>
          <div class="impact-icon-wrapper">
            <span class="material-symbols-outlined impact-icon">trending_up</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth.store'
import { useCommunityStore } from '@/stores/community.store'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const communityStore = useCommunityStore()

const loading = ref(false)

const form = ref({
  fullName: '',
  documentNumber: '',
  email: '',
  phone: '',
  communityId: '',
  password: '',
  confirmPassword: ''
})

onMounted(async () => {
  await communityStore.fetchPublicCommunities()
})

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    $q.notify({
      type: 'warning',
      message: 'Las contraseñas no coinciden'
    })
    return
  }

  loading.value = true

  const userData = {
    fullName: form.value.fullName,
    documentNumber: form.value.documentNumber,
    email: form.value.email,
    phone: form.value.phone.replace(/-/g, ''),
    communityId: form.value.communityId,
    password: form.value.password
  }

  const result = await authStore.register(userData)

  loading.value = false

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: '¡Cuenta creada exitosamente! Espera la aprobación.'
    })
    router.push('/login')
  } else {
    // Analizar el mensaje de error para mostrar notificación específica
    const errorMsg = result.message || ''

    if (errorMsg.toLowerCase().includes('correo') || errorMsg.toLowerCase().includes('email')) {
      $q.notify({
        type: 'negative',
        message: 'Correo electrónico ya registrado',
        caption: 'Intenta con otro correo o inicia sesión',
        timeout: 4000,
        actions: [
          {
            label: 'Iniciar sesión',
            color: 'white',
            handler: () => router.push('/login')
          }
        ]
      })
    } else if (errorMsg.toLowerCase().includes('documento')) {
      $q.notify({
        type: 'negative',
        message: 'Documento ya registrado',
        caption: 'Si ya tienes cuenta, inicia sesión',
        timeout: 4000
      })
    } else if (errorMsg.toLowerCase().includes('comunidad')) {
      $q.notify({
        type: 'negative',
        message: 'Error con la comunidad seleccionada',
        caption: 'Verifica que la comunidad esté activa',
        timeout: 4000
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
        message: 'Error en el registro',
        caption: errorMsg,
        timeout: 5000
      })
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: var(--surface-container-low);
  color: var(--on-surface);
  display: flex;
  flex-direction: column;
}

/* Top App Bar */
.top-app-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--surface-container-lowest);
  backdrop-filter: blur(20px);
  box-shadow: 0 16px 32px rgba(25, 28, 30, 0.06);
}

.top-app-bar-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  height: 64px;
}

.icon-button {
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-button:hover {
  background: var(--surface-container-high);
}

.icon-button .material-symbols-outlined {
  color: var(--primary);
  font-size: 24px;
  line-height: 1;
}

.top-app-bar-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--primary);
}

/* Main Content */
.main-content {
  flex-grow: 1;
  padding: 80px 24px 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Register Container */
.register-container {
  width: 100%;
  max-width: 512px;
  position: relative;
}

/* Decorative Background */
.decorative-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 33%;
  height: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, transparent 100%);
  border-radius: 0 0 100% 0;
  opacity: 0.1;
  pointer-events: none;
}

/* Register Card */
.register-card {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: 48px;
  box-shadow: 0 16px 32px rgba(25, 28, 30, 0.06);
}

@media (min-width: 768px) {
  .register-card {
    padding: 64px;
  }
}

/* Card Header */
.card-header {
  text-align: center;
  margin-bottom: 40px;
}

@media (min-width: 768px) {
  .card-header {
    text-align: left;
  }
}

.card-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--on-surface);
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.card-subtitle {
  font-size: 14px;
  color: var(--on-surface-variant);
  font-weight: 500;
  margin: 0;
}

/* Info Message */
.info-message {
  background: var(--warning-fixed);
  border-left: 4px solid var(--warning);
  padding: 16px;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  margin-bottom: 32px;
  display: flex;
  gap: 12px;
}

.info-icon {
  color: var(--warning);
  font-size: 24px;
  flex-shrink: 0;
}

.info-text {
  color: var(--on-warning-fixed-variant);
  font-size: 14px;
  line-height: 1.5;
  font-weight: 500;
  margin: 0;
}

/* Register Form */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-field {
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
}

.field-input {
  width: 100%;
  padding: 12px 16px;
  background: var(--surface-container-low);
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--on-surface);
  transition: all 0.2s;
  outline: none;
}

.field-input::placeholder {
  color: var(--outline-variant);
}

.field-input:hover {
  background: var(--surface-container-high);
}

.field-input:focus {
  background: var(--surface-container-lowest);
  box-shadow: 0 0 0 2px var(--primary);
}

/* Select Wrapper */
.select-wrapper {
  position: relative;
}

.field-select {
  width: 100%;
  padding: 12px 40px 12px 16px;
  background: var(--surface-container-low);
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--on-surface);
  transition: all 0.2s;
  outline: none;
  cursor: pointer;
  appearance: none;
}

.field-select:hover {
  background: var(--surface-container-high);
}

.field-select:focus {
  background: var(--surface-container-lowest);
  box-shadow: 0 0 0 2px var(--primary);
}

.select-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--on-surface-variant);
  font-size: 24px;
  pointer-events: none;
}

/* Submit Button */
.submit-button {
  width: 100%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: var(--on-primary);
  padding: 16px 24px;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: -0.01em;
  box-shadow: 0 4px 12px rgba(0, 40, 142, 0.3);
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.submit-button:hover:not(:disabled) {
  box-shadow: 0 6px 16px rgba(0, 40, 142, 0.4);
  transform: translateY(-1px);
}

.submit-button:active:not(:disabled) {
  transform: scale(0.98);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Card Footer */
.card-footer {
  margin-top: 32px;
  text-align: center;
}

.footer-text {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0;
}

.footer-link {
  color: var(--primary);
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
}

.footer-link:hover {
  text-decoration: underline;
}

/* Impact Card */
.impact-card {
  margin-top: 32px;
  background: var(--primary-fixed-dim);
  padding: 24px;
  border-radius: var(--radius-xl);
  box-shadow: 0 16px 32px rgba(25, 28, 30, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.impact-content {
  flex: 1;
}

.impact-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--on-primary-fixed);
  margin: 0 0 4px 0;
}

.impact-description {
  font-size: 13px;
  color: var(--on-primary-fixed);
  opacity: 0.8;
  margin: 0;
}

.impact-icon-wrapper {
  background: var(--tertiary-container);
  padding: 12px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.impact-icon {
  color: var(--tertiary-fixed);
  font-size: 24px;
  line-height: 1;
}
</style>
