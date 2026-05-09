<template>
  <div class="page">
    <div class="page-content">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <p class="page-subtitle">Administración Global</p>
          <h1 class="page-title">Comunidades</h1>
          <p class="page-description">Gestione las comunidades registradas en el sistema</p>
        </div>
        <q-btn
          color="primary"
          label="Nueva Comunidad"
          icon="add"
          @click="router.push('/admin/communities/create')"
          v-if="authStore.hasPermission('community', 'create')"
          class="create-btn"
        >
          <template v-slot:append>
            <span class="material-symbols-outlined">arrow_forward</span>
          </template>
        </q-btn>
      </div>

      <!-- Communities List -->
      <div class="communities-section" v-if="!communityStore.loading">
        <div class="communities-list">
          <div
            v-for="community in communityStore.communities"
            :key="community._id"
            class="community-item"
            @click="router.push(`/admin/communities/${community._id}`)"
          >
            <div class="community-icon">
              <span class="material-symbols-outlined">location_city</span>
            </div>
            <div class="community-info">
              <div class="community-header">
                <h3 class="community-name">{{ community.neighborhood }}</h3>
                <q-badge :color="community.isActive ? 'positive' : 'negative'" class="status-badge">
                  {{ community.isActive ? 'Activa' : 'Inactiva' }}
                </q-badge>
              </div>
              <p class="community-location">
                <span class="material-symbols-outlined">public</span>
                {{ community.city }}, {{ community.department }}
              </p>
              <div class="community-meta">
                <span class="meta-item">
                  <span class="material-symbols-outlined">badge</span>
                  {{ community.code || 'N/A' }}
                </span>
                <span class="meta-item">
                  <span class="material-symbols-outlined">people</span>
                  ~{{ community.estimatedResidentCount || 0 }} residentes
                </span>
              </div>
            </div>
            <span class="material-symbols-outlined chevron">chevron_right</span>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="communityStore.communities.length === 0" class="empty-state">
          <div class="empty-icon">
            <span class="material-symbols-outlined">location_city</span>
          </div>
          <h3 class="empty-title">No hay comunidades registradas</h3>
          <p class="empty-description">Comienza creando la primera comunidad del sistema</p>
          <q-btn
            color="primary"
            label="Crear primera comunidad"
            @click="router.push('/admin/communities/create')"
            v-if="authStore.hasPermission('community', 'create')"
            class="create-btn"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="loading-state">
        <q-spinner color="primary" size="48px" />
        <p>Cargando comunidades...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCommunityStore } from '@/stores/community.store'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const communityStore = useCommunityStore()
const authStore = useAuthStore()

onMounted(async () => {
  // Verificar permiso para ver comunidades
  if (!authStore.hasPermission('community', 'read')) {
    $q.notify({
      type: 'negative',
      message: 'Acceso denegado. No tienes permisos para ver comunidades.'
    })
    router.push('/admin/dashboard')
    return
  }

  await communityStore.fetchPublicCommunities()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--surface-container-low);
}

.page-content {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 599px) {
  .page-content {
    padding: 16px;
  }
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

@media (max-width: 599px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;
    gap: 16px;
  }
}

.page-subtitle {
  font-size: 11px;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}

.page-title {
  font-size: 40px;
  font-weight: 900;
  color: var(--on-surface);
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0 0 12px 0;
}

.page-description {
  font-size: 16px;
  color: var(--on-surface-variant);
  line-height: 1.6;
  margin: 0;
  max-width: 500px;
}

@media (max-width: 599px) {
  .page-subtitle {
    font-size: 10px;
  }

  .page-title {
    font-size: 28px;
  }

  .page-description {
    font-size: 14px;
  }
}

.create-btn {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: var(--on-primary);
  padding: 14px 24px;
  border-radius: 10px;
  font-weight: 700;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(0, 40, 142, 0.3);
  transition: all 0.2s;
  font-size: 14px;
  letter-spacing: -0.01em;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 40, 142, 0.4);
}

.create-btn .material-symbols-outlined {
  font-size: 18px;
  margin-left: 4px;
}

/* Communities Section */
.communities-section {
  background: var(--surface-container-lowest);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 16px 32px rgba(25, 28, 30, 0.06);
}

.communities-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.community-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: var(--surface-container);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

@media (max-width: 599px) {
  .community-item {
    gap: 16px;
    padding: 16px;
    flex-wrap: wrap;
  }

  .community-item:hover {
    transform: none;
  }
}

.community-item:hover {
  background: var(--primary-50);
  transform: translateX(4px);
}

.community-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

@media (max-width: 599px) {
  .community-icon {
    width: 48px;
    height: 48px;
  }

  .community-icon .material-symbols-outlined {
    font-size: 22px;
  }
}

.community-icon .material-symbols-outlined {
  font-size: 26px;
  color: var(--on-primary);
}

.community-info {
  flex: 1;
  min-width: 0;
}

.community-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

@media (max-width: 599px) {
  .community-header {
    gap: 8px;
    flex-wrap: wrap;
  }
}

.community-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
}

@media (max-width: 599px) {
  .community-name {
    font-size: 16px;
  }
}

.status-badge {
  font-size: 11px;
  padding: 4px 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (max-width: 599px) {
  .status-badge {
    font-size: 10px;
    padding: 3px 8px;
  }
}

.community-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0 0 10px 0;
}

@media (max-width: 599px) {
  .community-location {
    font-size: 13px;
    gap: 4px;
    margin-bottom: 8px;
  }

  .community-location .material-symbols-outlined {
    font-size: 14px;
  }
}

.community-location .material-symbols-outlined {
  font-size: 16px;
  color: var(--outline);
}

.community-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--outline);
}

.meta-item .material-symbols-outlined {
  font-size: 16px;
  color: var(--primary);
}

.chevron {
  color: var(--outline);
  font-size: 24px;
  flex-shrink: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--primary-50);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-icon .material-symbols-outlined {
  font-size: 40px;
  color: var(--primary);
}

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0 0 24px 0;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-state p {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin-top: 16px;
}
</style>
