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
        <h2 class="main-title">Unirme a mi Comunidad</h2>
        <p class="main-subtitle">Regístrate en tu comunidad usando el código de verificación.</p>
      </div>

      <div class="content-grid">
        <!-- Left Column: Registration Form -->
        <div class="form-column">
          <form class="register-form" @submit.prevent="handleRegister">

            <!-- Section 1: Datos de la Comunidad -->
            <section class="form-section">
              <div class="section-header">
                <div class="section-icon primary-icon">
                  <span class="material-symbols-outlined">domain</span>
                </div>
                <h3 class="section-title">Datos de la Comunidad</h3>
              </div>

              <div class="form-grid">
                <div class="form-field full-width">
                  <label class="field-label">Buscar Comunidad por Código</label>
                  <div class="search-wrapper">
                    <input
                      v-model="communityCode"
                      @input="onCodeInput"
                      class="field-input"
                      placeholder="Ej. 123456"
                      type="text"
                      maxlength="6"
                    />
                    <span v-if="isSearching" class="search-loading">
                      <q-spinner size="20px" color="primary" />
                    </span>
                  </div>
                  <p class="field-hint">Solicita este código a tu presidente o secretario</p>
                </div>

                <!-- Resultados de búsqueda -->
                <div v-if="communityCode.length >= 1" class="search-results">
                  <!-- Coincidencias encontradas -->
                  <div v-if="matchingCommunities.length > 0" class="matching-list">
                    <p class="results-title">Comunidades encontradas:</p>
                    <div
                      v-for="community in matchingCommunities"
                      :key="community._id"
                      class="community-item"
                      :class="{ selected: foundCommunity?._id === community._id }"
                      @click="selectCommunity(community)"
                    >
                      <div class="community-item-info">
                        <h4 class="community-item-name">{{ community.neighborhood }}</h4>
                        <p class="community-item-detail">{{ community.city }}, {{ community.department }}</p>
                      </div>
                      <div class="community-item-code">
                        <span class="code-label">Código:</span>
                        <span class="code-value">{{ community.code }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- No hay coincidencias -->
                  <div v-else-if="communityCode.length >= 3 && !isSearching" class="no-results">
                    <span class="material-symbols-outlined">search_off</span>
                    <p>No se encontraron comunidades con ese código</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Section 2: Datos Personales -->
            <section class="form-section">
              <div class="section-header">
                <div class="section-icon tertiary-icon">
                  <span class="material-symbols-outlined">person</span>
                </div>
                <h3 class="section-title">Datos Personales</h3>
              </div>

              <div class="form-grid">
                <div class="form-field full-width" :class="{ 'has-error': hasError('fullName') }">
                  <label class="field-label">Nombre Completo</label>
                  <input v-model="form.fullName" class="field-input" type="text"/>
                  <span v-if="hasError('fullName')" class="error-message">{{ getFieldError('fullName') }}</span>
                </div>
                <div class="form-field" :class="{ 'has-error': hasError('documentNumber') }">
                  <label class="field-label">Cédula</label>
                  <input v-model="form.documentNumber" class="field-input" type="text" placeholder="Ej: 1234567890"/>
                  <span v-if="hasError('documentNumber')" class="error-message">{{ getFieldError('documentNumber') }}</span>
                </div>
                <div class="form-field" :class="{ 'has-error': hasError('phone') }">
                  <label class="field-label">Teléfono</label>
                  <input v-model="form.phone" class="field-input" type="tel" placeholder="3001234567"/>
                  <span v-if="hasError('phone')" class="error-message">{{ getFieldError('phone') }}</span>
                </div>
                <div class="form-field full-width" :class="{ 'has-error': hasError('email') }">
                  <label class="field-label">Correo Electrónico</label>
                  <input v-model="form.email" class="field-input" type="email"/>
                  <span v-if="hasError('email')" class="error-message">{{ getFieldError('email') }}</span>
                </div>
                <div class="form-field" :class="{ 'has-error': hasError('password') }">
                  <label class="field-label">Contraseña</label>
                  <input v-model="form.password" class="field-input" :type="isPwd ? 'password' : 'text'"/>
                  <span v-if="hasError('password')" class="error-message">{{ getFieldError('password') }}</span>
                </div>
                <div class="form-field" :class="{ 'has-error': hasError('confirmPassword') }">
                  <label class="field-label">Confirmar contraseña</label>
                  <div class="password-input-wrapper">
                    <input v-model="form.confirmPassword" class="field-input" :type="isPwd ? 'password' : 'text'"/>
                    <button @click.prevent="isPwd = !isPwd" class="toggle-password" type="button">
                      <span class="material-symbols-outlined">{{ isPwd ? 'visibility' : 'visibility_off' }}</span>
                    </button>
                  </div>
                  <span v-if="hasError('confirmPassword')" class="error-message">{{ getFieldError('confirmPassword') }}</span>
                </div>
              </div>
            </section>

            <!-- Section 3: Firma Digital -->
            <section class="form-section">
              <div class="section-header">
                <div class="section-icon secondary-icon">
                  <span class="material-symbols-outlined">draw</span>
                </div>
                <h3 class="section-title">Firma Digital</h3>
              </div>

              <div class="signature-section">
                <p class="signature-instruction">Firma en el recuadro usando tu dedo o mouse</p>
                <SignaturePad v-model="signatureData" />
              </div>
            </section>

            <!-- Info Card -->
            <div class="info-card">
              <span class="material-symbols-outlined info-icon">info</span>
              <h4 class="info-title">Proceso de Registro</h4>
              <p class="info-description">
                Después de registrarte, un censista te asignará a una vivienda. Luego, tu residencia será aprobada por el presidente, tesorero y secretario de tu comunidad.
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="form-actions">
              <button
                class="submit-button"
                type="submit"
                :disabled="loading"
              >
                <q-spinner v-if="loading" color="white" size="1.2em" class="spinner" />
                <span v-else>Registrarme</span>
              </button>
              <router-link to="/login" class="back-link">
                Volver al inicio de sesión
              </router-link>
            </div>
          </form>
        </div>

        <!-- Right Column: Info & Visuals -->
        <div class="side-column">
          <!-- Steps Card -->
          <div class="steps-card">
            <span class="material-symbols-outlined steps-icon">fact_check</span>
            <h4 class="steps-title">Pasos para ser Residente</h4>
            <ol class="steps-list">
              <li class="step-item">
                <span class="step-number">1</span>
                <span class="step-text">Regístrate con el código de tu comunidad</span>
              </li>
              <li class="step-item">
                <span class="step-number">2</span>
                <span class="step-text">Un censista te asignará una vivienda</span>
              </li>
              <li class="step-item">
                <span class="step-number">3</span>
                <span class="step-text">Espera la aprobación triple de los administradores</span>
              </li>
              <li class="step-item">
                <span class="step-number">4</span>
                <span class="step-text">¡Listo! Ya eres residente aprobado</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth.store'
import { useCommunityStore } from '@/stores/community.store'
import { uploadService } from '@/services/upload.service'
import SignaturePad from '@/components/SignaturePad.vue'
import { publicRegisterSchema } from '@/schemas/user.schema'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const communityStore = useCommunityStore()

// Cargar comunidades al montar
onMounted(async () => {
  allCommunities.value = await communityStore.fetchPublicCommunities()
})

const isPwd = ref(true)
const loading = ref(false)
const uploadingSignature = ref(false)
const communityCode = ref('')
const foundCommunity = ref(null)
const communityNotFound = ref(false)
const isSearching = ref(false)
const searchTimeout = ref(null)
const allCommunities = ref([])
const signatureData = ref('')
const errors = ref({})

const form = ref({
  fullName: '',
  documentNumber: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Helpers para errores
const getFieldError = (field) => errors.value[field] || null
const hasError = (field) => !!getFieldError(field)

const searchCommunity = async () => {
  if (!communityCode.value.trim()) {
    foundCommunity.value = null
    communityNotFound.value = false
    return
  }

  // Solo buscar si tiene 6 dígitos
  if (communityCode.value.length !== 6) {
    foundCommunity.value = null
    communityNotFound.value = false
    return
  }

  isSearching.value = true
  foundCommunity.value = null
  communityNotFound.value = false

  const result = await communityStore.findCommunityByCode(communityCode.value.trim())

  if (result.success) {
    foundCommunity.value = result.data
  } else {
    communityNotFound.value = true
  }
  isSearching.value = false
}

// Búsqueda con debounce al escribir
const onCodeInput = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  // Si tiene menos de 3 dígitos, limpiar resultados
  if (communityCode.value.length < 3) {
    foundCommunity.value = null
    communityNotFound.value = false
    return
  }

  searchTimeout.value = setTimeout(() => {
    searchCommunity()
  }, 300)
}

// Comunidades que coinciden con el código escrito
const matchingCommunities = computed(() => {
  if (communityCode.value.length < 1) return []
  const code = communityCode.value.trim()
  return allCommunities.value.filter(c => c.code.startsWith(code))
})

// Seleccionar una comunidad de la lista
const selectCommunity = (community) => {
  communityCode.value = community.code
  foundCommunity.value = community
  communityNotFound.value = false
}

const handleRegister = async () => {
  // Resetear errores previos
  errors.value = {}

  // Validar con Zod
  const dataToValidate = {
    fullName: form.value.fullName,
    documentNumber: form.value.documentNumber,
    phone: form.value.phone.replace(/-/g, ''),
    email: form.value.email,
    password: form.value.password,
    confirmPassword: form.value.confirmPassword,
    communityCode: communityCode.value,
    digitalSignature: signatureData.value
  }

  const validation = publicRegisterSchema.safeParse(dataToValidate)
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

  if (!foundCommunity.value) {
    $q.notify({
      type: 'warning',
      message: 'Primero debes seleccionar una comunidad válida de la lista'
    })
    return
  }

  loading.value = true

  try {
    // 1. Convertir firma a blob y subir a Cloudinary
    uploadingSignature.value = true
    const canvas = document.createElement('canvas')
    const img = new Image()

    await new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        resolve()
      }
      img.src = signatureData.value
    })

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    const file = new File([blob], 'firma.png', { type: 'image/png' })

    const signatureUrl = await uploadService.uploadImage(file, 'signature')
    uploadingSignature.value = false

    // 2. Registrar usuario con la firma (datos ya validados por Zod)
    const registerData = {
      communityCode: validation.data.communityCode,
      fullName: validation.data.fullName,
      documentNumber: validation.data.documentNumber,
      phone: validation.data.phone,
      email: validation.data.email,
      password: validation.data.password,
      digitalSignature: signatureUrl
    }

    const result = await authStore.register(registerData)

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Registro exitoso. Un censista te contactará para asignarte una vivienda.'
      })
      router.push('/login')
    } else {
      $q.notify({
        type: 'negative',
        message: `${result.message}`,
        html: true,
        timeout: 5000
      })
    }
  } catch (error) {
    console.error('Error en registro:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al subir la firma. Intente nuevamente.'
    })
  } finally {
    loading.value = false
    uploadingSignature.value = false
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

.secondary-icon {
  background: var(--secondary);
  color: var(--on-secondary);
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

.field-hint {
  font-size: 11px;
  color: var(--outline);
  margin: 4px 4px 0 4px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-loading {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-results {
  margin-top: 16px;
}

.results-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--on-surface-variant);
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.matching-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.community-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--surface-container-low);
  border: 1px solid var(--surface-container-highest);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.community-item:hover {
  background: var(--surface-container-high);
  border-color: var(--primary);
}

.community-item.selected {
  background: var(--tertiary-fixed);
  border-color: var(--tertiary);
}

.community-item-info {
  flex: 1;
}

.community-item-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 2px 0;
}

.community-item-detail {
  font-size: 11px;
  color: var(--on-surface-variant);
  margin: 0;
}

.community-item-code {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.code-label {
  font-size: 10px;
  color: var(--outline);
  text-transform: uppercase;
}

.code-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
  font-family: monospace;
  background: var(--surface-container);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.no-results {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--surface-container);
  border-radius: var(--radius-md);
  color: var(--on-surface-variant);
}

.no-results .material-symbols-outlined {
  font-size: 24px;
  color: var(--outline);
}

.no-results p {
  font-size: 13px;
  margin: 0;
}

.community-found {
  margin-top: 16px;
}

.community-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--tertiary-fixed);
  border: 1px solid var(--tertiary);
  border-radius: var(--radius-md);
}

