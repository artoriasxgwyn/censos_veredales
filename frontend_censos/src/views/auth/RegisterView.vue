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
                <div class="form-field" :class="{ 'has-error': hasError('neighborhood') }">
                  <label class="field-label">Barrio / Vereda</label>
                  <input v-model="community.neighborhood" class="field-input" placeholder="Ej. Los Almendros" type="text"/>
                  <span v-if="hasError('neighborhood')" class="error-message">{{ getFieldError('neighborhood') }}</span>
                </div>
                <div class="form-field" :class="{ 'has-error': hasError('department') }">
                  <label class="field-label">Departamento</label>
                  <select v-model="community.department" class="field-input" @change="onDepartmentChange">
                    <option value="" disabled>Selecciona un departamento</option>
                    <option v-for="dept in departamentos" :key="dept" :value="dept">{{ dept }}</option>
                  </select>
                  <span v-if="hasError('department')" class="error-message">{{ getFieldError('department') }}</span>
                </div>
                <div class="form-field" :class="{ 'has-error': hasError('city') }">
                  <label class="field-label">Ciudad / Municipio</label>
                  <select v-model="community.city" class="field-input" :disabled="!community.department">
                    <option value="" disabled>{{ community.department ? 'Selecciona un municipio' : 'Primero elige un departamento' }}</option>
                    <option v-for="mun in municipiosOptions" :key="mun" :value="mun">{{ mun }}</option>
                  </select>
                  <span v-if="hasError('city')" class="error-message">{{ getFieldError('city') }}</span>
                </div>
                <div class="form-field" :class="{ 'has-error': hasError('estimatedResidentCount') }">
                  <label class="field-label">Residentes estimados</label>
                  <input v-model.number="community.estimatedResidentCount" class="field-input" placeholder="0" type="number"/>
                  <span v-if="hasError('estimatedResidentCount')" class="error-message">{{ getFieldError('estimatedResidentCount') }}</span>
                </div>
                <div class="form-field full-width" :class="{ 'has-error': hasError('communityHallAddress') }">
                  <label class="field-label">Dirección Exacta (Salón Comunal)</label>
                  <input v-model="community.communityHallAddress" class="field-input" placeholder="Carrera 45 # 12-34" type="text"/>
                  <span v-if="hasError('communityHallAddress')" class="error-message">{{ getFieldError('communityHallAddress') }}</span>
                </div>
                <div class="form-field full-width" :class="{ 'has-error': hasError('mapLocation') }">
                  <label class="field-label">Ubicación en Mapa (Google Maps)</label>
                  <MapLocationPicker
                    v-model="community.mapLocation"
                    label="Seleccionar ubicación del salón comunal"
                    hint="Haz clic en el mapa para seleccionar la ubicación exacta"
                    :error="hasError('mapLocation')"
                    :errorMessage="getFieldError('mapLocation')"
                  />
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
                <div class="form-field" :class="{ 'has-error': hasError('fullName') }">
                  <label class="field-label">Nombre Completo</label>
                  <input v-model="president.fullName" class="field-input" type="text"/>
                  <span v-if="hasError('fullName')" class="error-message">{{ getFieldError('fullName') }}</span>
                </div>
                <div class="form-field" :class="{ 'has-error': hasError('documentNumber') }">
                  <label class="field-label">Cédula</label>
                  <input v-model="president.documentNumber" class="field-input" type="text" placeholder="Ej: 1234567890"/>
                  <span v-if="hasError('documentNumber')" class="error-message">{{ getFieldError('documentNumber') }}</span>
                </div>
                <div class="form-field" :class="{ 'has-error': hasError('email') }">
                  <label class="field-label">Correo Electrónico</label>
                  <input v-model="president.email" class="field-input" type="email"/>
                  <span v-if="hasError('email')" class="error-message">{{ getFieldError('email') }}</span>
                </div>
                <div class="form-field" :class="{ 'has-error': hasError('phone') }">
                  <label class="field-label">Teléfono</label>
                  <input v-model="president.phone" class="field-input" type="tel" placeholder="3001234567"/>
                  <span v-if="hasError('phone')" class="error-message">{{ getFieldError('phone') }}</span>
                </div>
                <div class="form-field" :class="{ 'has-error': hasError('password') }">
                  <label class="field-label">Contraseña</label>
                  <input v-model="president.password" class="field-input" :type="isPwd ? 'password' : 'text'"/>
                  <span v-if="hasError('password')" class="error-message">{{ getFieldError('password') }}</span>
                </div>
                <div class="form-field" :class="{ 'has-error': hasError('confirmPassword') }">
                  <label class="field-label">Confirmar contraseña</label>
                  <div class="password-input-wrapper">
                    <input v-model="president.confirmPassword" class="field-input" :type="isPwd ? 'password' : 'text'"/>
                    <button @click.prevent="isPwd = !isPwd" class="toggle-password" type="button">
                      <span class="material-symbols-outlined">{{ isPwd ? 'visibility' : 'visibility_off' }}</span>
                    </button>
                  </div>
                  <span v-if="hasError('confirmPassword')" class="error-message">{{ getFieldError('confirmPassword') }}</span>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCommunityStore } from '@/stores/community.store'
