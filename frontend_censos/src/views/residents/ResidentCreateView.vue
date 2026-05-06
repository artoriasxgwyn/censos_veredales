<template>
  <div class="page-container">
    <div class="page-header">
      <q-btn
        flat
        icon="arrow_back"
        label="Volver"
        @click="router.back()"
      />
      <h1 class="title">Nuevo Residente</h1>
    </div>

    <q-card class="form-card">
      <q-card-section>
        <h2 class="section-title">Información del Residente</h2>
        <p class="section-description">
          Registra un nuevo residente. Requerirá aprobación del presidente, tesorero y secretario.
        </p>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="form">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="form.userId"
                :options="userOptions"
                option-value="_id"
                option-label="fullName"
                label="Usuario"
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
                v-model="form.dwellingId"
                :options="dwellingOptions"
                option-value="_id"
                option-label="houseNomenclature"
                label="Vivienda"
                outlined
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="home" />
                </template>
              </q-select>
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
              label="Crear Residente"
              :loading="residentStore.loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useResidentStore } from '@/stores/resident.store'
import { useUserStore } from '@/stores/user.store'
import { useDwellingStore } from '@/stores/dwelling.store'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const $q = useQuasar()
const residentStore = useResidentStore()
const userStore = useUserStore()
const dwellingStore = useDwellingStore()
const authStore = useAuthStore()

const form = ref({
  userId: '',
  dwellingId: ''
})

const userOptions = computed(() => {
  return userStore.users.map(u => ({
    _id: u._id,
    fullName: u.fullName
  }))
})

const dwellingOptions = computed(() => {
  return dwellingStore.dwellings.map(d => ({
    _id: d._id,
    houseNomenclature: d.houseNomenclature || 'Sin nomenclatura'
  }))
})

onMounted(async () => {
  await Promise.all([
    userStore.fetchAllUsersPublic(),
    dwellingStore.fetchDwellings()
  ])
})

const handleSubmit = async () => {
  const residentData = {
    userId: form.value.userId,
    dwellingId: form.value.dwellingId,
    communityId: authStore.communityId
  }

  const result = await residentStore.createResident(residentData)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Residente creado exitosamente. Pendiente de aprobación.',
      caption: 'Requiere aprobación del presidente, tesorero y secretario',
      timeout: 5000
    })
    router.push('/admin/residents')
  } else {
    const errorMsg = result.message || ''

    if (errorMsg.toLowerCase().includes('ya existe') || errorMsg.toLowerCase().includes('duplicado')) {
      $q.notify({
        type: 'negative',
        message: 'El usuario ya es residente de esta vivienda',
        caption: 'No se puede registrar un residente duplicado',
        timeout: 4000
      })
    } else if (errorMsg.toLowerCase().includes('permiso') || errorMsg.toLowerCase().includes('autorización')) {
      $q.notify({
        type: 'negative',
        message: 'No tienes permisos para crear residentes',
        caption: 'Se requiere autorización de administrador',
        timeout: 4000
      })
    } else if (errorMsg.toLowerCase().includes('vivienda')) {
      $q.notify({
        type: 'negative',
        message: 'Error con la vivienda seleccionada',
        caption: errorMsg,
        timeout: 4000
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Error al crear residente',
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

.section-description {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0 0 24px 0;
  padding-left: 8px;
  border-left: 3px solid var(--primary-light);
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

/* Textos en blanco para inputs y labels */
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
:deep(.form-card .q-field__hint) {
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

/* Quitar outline nativo */
:deep(.form-card .q-field__native:focus),
:deep(.form-card .q-field__native:focus-visible) {
  outline: none !important;
  box-shadow: none !important;
}

:deep(.form-card .q-field__control) {
  outline: none !important;
  box-shadow: none !important;
}

/* Q-toggle label blanco */
:deep(.form-card .q-toggle__label) {
  color: #ffffff !important;
}

/* Ajustar icono de fecha */
:deep(input[type="date"]::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}
</style>
