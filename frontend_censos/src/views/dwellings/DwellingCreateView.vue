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
                hint="Descripción de cómo llegar a la vivienda"
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
                hint="Enlace a la foto de la vivienda"
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
                :rules="[val => !!val || 'El propietario es requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useDwellingStore } from '@/stores/dwelling.store'
import { useUserStore } from '@/stores/user.store'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const $q = useQuasar()
const dwellingStore = useDwellingStore()
const userStore = useUserStore()
const authStore = useAuthStore()

const form = ref({
  houseNomenclature: '',
  arrivalInstructions: '',
  mapLocation: '',
  constructionDate: '',
  homePhoto: '',
  ownerUserId: ''
})

const userOptions = computed(() => {
  return userStore.users.map(u => ({
    _id: u._id,
    fullName: u.fullName
  }))
})

onMounted(async () => {
  await userStore.fetchAllUsersPublic()
})

const handleSubmit = async () => {
  const dwellingData = {
    houseNomenclature: form.value.houseNomenclature || undefined,
    arrivalInstructions: form.value.arrivalInstructions,
    mapLocation: form.value.mapLocation || undefined,
    constructionDate: form.value.constructionDate || undefined,
    homePhoto: form.value.homePhoto || undefined,
    ownerUserId: form.value.ownerUserId,
    communityId: authStore.communityId
  }

  const result = await dwellingStore.createDwelling(dwellingData)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Vivienda creada exitosamente. Pendiente de aprobación.'
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
