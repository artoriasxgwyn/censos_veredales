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
              <q-input
                v-model="form.city"
                label="Ciudad"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="public" />
                </template>
              </q-input>
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

            <div class="col-12">
              <q-toggle
                v-model="form.isActive"
                label="Comunidad Activa"
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

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const communityStore = useCommunityStore()
const userStore = useUserStore()

const communityId = computed(() => route.params.id)

const form = ref({
  neighborhood: '',
  city: '',
  communityHallAddress: '',
  mapLocation: '',
  estimatedResidentCount: null,
  presidentId: '',
  treasurerId: null,
  secretaryId: null,
  isActive: true
})

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
      communityHallAddress: community.communityHallAddress || '',
      mapLocation: community.mapLocation || '',
      estimatedResidentCount: community.estimatedResidentCount || null,
      presidentId: typeof community.presidentId === 'object' ? community.presidentId._id : community.presidentId,
      treasurerId: typeof community.treasurerId === 'object' ? community.treasurerId?._id : community.treasurerId || null,
      secretaryId: typeof community.secretaryId === 'object' ? community.secretaryId?._id : community.secretaryId || null,
      isActive: community.isActive ?? true
    }
  }
})

const handleSubmit = async () => {
  const updateData = {
    neighborhood: form.value.neighborhood,
    city: form.value.city,
    communityHallAddress: form.value.communityHallAddress,
    mapLocation: form.value.mapLocation || undefined,
    estimatedResidentCount: form.value.estimatedResidentCount || undefined,
    presidentId: form.value.presidentId,
    treasurerId: form.value.treasurerId || undefined,
    secretaryId: form.value.secretaryId || undefined,
    isActive: form.value.isActive
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
