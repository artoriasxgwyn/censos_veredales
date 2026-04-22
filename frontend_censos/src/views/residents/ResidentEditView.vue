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

            <div class="col-12">
              <q-toggle
                v-model="form.isActive"
                label="Residente Activo"
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
  status: 'pending',
  isActive: true
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
    residentStore.fetchResidentById(residentId.value),
    userStore.fetchAllUsersPublic(),
    dwellingStore.fetchDwellings()
  ])

  const resident = residentStore.currentResident
  if (resident) {
    form.value = {
      userId: typeof resident.userId === 'object' ? resident.userId._id : resident.userId,
      dwellingId: typeof resident.dwellingId === 'object' ? resident.dwellingId._id : resident.dwellingId,
      status: resident.status || 'pending',
      isActive: resident.isActive ?? true
    }
  }
})

const handleSubmit = async () => {
  const updateData = {
    userId: form.value.userId,
    dwellingId: form.value.dwellingId,
    status: form.value.status,
    isActive: form.value.isActive
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