.community-icon {
  width: 40px;
  height: 40px;
  background: var(--tertiary);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.community-icon .material-symbols-outlined {
  color: var(--on-tertiary);
  font-size: 24px;
}

.community-info {
  flex: 1;
}

.community-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 4px 0;
}

.community-detail {
  font-size: 12px;
  color: var(--on-surface-variant);
  margin: 0;
}

.community-code {
  font-size: 12px;
  color: var(--on-surface-variant);
  margin: 4px 0 0 0;
}

.community-not-found {
  margin-top: 16px;
  padding: 12px 16px;
  background: var(--error-fixed);
  border: 1px solid var(--error);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 12px;
}

.community-not-found .material-symbols-outlined {
  color: var(--error);
  font-size: 20px;
}

.community-not-found p {
  font-size: 13px;
  color: var(--on-surface-variant);
  margin: 0;
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

/* Info Card */
.info-card {
  background: var(--primary-fixed-dim);
  padding: 20px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--primary);
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.info-icon {
  font-size: 24px;
  color: var(--primary);
  flex-shrink: 0;
}

.info-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--on-primary-fixed-variant);
  margin: 0 0 4px 0;
}

.info-description {
  font-size: 12px;
  color: var(--on-surface-variant);
  margin: 0;
  line-height: 1.5;
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

/* Steps Card */
.steps-card {
  background: var(--tertiary-fixed-dim);
  padding: 24px;
  border-radius: var(--radius-xl);
  color: var(--on-primary-fixed-variant);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--tertiary);
}

.steps-icon {
  font-size: 32px;
  color: var(--tertiary);
  display: block;
  margin-bottom: 16px;
}

.steps-title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0 0 16px 0;
  color: var(--on-surface);
}

.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.step-number {
  width: 24px;
  height: 24px;
  background: var(--tertiary);
  color: var(--on-tertiary);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.step-text {
  font-size: 13px;
  color: var(--on-surface-variant);
  line-height: 1.4;
}

/* Signature Section */
.signature-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.signature-instruction {
  font-size: 13px;
  color: var(--on-surface-variant);
  margin: 0;
}
</style>
