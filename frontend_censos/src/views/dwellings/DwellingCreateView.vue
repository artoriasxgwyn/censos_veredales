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
              <q-input
                v-model="form.mapLocation"
                label="URL de Ubicación en Mapa"
                outlined
                type="url"
                hint="Enlace de Google Maps o similar"
                :error="hasError('mapLocation')"
                :error-message="getFieldError('mapLocation')"
              >
                <template v-slot:prepend>
                  <q-icon name="map" />
                </template>
              </q-input>
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
    cedulaPropietario: validation.data.cedulaPropietario,
    communityId: authStore.communityId
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
}

@media (max-width: 599px) {
  .page-header {
    gap: 8px;
    margin-bottom: 16px;
  }

  .title {
    font-size: 20px;
  }
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
  flex: 1;
}

.form-card {
  border-radius: 12px;
}

@media (max-width: 599px) {
  .form-card {
    padding: 16px !important;
  }
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 8px 0;
}

@media (max-width: 599px) {
  .section-title {
    font-size: 16px;
  }
}

.section-description {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0 0 24px 0;
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
  border: 2px dashed var(--outline-variant);
  border-radius: 8px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--surface-container-low);
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
  background: var(--surface-container-high);
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
  color: var(--on-surface);
  margin: 0;
}

.upload-hint {
  font-size: 12px;
  color: var(--outline);
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
}

.remove-photo-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>
