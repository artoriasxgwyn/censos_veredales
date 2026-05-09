<template>
  <div class="page-container">
    <div class="page-header">
      <q-btn
        flat
        icon="arrow_back"
        label="Volver"
        @click="router.back()"
      />
      <h1 class="title">Editar Comunidad</h1>
    </div>

    <q-card class="form-card">
      <q-card-section>
        <h2 class="section-title">Información de la Comunidad</h2>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="form">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.neighborhood"
                label="Nombre del Barrio"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="location_city" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.department"
                :options="departamentos"
                label="Departamento"
                outlined
                emit-value
                map-options
                @update:model-value="onDepartmentChange"
              >
                <template v-slot:prepend>
                  <q-icon name="map" />
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.city"
                :options="municipiosOptions"
                label="Ciudad / Municipio"
                outlined
                emit-value
                map-options
                :disable="!form.department"
              >
                <template v-slot:prepend>
                  <q-icon name="public" />
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model.number="form.estimatedResidentCount"
                label="Número Estimado de Residentes"
                type="number"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="people" />
                </template>
              </q-input>
            </div>

            <div class="col-12">
              <q-input
                v-model="form.communityHallAddress"
                label="Dirección del Salón Comunal"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="location_on" />
                </template>
              </q-input>
            </div>

            <div class="col-12">
              <MapLocationPicker
                v-model="form.mapLocation"
                label="Ubicación del salón comunal"
                hint="Haz clic en el mapa para seleccionar la ubicación exacta"
                :error="false"
              />
            </div>

            <div class="col-12">
              <q-select
                v-model="form.presidentId"
                :options="userOptions"
                option-value="_id"
                option-label="fullName"
                label="Presidente"
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
                v-model="form.treasurerId"
                :options="userOptions"
                option-value="_id"
                option-label="fullName"
                label="Tesorero"
                outlined
                emit-value
                map-options
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="account_balance_wallet" />
                </template>
              </q-select>
            </div>

            <div class="col-12">
              <q-select
                v-model="form.secretaryId"
                :options="userOptions"
                option-value="_id"
                option-label="fullName"
                label="Secretario"
                outlined
                emit-value
                map-options
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="assignment" />
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
              :loading="communityStore.loading"
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
import { useCommunityStore } from '@/stores/community.store'
import { useUserStore } from '@/stores/user.store'
import { useAuthStore } from '@/stores/auth.store'
import { departamentos, getMunicipios } from '@/data/colombia'
import MapLocationPicker from '@/components/MapLocationPicker.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const communityStore = useCommunityStore()
const userStore = useUserStore()
const authStore = useAuthStore()

onMounted(() => {
  if (!authStore.hasPermission('community', 'update')) {
    $q.notify({
      type: 'negative',
      message: 'Acceso denegado. No tienes permisos para editar comunidades.'
    })
    router.push('/admin/dashboard')
  }
})

const communityId = computed(() => route.params.id)

const form = ref({
  neighborhood: '',
  city: '',
  department: '',
  communityHallAddress: '',
  mapLocation: '',
  estimatedResidentCount: null,
  presidentId: '',
  treasurerId: null,
  secretaryId: null,
})

const municipiosOptions = computed(() => {
  return form.value.department ? getMunicipios(form.value.department) : []
})

const onDepartmentChange = () => {
  form.value.city = ''
}

const userOptions = computed(() => {
  return userStore.users.map(u => ({
    _id: u._id,
    fullName: u.fullName
  }))
})

onMounted(async () => {
  await communityStore.fetchCommunityById(communityId.value)
  await userStore.fetchAllUsersPublic()

  const community = communityStore.currentCommunity
  if (community) {
    form.value = {
      neighborhood: community.neighborhood || '',
      city: community.city || '',
      department: community.department || '',
      communityHallAddress: community.communityHallAddress || '',
      mapLocation: community.mapLocation || '',
      estimatedResidentCount: community.estimatedResidentCount || null,
      presidentId: typeof community.presidentId === 'object' ? community.presidentId._id : community.presidentId,
      treasurerId: typeof community.treasurerId === 'object' ? community.treasurerId?._id : community.treasurerId || null,
      secretaryId: typeof community.secretaryId === 'object' ? community.secretaryId?._id : community.secretaryId || null,
    }
  }
})

const handleSubmit = async () => {
  // Validaciones de campos requeridos
  if (!form.value.neighborhood?.trim()) {
    $q.notify({
      type: 'warning',
      message: 'El nombre del barrio es requerido',
      timeout: 4000
    })
    return
  }

  if (!form.value.department) {
    $q.notify({
      type: 'warning',
      message: 'El departamento es requerido',
      timeout: 4000
    })
    return
  }

  if (!form.value.city) {
    $q.notify({
      type: 'warning',
      message: 'La ciudad es requerida',
      timeout: 4000
    })
    return
  }

  if (!form.value.presidentId) {
    $q.notify({
      type: 'warning',
      message: 'El presidente de la comunidad es requerido',
      timeout: 4000
    })
    return
  }

  // Validar número estimado de residentes (si se proporciona)
  if (form.value.estimatedResidentCount && form.value.estimatedResidentCount < 1) {
    $q.notify({
      type: 'warning',
      message: 'El número de residentes debe ser mayor a 0',
      timeout: 4000
    })
    return
  }

  // Confirmación antes de guardar
  $q.dialog({
    title: 'Confirmar actualización',
    message: '¿Estás seguro de que deseas actualizar la información de esta comunidad?',
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
      neighborhood: form.value.neighborhood.trim(),
      city: form.value.city,
      department: form.value.department,
      communityHallAddress: form.value.communityHallAddress?.trim() || undefined,
      mapLocation: form.value.mapLocation || undefined,
      estimatedResidentCount: form.value.estimatedResidentCount || undefined,
      presidentId: form.value.presidentId,
      treasurerId: form.value.treasurerId || undefined,
      secretaryId: form.value.secretaryId || undefined,
    }

    const result = await communityStore.updateCommunity(communityId.value, updateData)

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Comunidad actualizada exitosamente'
      })
      router.push(`/admin/communities/${communityId.value}`)
    } else {
      $q.notify({
        type: 'negative',
        message: result.message || 'Error al actualizar comunidad'
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

/* Ajustar icono de fecha */
:deep(input[type="date"]::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}
</style>
