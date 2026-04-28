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
                :rules="[val => !!val || 'Las instrucciones son requeridas']"
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
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
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

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 8px 0;
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
}
</style>