import { createCommunitySchema } from '@/schemas/community.schema'
import { departamentos, getMunicipios } from '@/data/colombia'
import MapLocationPicker from '@/components/MapLocationPicker.vue'

const router = useRouter()
const $q = useQuasar()
const communityStore = useCommunityStore()

const isPwd = ref(true)
const loading = ref(false)
const errors = ref({})

const community = ref({
  neighborhood: '',
  city: '',
  department: '',
  estimatedResidentCount: null,
  communityHallAddress: '',
  mapLocation: ''
})

const municipiosOptions = computed(() => {
  return community.value.department ? getMunicipios(community.value.department) : []
})

const onDepartmentChange = () => {
  community.value.city = ''
}

const president = ref({
  fullName: '',
  documentNumber: '',
  birthDate: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Validar y obtener errores de un campo
const getFieldError = (field) => errors.value[field] || errors.value[`president.${field}`] || null
const hasError = (field) => !!getFieldError(field)

const handleRegister = async () => {
  // Resetear errores previos
  errors.value = {}

  // Preparar datos para validación
  const dataToValidate = {
    neighborhood: community.value.neighborhood,
    city: community.value.city,
    department: community.value.department,
    communityHallAddress: community.value.communityHallAddress,
    mapLocation: community.value.mapLocation || undefined,
    estimatedResidentCount: community.value.estimatedResidentCount || undefined,
    president: {
      fullName: president.value.fullName,
      documentNumber: president.value.documentNumber,
      birthDate: president.value.birthDate || undefined,
      phone: president.value.phone.replace(/-/g, ''),
      email: president.value.email,
      password: president.value.password
    }
  }

  // Validar con Zod
  const validation = createCommunitySchema.safeParse(dataToValidate)
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

  // Verificar contraseñas
  if (president.value.password !== president.value.confirmPassword) {
    errors.value['president.confirmPassword'] = ['Las contraseñas no coinciden']
    $q.notify({
      type: 'warning',
      message: 'Las contraseñas no coinciden'
    })
    return
  }

  loading.value = true

  const communityData = {
    neighborhood: validation.data.neighborhood,
    city: validation.data.city,
    department: validation.data.department,
    communityHallAddress: validation.data.communityHallAddress,
    mapLocation: validation.data.mapLocation,
    estimatedResidentCount: validation.data.estimatedResidentCount,
    president: {
      fullName: validation.data.president.fullName,
      documentNumber: validation.data.president.documentNumber,
      birthDate: validation.data.president.birthDate,
      phone: validation.data.president.phone,
      email: validation.data.president.email,
      password: validation.data.president.password
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
  background: var(--success);
  color: var(--on-success);
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

select.field-input {
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
  cursor: pointer;
}

select.field-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field-input:hover {
  background: var(--surface-container-high);
}

.field-input:focus {
  background: var(--surface-container-lowest);
  box-shadow: 0 0 0 2px var(--primary);
}

.field-input.error {
  background: var(--error-container);
  box-shadow: 0 0 0 2px var(--error);
}

.form-field.has-error .field-input {
  background: var(--error-container);
  box-shadow: 0 0 0 2px var(--error);
}

.error-message {
  font-size: 11px;
  color: var(--error);
  margin-top: 4px;
  padding-left: 4px;
  display: block;
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
  background: var(--primary-50);
  padding: 24px;
  border-radius: var(--radius-xl);
  color: var(--on-primary-container);
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

/* MapLocationPicker styles */
.form-field.full-width :deep(.map-location-picker) {
  width: 100%;
}

.form-field.full-width :deep(.map-location-picker .q-field__label) {
  color: var(--on-surface-variant) !important;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding-left: 4px;
}

.form-field.full-width :deep(.map-location-picker .q-field__native) {
  color: var(--on-surface) !important;
  -webkit-text-fill-color: var(--on-surface) !important;
}

.form-field.full-width :deep(.map-location-picker .q-field__hint) {
  color: var(--on-surface-variant) !important;
  font-size: 12px;
}

.form-field.full-width :deep(.map-location-picker .q-icon) {
  color: var(--primary) !important;
}

.form-field.full-width :deep(.map-location-picker .q-field--outlined .q-field__control) {
  border: none !important;
  background: var(--surface-container-low) !important;
  border-radius: var(--radius-md) !important;
  padding: 4px 8px !important;
}

.form-field.full-width :deep(.map-location-picker .q-field--outlined .q-field__control:hover) {
  background: var(--surface-container-high) !important;
}

.form-field.full-width :deep(.map-location-picker .q-field--outlined .q-field__control:before),
.form-field.full-width :deep(.map-location-picker .q-field--outlined .q-field__control:after) {
  border: none !important;
}

.form-field.full-width :deep(.map-location-picker .q-btn) {
  color: var(--primary) !important;
}
</style>
