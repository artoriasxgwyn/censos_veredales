<template>
  <div class="page-container">
    <div class="page-header">
      <q-btn
        flat
        icon="arrow_back"
        label="Volver"
        @click="router.back()"
      />
      <h1 class="title">Nueva Vivienda</h1>
    </div>

    <q-card class="form-card">
      <q-card-section>
        <h2 class="section-title">Información de la Vivienda</h2>
        <p class="section-description">
          Registra una nueva vivienda. Requerirá aprobación del presidente, tesorero y secretario.
        </p>
        <div class="community-code-display" v-if="authStore.communityCode">
          <span class="material-symbols-outlined">badge</span>
          <span class="community-code-label">Código de Comunidad:</span>
          <span class="community-code-value">{{ authStore.communityCode }}</span>
        </div>
        <div class="community-code-display error" v-else>
          <span class="material-symbols-outlined">warning</span>
          <span class="community-code-label">Sin comunidad asignada</span>
          <span class="community-code-value">Contacta al administrador</span>
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="form">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.houseNomenclature"
                label="Nomenclatura de la Vivienda"
                outlined
                hint="Ej: Carrera 15 #123-45"
                :error="hasError('houseNomenclature')"
                :error-message="getFieldError('houseNomenclature')"
              >
                <template v-slot:prepend>
                  <q-icon name="home" />
                </template>
              </q-input>
            </div>

            <div class="col-12">
              <q-input
                v-model="form.arrivalInstructions"
                label="Instrucciones de Llegada"
                type="textarea"
                outlined
                hint="Descripción de cómo llegar a la vivienda"
                :error="hasError('arrivalInstructions')"
                :error-message="getFieldError('arrivalInstructions')"
              >
                <template v-slot:prepend>
                  <q-icon name="directions" />
                </template>
              </q-input>
            </div>

            <div class="col-12">
              <MapLocationPicker
                v-model="form.mapLocation"
                label="Ubicación de la vivienda"
                hint="Haz clic en el mapa para seleccionar la ubicación exacta"
                :error="hasError('mapLocation')"
                :errorMessage="getFieldError('mapLocation')"
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="form.constructionDate"
                label="Fecha de Construcción"
                type="date"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_today" />
                </template>
              </q-input>
            </div>

            <div class="col-12">
              <div class="photo-upload-section">
                <label class="upload-label">Foto de la Vivienda</label>
                <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    @change="handleFileSelect"
                    class="file-input"
                  />
                  <div v-if="!photoPreview" class="upload-placeholder">
                    <q-icon name="add_a_photo" size="48px" color="primary" />
                    <p class="upload-text">Toca para tomar o seleccionar una foto</p>
                    <p class="upload-hint">o arrastra la imagen aquí</p>
                  </div>
                  <div v-else class="preview-container">
                    <img :src="photoPreview" alt="Vista previa" class="preview-image" />
                    <q-btn
                      flat
                      round
                      color="white"
                      icon="delete"
                      class="remove-photo-btn"
                      @click.stop="removePhoto"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12">
              <q-input
                v-model="form.cedulaPropietario"
                label="Cédula del Propietario"
                outlined
                hint="Si el propietario está registrado, se vinculará automáticamente"
                mask="# ### ### ###"
                fill-mask
                :error="hasError('cedulaPropietario')"
                :error-message="getFieldError('cedulaPropietario')"
              >
                <template v-slot:prepend>
                  <q-icon name="badge" />
                </template>
              </q-input>
            </div>
          </div>

          <div class="form-actions">
            <q-btn
              color="grey"
              label="Cancelar"
              flat
              @click="router.back()"
            />
            <q-btn
              type="submit"
              color="primary"
              label="Crear Vivienda"
              :loading="dwellingStore.loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useDwellingStore } from '@/stores/dwelling.store'
