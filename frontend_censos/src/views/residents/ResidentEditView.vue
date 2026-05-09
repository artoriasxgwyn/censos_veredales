<template>
  <div class="page-container">
    <div class="page-header">
      <q-btn
        flat
        icon="arrow_back"
        label="Volver"
        @click="router.back()"
      />
      <h1 class="title">Editar Residente</h1>
    </div>

    <q-card class="form-card">
      <q-card-section>
        <h2 class="section-title">Información del Residente</h2>
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
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useResidentStore } from '@/stores/resident.store'
import { useUserStore } from '@/stores/user.store'
import { useDwellingStore } from '@/stores/dwelling.store'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const residentStore = useResidentStore()
const userStore = useUserStore()
const dwellingStore = useDwellingStore()

const residentId = computed(() => route.params.id)

const statusOptions = [
  { label: 'Pendiente', value: 'pending' },
  { label: 'Aprobado', value: 'approved' },
  { label: 'Rechazado', value: 'rejected' }
]

const form = ref({
  userId: '',
  dwellingId: '',
  status: 'pending'
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
  if (!authStore.hasPermission('resident', 'update')) {
    $q.notify({
      type: 'negative',
      message: 'Acceso denegado. No tienes permisos para editar residentes.'
    })
    router.push('/admin/dashboard')
    return
  }

  await Promise.all([
    residentStore.fetchResidentById(residentId.value),
    userStore.fetchAllUsersPublic(),
    dwellingStore.fetchDwellings()
  ])

  const resident = residentStore.currentResident
  if (resident) {
    form.value = {
      userId: typeof resident.userId === 'object' ? resident.userId._id : resident.userId,
      dwellingId: typeof resident.dwellingId === 'object' ? resident.dwellingId._id : resident.dwellingId,
      status: resident.status || 'pending'
    }
  }
})

const handleSubmit = async () => {
  // Validaciones de campos requeridos
  if (!form.value.userId) {
    $q.notify({
      type: 'warning',
      message: 'El usuario es requerido',
      timeout: 4000
    })
    return
  }

  if (!form.value.dwellingId) {
    $q.notify({
      type: 'warning',
      message: 'La vivienda es requerida',
      timeout: 4000
    })
    return
  }

  if (!form.value.status) {
    $q.notify({
      type: 'warning',
      message: 'El estado es requerido',
      timeout: 4000
    })
    return
  }

  // Confirmación antes de guardar
  $q.dialog({
    title: 'Confirmar actualización',
    message: '¿Estás seguro de que deseas actualizar este residente?',
    cancel: true,
    persistent: true,
    ok: {
      label: 'Guardar',
      color: 'primary',
      flat: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey',
      flat: true
    }
  }).onOk(async () => {
    const updateData = {
      userId: form.value.userId,
      dwellingId: form.value.dwellingId,
      status: form.value.status
    }

    const result = await residentStore.updateResident(residentId.value, updateData)

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Residente actualizado exitosamente'
      })
      router.push(`/admin/residents/${residentId.value}`)
    } else {
      $q.notify({
        type: 'negative',
        message: result.message || 'Error al actualizar residente'
      })
    }
  })
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

/* Bordes de inputs manejados globalmente en style.css */

/* Q-toggle label blanco */
:deep(.form-card .q-toggle__label) {
  color: #ffffff !important;
}

/* Ajustar icono de fecha */
:deep(input[type="date"]::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}
</style>
