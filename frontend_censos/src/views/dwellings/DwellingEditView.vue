<template>
  <div class="page-container">
    <div class="page-header">
      <q-btn
        flat
        icon="arrow_back"
        label="Volver"
        @click="router.back()"
      />
      <h1 class="title">Editar Vivienda</h1>
    </div>

    <q-card class="form-card">
      <q-card-section>
        <h2 class="section-title">Información de la Vivienda</h2>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="form">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.houseNomenclature"
                label="Nomenclatura de la Vivienda"
                outlined
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
                :error="false"
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
              <q-input
                v-model="form.homePhoto"
                label="URL de Foto del Hogar"
                outlined
                type="url"
              >
                <template v-slot:prepend>
                  <q-icon name="photo" />
                </template>
              </q-input>
            </div>

            <div class="col-12">
              <q-select
                v-model="form.ownerUserId"
                :options="userOptions"
                option-value="_id"
                option-label="fullName"
                label="Propietario (Usuario)"
                outlined
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-select>
            </div>

            <div class="col-12">
              <q-select
                v-model="form.status"
                :options="statusOptions"
                label="Estado"
                outlined
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="toggle_on" />
                </template>
              </q-select>
            </div>

            <div class="col-12">
              <q-toggle
                v-model="form.isActive"
                label="Vivienda Activa"
              />
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
              label="Guardar Cambios"
              :loading="dwellingStore.loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useDwellingStore } from '@/stores/dwelling.store'
import { useUserStore } from '@/stores/user.store'
import MapLocationPicker from '@/components/MapLocationPicker.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const dwellingStore = useDwellingStore()
const userStore = useUserStore()

const dwellingId = computed(() => route.params.id)

const statusOptions = [
  { label: 'Pendiente', value: 'pending' },
  { label: 'Aprobada', value: 'approved' },
  { label: 'Rechazada', value: 'rejected' }
]

const form = ref({
  houseNomenclature: '',
  arrivalInstructions: '',
  mapLocation: '',
  constructionDate: '',
  homePhoto: '',
  ownerUserId: '',
  status: 'pending',
  isActive: true
})

const userOptions = computed(() => {
  return userStore.users.map(u => ({
    _id: u._id,
    fullName: u.fullName
  }))
})

onMounted(async () => {
  await dwellingStore.fetchDwellingById(dwellingId.value)
  await userStore.fetchAllUsersPublic()

  const dwelling = dwellingStore.currentDwelling
  if (dwelling) {
    form.value = {
      houseNomenclature: dwelling.houseNomenclature || '',
      arrivalInstructions: dwelling.arrivalInstructions || '',
      mapLocation: dwelling.mapLocation || '',
      constructionDate: dwelling.constructionDate ? new Date(dwelling.constructionDate).toISOString().split('T')[0] : '',
      homePhoto: dwelling.homePhoto || '',
      ownerUserId: typeof dwelling.ownerUserId === 'object' ? dwelling.ownerUserId._id : dwelling.ownerUserId,
      status: dwelling.status || 'pending',
      isActive: dwelling.isActive ?? true
    }
  }
})

const handleSubmit = async () => {
  const updateData = {
    houseNomenclature: form.value.houseNomenclature || undefined,
    arrivalInstructions: form.value.arrivalInstructions,
    mapLocation: form.value.mapLocation || undefined,
    constructionDate: form.value.constructionDate || undefined,
    homePhoto: form.value.homePhoto || undefined,
    ownerUserId: form.value.ownerUserId,
    status: form.value.status,
    isActive: form.value.isActive
  }

  const result = await dwellingStore.updateDwelling(dwellingId.value, updateData)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Vivienda actualizada exitosamente',
      timeout: 3000
    })
    router.push(`/admin/dwellings/${dwellingId.value}`)
  } else {
    const errorMsg = result.message || ''

    if (errorMsg.toLowerCase().includes('permiso') || errorMsg.toLowerCase().includes('autorización')) {
      $q.notify({
        type: 'negative',
        message: 'No tienes permisos para editar',
        caption: 'Se requiere autorización de administrador',
        timeout: 4000
      })
    } else if (errorMsg.toLowerCase().includes('no existe') || errorMsg.toLowerCase().includes('not found')) {
      $q.notify({
        type: 'negative',
        message: 'Vivienda no encontrada',
        caption: 'La vivienda no existe o fue eliminada',
        timeout: 4000
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Error al actualizar vivienda',
        caption: errorMsg,
        timeout: 5000
      })
    }
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

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--on-surface-strong);
  margin: 0 0 8px 0;
  border-bottom: 2px solid var(--primary);
  padding-bottom: 8px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

/* Botón de cancelar con estilo outline */
:deep(.form-actions .q-btn--flat) {
  border: 1px solid var(--outline);
  color: var(--on-surface);
}

:deep(.form-actions .q-btn--flat:hover) {
  background: var(--surface-container-high);
  border-color: var(--on-surface-variant);
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

:deep(.form-card .q-select .q-field__native) {
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

/* Q-toggle label blanco */
:deep(.form-card .q-toggle__label) {
  color: #ffffff !important;
}

/* Dropdown menu oscuro para q-select */
:deep(.q-menu) {
  background: var(--surface-container) !important;
  border: 1px solid var(--border);
}

:deep(.q-menu .q-item) {
  color: #ffffff !important;
}

:deep(.q-menu .q-item---active) {
  background: var(--primary) !important;
}

:deep(.q-menu .q-item .q-item__label) {
  color: #ffffff !important;
}

:deep(.q-menu .q-item .q-item__section) {
  color: #ffffff !important;
}
</style>
