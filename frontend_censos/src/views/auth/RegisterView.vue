<template>
  <div class="register-page">
    <!-- TopAppBar -->
    <header class="top-app-bar">
      <div class="top-app-bar-content">
        <button @click="$router.push('/login')" class="icon-button">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 class="top-app-bar-title">Censos Veredales</h1>
      </div>
    </header>

    <main class="main-content">
      <div class="main-header">
        <h2 class="main-title">Nueva Comunidad</h2>
        <p class="main-subtitle">Inicia el proceso de digitalización y gestión de tu barrio.</p>
      </div>

      <div class="content-grid">
        <!-- Left Column: Registration Form -->
        <div class="form-column">
          <form class="register-form" @submit.prevent="handleRegister">

            <!-- Section 1: Datos Comunidad -->
            <section class="form-section">
              <div class="section-header">
                <div class="section-icon primary-icon">
                  <span class="material-symbols-outlined">domain</span>
                </div>
                <h3 class="section-title">Datos de la Comunidad</h3>
              </div>

              <div class="form-grid">
                <div class="form-field">
                  <label class="field-label">Barrio / Vereda</label>
                  <input v-model="community.neighborhood" required class="field-input" placeholder="Ej. Los Almendros" type="text"/>
                </div>
                <div class="form-field">
                  <label class="field-label">Ciudad</label>
                  <input v-model="community.city" required class="field-input" placeholder="Ej. Medellín" type="text"/>
                </div>
                <div class="form-field">
                  <label class="field-label">Departamento</label>
                  <input v-model="community.department" required class="field-input" placeholder="Ej. Antioquia" type="text"/>
                </div>
                <div class="form-field">
                  <label class="field-label">Residentes estimados</label>
                  <input v-model.number="community.estimatedResidentCount" class="field-input" placeholder="0" type="number"/>
                </div>
                <div class="form-field full-width">
                  <label class="field-label">Dirección Exacta (Salón Comunal)</label>
                  <input v-model="community.communityHallAddress" required class="field-input" placeholder="Carrera 45 # 12-34" type="text"/>
                </div>
              </div>
            </section>

            <!-- Section 2: Datos Presidente -->
            <section class="form-section">
              <div class="section-header">
                <div class="section-icon tertiary-icon">
                  <span class="material-symbols-outlined">shield_person</span>
                </div>
                <h3 class="section-title">Datos del Presidente</h3>
              </div>

              <div class="form-grid">
                <div class="form-field">
                  <label class="field-label">Nombre Completo</label>
                  <input v-model="president.fullName" required class="field-input" type="text"/>
                </div>
                <div class="form-field">
                  <label class="field-label">Cédula</label>
                  <input v-model="president.documentNumber" required class="field-input" type="text"/>
                </div>
                <div class="form-field">
                  <label class="field-label">Correo Electrónico</label>
                  <input v-model="president.email" required class="field-input" type="email"/>
                </div>
                <div class="form-field">
                  <label class="field-label">Teléfono</label>
                  <input v-model="president.phone" required class="field-input" type="tel"/>
                </div>
                <div class="form-field">
                  <label class="field-label">Contraseña</label>
                  <input v-model="president.password" required class="field-input" :type="isPwd ? 'password' : 'text'"/>
                </div>
                <div class="form-field">
                  <label class="field-label">Confirmar contraseña</label>
                  <div class="password-input-wrapper">
                    <input v-model="president.confirmPassword" required class="field-input" :type="isPwd ? 'password' : 'text'"/>
                    <button @click.prevent="isPwd = !isPwd" class="toggle-password" type="button">
                      <span class="material-symbols-outlined">{{ isPwd ? 'visibility' : 'visibility_off' }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- Action Buttons -->
            <div class="form-actions">
              <button
                class="submit-button"
                type="submit"
                :disabled="loading"
              >
                <q-spinner v-if="loading" color="white" size="1.2em" class="spinner" />
                <span v-else>Registrar comunidad</span>
              </button>
              <router-link to="/login" class="back-link">
                Volver al inicio de sesión
              </router-link>
            </div>
          </form>
        </div>

        <!-- Right Column: Info & Visuals (Bento Style) -->
        <div class="side-column">
          <!-- Impact Card -->
          <div class="impact-card">
            <span class="material-symbols-outlined impact-icon">analytics</span>
            <h4 class="impact-title">Impacto Comunal</h4>
            <p class="impact-description">
              Al registrar tu comunidad, obtienes acceso a herramientas de voto electrónico, gestión de presupuestos y comunicación directa con los residentes.
            </p>
            <div class="impact-stat">
              <span class="impact-value">+1.2k</span>
              <span class="impact-label">Barrios Activos</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCommunityStore } from '@/stores/community.store'

