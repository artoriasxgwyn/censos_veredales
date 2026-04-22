<template>
  <div class="page-container">
    <div class="page-header">
      <q-btn
        flat
        icon="arrow_back"
        label="Volver"
        @click="router.back()"
      />
      <h1 class="title">Detalle de Comunidad</h1>
      <div class="header-actions">
        <q-btn
          color="primary"
          label="Editar"
          icon="edit"
          @click="router.push(`/admin/communities/${communityId}/edit`)"
          v-if="canEdit"
        />
      </div>
    </div>

    <div v-if="!communityStore.loading && community" class="content">
      <q-card class="community-card">
        <q-card-section>
          <div class="community-header">
            <div class="community-icon">
              <span class="material-symbols-outlined">location_city</span>
            </div>
            <div>
              <h2 class="community-name">{{ community.neighborhood }}</h2>
              <p class="community-city">{{ community.city }}</p>
              <q-badge :color="community.isActive ? 'positive' : 'negative'">
                {{ community.isActive ? 'Activa' : 'Inactiva' }}
              </q-badge>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <h3 class="section-title">Información General</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Código de Comunidad</span>
              <span class="info-value">{{ community.code || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Dirección del Salón Comunal</span>
              <span class="info-value">{{ community.communityHallAddress || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Residentes Estimados</span>
              <span class="info-value">{{ community.estimatedResidentCount || 0 }}</span>
            </div>
            <div class="info-item" v-if="community.mapLocation">
              <span class="info-label">Ubicación en Mapa</span>
              <a :href="community.mapLocation" target="_blank" class="info-link">
                Ver ubicación
                <span class="material-symbols-outlined">open_in_new</span>
              </a>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <h3 class="section-title">Liderazgo</h3>
          <div class="leaders-grid">
            <div class="leader-card" v-if="community.presidentId">
              <div class="leader-icon bg-primary">
                <span class="material-symbols-outlined">person</span>
              </div>
              <div class="leader-info">
                <span class="leader-label">Presidente</span>
                <span class="leader-name">{{ getUserName(community.presidentId) }}</span>
              </div>
            </div>
            <div class="leader-card" v-if="community.treasurerId">
              <div class="leader-icon bg-secondary">
                <span class="material-symbols-outlined">account_balance_wallet</span>
              </div>
              <div class="leader-info">
                <span class="leader-label">Tesorero</span>
                <span class="leader-name">{{ getUserName(community.treasurerId) }}</span>
              </div>
            </div>
            <div class="leader-card" v-if="community.secretaryId">
              <div class="leader-icon bg-accent">
                <span class="material-symbols-outlined">assignment</span>
              </div>
              <div class="leader-info">
                <span class="leader-label">Secretario</span>
                <span class="leader-name">{{ getUserName(community.secretaryId) }}</span>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator v-if="canEdit" />

        <q-card-section v-if="canEdit">
          <h3 class="section-title danger">Zona de Peligro</h3>
          <q-btn
            color="negative"
            label="Eliminar Comunidad"
            icon="delete"
            flat
            @click="handleDelete"
          />
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="communityStore.loading" class="loading">
      <q-spinner color="primary" size="3em" />
      <p>Cargando información...</p>
    </div>

    <div v-else class="no-data">
      <span class="material-symbols-outlined">error</span>
      <p>Comunidad no encontrada</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCommunityStore } from '@/stores/community.store'
import { useUserStore } from '@/stores/user.store'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const communityStore = useCommunityStore()
const userStore = useUserStore()
const authStore = useAuthStore()

const communityId = computed(() => route.params.id)
const community = computed(() => communityStore.currentCommunity)

const canEdit = computed(() => {
  return authStore.isPresident
})

onMounted(async () => {
  await communityStore.fetchCommunityById(communityId.value)
  await userStore.fetchAllUsersPublic()
})

const getUserName = (userId) => {
  if (typeof userId === 'object' && userId !== null) {
    return userId.fullName || 'Usuario'
  }
  const user = userStore.users.find(u => u._id === userId)
  return user?.fullName || 'N/A'
}

const handleDelete = async () => {
  $q.dialog({
    title: 'Eliminar Comunidad',
    message: '¿Estás seguro de que deseas eliminar esta comunidad? Esta acción no se puede deshacer.',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const result = await communityStore.deleteCommunity(communityId.value)
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Comunidad eliminada exitosamente'
      })
      router.push('/admin/communities')
    } else {
      $q.notify({
        type: 'negative',
        message: result.message || 'Error al eliminar comunidad'
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

.header-actions {
  display: flex;
  gap: 8px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.community-card {
  border-radius: 12px;
}

.community-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.community-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--tertiary) 0%, var(--tertiary-container) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.community-icon .material-symbols-outlined {
  font-size: 32px;
  color: var(--on-primary);
}

.community-name {
  font-size: 22px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 4px 0;
}

.community-city {
  font-size: 14px;
  color: var(--outline);
  margin: 0 0 8px 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 16px 0;
}

.section-title.danger {
  color: var(--error);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--outline);
  text-transform: uppercase;
}

.info-value {
  font-size: 14px;
  color: var(--on-surface);
}

.info-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--tertiary);
  text-decoration: none;
}

.info-link:hover {
  text-decoration: underline;
}

.info-link .material-symbols-outlined {
  font-size: 14px;
}

.leaders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.leader-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--surface-container-lowest);
  border-radius: 8px;
}

.leader-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.leader-icon .material-symbols-outlined {
  font-size: 20px;
  color: white;
}

.bg-primary { background: var(--tertiary); }
.bg-secondary { background: var(--tertiary-container); }
.bg-accent { background: var(--primary); }

.leader-info {
  display: flex;
  flex-direction: column;
}

.leader-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--outline);
}

.leader-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
}

.loading, .no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--on-surface-variant);
}

.no-data .material-symbols-outlined,
.loading .material-symbols-outlined {
  font-size: 64px;
  margin-bottom: 16px;
}
</style>