import { useAuthStore } from '@/stores/auth.store'
import { uploadService } from '@/services/upload.service'
import { createDwellingSchema } from '@/schemas/dwelling.schema'
import MapLocationPicker from '@/components/MapLocationPicker.vue'

const router = useRouter()
const $q = useQuasar()
const dwellingStore = useDwellingStore()
const authStore = useAuthStore()

const errors = ref({})
const form = ref({
  houseNomenclature: '',
  arrivalInstructions: '',
  mapLocation: '',
  constructionDate: '',
  homePhoto: null,
  cedulaPropietario: ''
})

const uploadingPhoto = ref(false)
const photoPreview = ref(null)

const fileInputRef = ref(null)

// Helpers para errores
const getFieldError = (field) => errors.value[field] || null
const hasError = (field) => !!getFieldError(field)

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.homePhoto = file
    photoPreview.value = URL.createObjectURL(file)
  }
}

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    form.value.homePhoto = file
    photoPreview.value = URL.createObjectURL(file)
  }
}

const removePhoto = () => {
  form.value.homePhoto = null
  photoPreview.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const handleSubmit = async () => {
  // Resetear errores previos
  errors.value = {}

  // Preparar datos para validación
  const dataToValidate = {
    houseNomenclature: form.value.houseNomenclature || undefined,
    arrivalInstructions: form.value.arrivalInstructions,
    mapLocation: form.value.mapLocation || undefined,
    constructionDate: form.value.constructionDate || undefined,
    cedulaPropietario: form.value.cedulaPropietario.replace(/[^0-9]/g, '')
  }

  // Validar con Zod
  const validation = createDwellingSchema.safeParse(dataToValidate)
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

  uploadingPhoto.value = true
  let homePhotoUrl = null

  // Subir foto si hay una seleccionada
  if (form.value.homePhoto) {
    try {
      homePhotoUrl = await uploadService.uploadImage(form.value.homePhoto, 'facade')
    } catch (error) {
      uploadingPhoto.value = false
      $q.notify({
        type: 'negative',
        message: 'Error al subir la foto. Intente nuevamente.'
      })
      return
    }
  }

  uploadingPhoto.value = false

  // Datos ya validados por Zod
  const dwellingData = {
    houseNomenclature: validation.data.houseNomenclature,
    arrivalInstructions: validation.data.arrivalInstructions,
    mapLocation: validation.data.mapLocation,
    constructionDate: validation.data.constructionDate,
    homePhoto: homePhotoUrl,
    cedulaPropietario: validation.data.cedulaPropietario
  }

  const result = await dwellingStore.createDwelling(dwellingData)

  if (result.success) {
    const message = result.data.ownerUserId
      ? 'Vivienda creada. El propietario está registrado en el sistema.'
      : 'Vivienda creada. El propietario no está registrado en el sistema.';

    $q.notify({
      type: 'positive',
      message,
      timeout: 4000
    })
    router.push('/admin/dwellings')
  } else {
    $q.notify({
      type: 'negative',
      message: result.message || 'Error al crear vivienda'
    })
  }
}
</script>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
  background: var(--background-dark);
  min-height: 100vh;
}

@media (max-width: 599px) {
  .page-container {
    padding: 16px;
  }
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
}

.page-header .title {
  color: var(--white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.page-header .q-btn {
  color: var(--white);
}

.page-header .q-btn .q-btn__content {
  color: var(--white);
}

@media (max-width: 599px) {
  .page-header {
    gap: 8px;
    margin-bottom: 16px;
    padding: 16px;
  }

  .page-header .title {
    font-size: 20px;
  }
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  flex: 1;
}

.form-card {
  border-radius: 12px;
  background: var(--surface-container);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border);
}

@media (max-width: 599px) {
  .form-card {
    padding: 16px !important;
  }
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--on-surface-strong);
  margin: 0 0 8px 0;
  border-bottom: 2px solid var(--primary);
  padding-bottom: 8px;
}

@media (max-width: 599px) {
  .section-title {
    font-size: 16px;
  }
}