const router = useRouter()
const $q = useQuasar()
const communityStore = useCommunityStore()

const isPwd = ref(true)
const loading = ref(false)

const community = ref({
  neighborhood: '',
  city: '',
  department: '',
  estimatedResidentCount: null,
  communityHallAddress: '',
  mapLocation: ''
})

const president = ref({
  fullName: '',
  documentNumber: '',
  birthDate: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  if (president.value.password !== president.value.confirmPassword) {
    $q.notify({
      type: 'warning',
      message: 'Las contraseñas no coinciden'
    })
    return
  }

  loading.value = true

  const communityData = {
    neighborhood: community.value.neighborhood,
    city: community.value.city,
    department: community.value.department,
    communityHallAddress: community.value.communityHallAddress,
    mapLocation: community.value.mapLocation || undefined,
    estimatedResidentCount: community.value.estimatedResidentCount || undefined,
    president: {
      fullName: president.value.fullName,
      documentNumber: president.value.documentNumber.toString(),
      birthDate: president.value.birthDate || undefined,
      phone: president.value.phone.replace(/-/g, ''),
      email: president.value.email,
      password: president.value.password
    }
  }

  const result = await communityStore.createCommunity(communityData)

  loading.value = false

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: '¡Comunidad creada exitosamente! Ahora puedes iniciar sesión.'
    })
    router.push('/login')
  } else {
    $q.notify({
      type: 'negative',
      message: `${result.message}${result.errors ? ': ' + result.errors.join(', ') : ''}`,
      html: true,
      timeout: 5000
    })
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: var(--surface-container-low);
  color: var(--on-surface);
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
  padding: 8px;
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
}

.top-app-bar-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--primary);
  margin: 0;
}

/* Main Content */
.main-content {
  padding: 80px 16px 48px;
  max-width: 1280px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .main-content {
    padding: 80px 32px 48px;
  }
}

.main-header {
  margin-bottom: 32px;
}

.main-title {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--on-surface);
  margin: 0 0 8px 0;
  line-height: 1.1;
}

.main-subtitle {
  font-size: 18px;
  color: var(--on-surface-variant);
  margin: 0;
  line-height: 1.5;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}

@media (min-width: 1024px) {
  .content-grid {
    grid-template-columns: 2fr 1fr;
  }
}

/* Form Column */
.form-column {
  min-width: 0;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Form Section */
.form-section {
  background: var(--surface-container-lowest);
  padding: 32px;
  border-radius: var(--radius-xl);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--outline-variant);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.primary-icon {
  background: var(--primary);
  color: var(--on-primary);
}

.tertiary-icon {
  background: var(--tertiary);
  color: var(--on-tertiary);
}

.section-icon .material-symbols-outlined {
  font-size: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--on-surface);
  margin: 0;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--on-surface-variant);
  padding-left: 4px;
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

.password-input-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password .material-symbols-outlined {
  color: var(--outline-variant);
  font-size: 20px;
  transition: color 0.2s;
}

.toggle-password:hover .material-symbols-outlined {
  color: var(--primary);
}

/* Form Actions */
.form-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px;
}

.submit-button {
  width: 100%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: var(--on-primary);
  padding: 16px 24px;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 16px;
  letter-spacing: -0.01em;
  box-shadow: 0 4px 12px rgba(0, 40, 142, 0.3);
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-button:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 40, 142, 0.4);
}

.submit-button:active:not(:disabled) {
  transform: scale(0.98);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  flex-shrink: 0;
}

.back-link {
  text-align: center;
  color: var(--primary);
  font-weight: 500;
  letter-spacing: -0.01em;
  text-decoration: none;
  transition: all 0.2s;
}

.back-link:hover {
  text-decoration: underline;
}

/* Side Column */
.side-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Impact Card */
.impact-card {
  background: var(--primary-fixed-dim);
  padding: 24px;
  border-radius: var(--radius-xl);
  color: var(--on-primary-fixed);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--primary);
}

.impact-icon {
  font-size: 36px;
  display: block;
  margin-bottom: 16px;
}

.impact-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0 0 8px 0;
}

.impact-description {
  font-size: 13px;
  line-height: 1.6;
  opacity: 0.9;
  margin: 0;
}

.impact-stat {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 24px;
}

.impact-value {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.impact-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: var(--on-primary-fixed);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}
</style>
