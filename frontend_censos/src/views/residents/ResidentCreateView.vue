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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>