.section-description {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0 0 8px 0;
  padding-left: 8px;
  border-left: 3px solid var(--primary-light);
}

.community-code-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--primary-50);
  border-radius: 8px;
  margin-top: 16px;
  border: 1px solid var(--primary);
}

.community-code-display.error {
  background: var(--error-container);
  border-color: var(--error);
}

.community-code-display .material-symbols-outlined {
  color: var(--primary);
  font-size: 20px;
}

.community-code-display.error .material-symbols-outlined {
  color: var(--error);
}

.community-code-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.community-code-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 0.1em;
  margin-left: auto;
  padding: 4px 12px;
  background: var(--white);
  border-radius: 4px;
  border: 1px solid var(--primary);
}

.community-code-display.error .community-code-value {
  background: var(--error);
  color: var(--on-error);
  border-color: var(--error);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (max-width: 599px) {
  .form {
    gap: 12px;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

@media (max-width: 599px) {
  .form-actions {
    flex-direction: column-reverse;
    gap: 8px;
    margin-top: 16px;
  }

  .form-actions .q-btn {
    width: 100%;
  }
}

/* Photo Upload Section */
.photo-upload-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.upload-area {
  border: 2px dashed var(--outline);
  border-radius: 8px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--surface-container-highest);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 599px) {
  .upload-area {
    padding: 16px;
    min-height: 160px;
  }
}

.upload-area:hover {
  border-color: var(--primary);
  background: var(--surface-container);
}

.upload-placeholder {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-text {
  font-size: 14px;
  color: var(--on-surface-strong);
  margin: 0;
  font-weight: 500;
}

.upload-hint {
  font-size: 12px;
  color: var(--on-surface-variant);
  margin: 0;
}

.file-input {
  display: none;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-image {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Botón de cancelar con estilo outline */
.form-actions .q-btn--flat {
  border: 1px solid var(--outline);
  color: var(--on-surface);
}

.form-actions .q-btn--flat:hover {
  background: var(--surface-container-high);
  border-color: var(--on-surface-variant);
}

.remove-photo-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* Textos en blanco para inputs y labels - override de Quasar */
:deep(.form-card .q-field--outlined .q-field__label) {
  color: #ffffff !important;
}

:deep(.form-card .q-field--outlined .q-field__native::placeholder) {
  color: #ffffff !important;
}

:deep(.form-card .q-field--outlined .q-field__native),
:deep(.form-card .q-field--outlined .q-textarea .q-field__native) {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

:deep(.form-card .q-field__messages div),
:deep(.form-card .q-field__hint),
:deep(.form-card .q-field__bottom .q-field__messages div) {
  color: #e2e8f0 !important;
}

:deep(.form-card .q-field__prepend .q-icon),
:deep(.form-card .q-field__append .q-icon) {
  color: #ffffff !important;
}

/* Quitar TODO borde azul en hover/focus */
:deep(.form-card .q-field--outlined .q-field__control) {
  border: 1px solid var(--outline) !important;
  border-radius: 4px;
}

:deep(.form-card .q-field--outlined:hover .q-field__control),
:deep(.form-card .q-field--outlined.q-field--focused .q-field__control) {
  border-color: var(--outline) !important;
}

:deep(.form-card .q-field--outlined .q-field__control:before),
:deep(.form-card .q-field--outlined .q-field__control:after) {
  border: none !important;
  display: none !important;
}

:deep(.form-card .q-field--focused .q-field__label) {
  color: #ffffff !important;
}

/* Quitar outline nativo del navegador */
:deep(.form-card .q-field__native:focus),
:deep(.form-card .q-field__native:focus-visible) {
  outline: none !important;
  box-shadow: none !important;
}

:deep(.form-card .q-field__control) {
  outline: none !important;
  box-shadow: none !important;
}

/* Ajustar color del icono de fecha en date input */
:deep(input[type="date"]::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}
</style>
