<template>
  <div class="my-dwelling-page">
    <div class="dwelling-content">
      <!-- Page Header -->
      <div class="page-header">
        <q-btn
          flat
          round
          icon="arrow_back"
          @click="router.back()"
          class="back-btn"
        />
        <div>
          <p class="page-subtitle">Mi Vivienda</p>
          <h1 class="page-title">Detalle de mi Vivienda</h1>
        </div>
      </div>

      <div v-if="!dwelling" class="loading-state">
        <q-spinner color="primary" size="3em" />
        <p>Cargando información de la vivienda...</p>
      </div>

      <div v-else-if="!dwelling && !loading" class="empty-state">
        <span class="material-symbols-outlined">home</span>
        <h2>No tienes una vivienda registrada</h2>
        <p>Actualmente no hay una vivienda asociada a tu cuenta.</p>
      </div>

      <div v-else class="dwelling-detail">
        <!-- Imagen de la fachada -->
        <div class="facade-section">
          <div class="facade-image-container" v-if="dwelling.facadeImage">
            <img :src="dwelling.facadeImage" alt="Fachada" class="facade-photo" />
          </div>
          <div class="facade-image-container no-image" v-else>
            <span class="material-symbols-outlined">home</span>
            <p>Sin foto de fachada</p>
          </div>
        </div>

        <!-- Información principal -->
        <div class="info-section">
          <q-card class="info-card">
            <div class="card-header">
              <span class="material-symbols-outlined">home</span>
              <h2>Información de la Vivienda</h2>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Nomenclatura</span>
                <span class="info-value">{{ dwelling.houseNomenclature || 'No registrada' }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Estado</span>
                <q-badge :color="getStatusColor(dwelling.status)" class="status-badge">
                  {{ dwelling.status }}
                </q-badge>
              </div>

              <div class="info-item full-width">
                <span class="info-label">Indicaciones para llegar</span>
                <p class="info-text">{{ dwelling.arrivalInstructions || 'Sin indicaciones registradas' }}</p>
              </div>

              <div class="info-item">
                <span class="info-label">Fecha de registro</span>
                <span class="info-value">{{ formatDate(dwelling.createdAt) }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Creado por</span>
                <span class="info-value">{{ getCreatorName(dwelling.createdBy) }}</span>
              </div>
            </div>
          </q-card>
        </div>

        <!-- Estado de aprobación -->
        <div class="approval-section" v-if="dwelling.status !== 'approved'">
          <q-card class="approval-card">
            <div class="card-header">
              <span class="material-symbols-outlined">fact_check</span>
              <h2>Estado de Aprobación</h2>
            </div>

            <div class="approval-status">
              <div class="approval-item">
                <span class="material-symbols-outlined" :class="getApprovalIcon(dwelling.approvedByPresident)">
                  {{ getApprovalIcon(dwelling.approvedByPresident) }}
                </span>
                <span class="approval-label">Presidente</span>
                <q-badge :color="getApprovalColor(dwelling.approvedByPresident)" class="approval-badge">
                  {{ dwelling.approvedByPresident || 'Pendiente' }}
                </q-badge>
              </div>

              <div class="approval-item">
                <span class="material-symbols-outlined" :class="getApprovalIcon(dwelling.approvedByTreasurer)">
                  {{ getApprovalIcon(dwelling.approvedByTreasurer) }}
                </span>
                <span class="approval-label">Tesorero</span>
                <q-badge :color="getApprovalColor(dwelling.approvedByTreasurer)" class="approval-badge">
                  {{ dwelling.approvedByTreasurer || 'Pendiente' }}
                </q-badge>
              </div>

              <div class="approval-item">
                <span class="material-symbols-outlined" :class="getApprovalIcon(dwelling.approvedBySecretary)">
                  {{ getApprovalIcon(dwelling.approvedBySecretary) }}
                </span>
                <span class="approval-label">Secretario</span>
                <q-badge :color="getApprovalColor(dwelling.approvedBySecretary)" class="approval-badge">
                  {{ dwelling.approvedBySecretary || 'Pendiente' }}
                </q-badge>
              </div>
            </div>
          </q-card>
        </div>

        <!-- Acciones -->
        <div class="actions-section" v-if="isOwner">
          <q-btn
            color="primary"
            label="Editar Vivienda"
            icon="edit"
            @click="router.push(`/admin/dwellings/${dwelling._id}/edit`)"
            class="edit-btn"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useDwellingStore } from '@/stores/dwelling.store'
import { useUserStore } from '@/stores/user.store'

const router = useRouter()
const authStore = useAuthStore()
const dwellingStore = useDwellingStore()
const userStore = useUserStore()

const dwelling = ref(null)
const loading = ref(true)

const isOwner = computed(() => {
  if (!dwelling.value) return false
  return dwelling.value.ownerUserId === authStore.user?.id
})

onMounted(async () => {
  await dwellingStore.fetchDwellings()
  await userStore.fetchUsers()

  // Buscar la vivienda del usuario actual
  const userDwelling = dwellingStore.dwellings.find(
    d => d.ownerUserId === authStore.user?.id || d.createdBy === authStore.user?.id
  )

  dwelling.value = userDwelling || null
  loading.value = false
})

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    approved: 'positive',
    rejected: 'negative'
  }
  return colors[status] || 'grey'
}

const getApprovalColor = (approval) => {
  if (!approval) return 'warning'
  const colors = {
    approved: 'positive',
    rejected: 'negative',
    pending: 'warning'
  }
  return colors[approval] || 'grey'
}

const getApprovalIcon = (approval) => {
  if (!approval) return 'hourglass_top'
  const icons = {
    approved: 'check_circle',
    rejected: 'cancel',
    pending: 'hourglass_top'
  }
  return icons[approval] || 'help'
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const getCreatorName = (creatorId) => {
  if (!creatorId) return 'Desconocido'
  const user = userStore.users.find(u => u._id === creatorId)
  return user?.fullName || 'Administración'
}
</script>

<style scoped>
.my-dwelling-page {
  min-height: 100vh;
  background: var(--surface-container-low);
}

.dwelling-content {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

@media (max-width: 599px) {
  .dwelling-content {
    padding: 16px;
  }
}

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.back-btn {
  flex-shrink: 0;
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
  font-size: 28px;
  font-weight: 900;
  color: var(--on-surface);
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.loading-state p {
  color: var(--on-surface-variant);
  font-size: 14px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  text-align: center;
}

.empty-state .material-symbols-outlined {
  font-size: 64px;
  color: var(--outline);
}

.empty-state h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
}

.empty-state p {
  color: var(--on-surface-variant);
  font-size: 14px;
  max-width: 400px;
}

/* Dwelling Detail */
.dwelling-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Facade Section */
.facade-section {
  margin-bottom: 8px;
}

.facade-image-container {
  width: 100%;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface-container);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

@media (max-width: 599px) {
  .facade-image-container {
    height: 200px;
  }
}

.facade-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.facade-image-container.no-image {
  color: var(--outline);
}

.facade-image-container.no-image .material-symbols-outlined {
  font-size: 64px;
  margin-bottom: 8px;
}

.facade-image-container.no-image p {
  font-size: 14px;
  margin: 0;
}

/* Info Section */
.info-section {
  margin-bottom: 8px;
}

.info-card {
  padding: 24px !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(25, 28, 30, 0.04) !important;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.card-header .material-symbols-outlined {
  color: var(--primary);
  font-size: 24px;
}

.card-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 599px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--outline);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
}

.info-text {
  font-size: 14px;
  color: var(--on-surface);
  line-height: 1.6;
  margin: 0;
}

.status-badge {
  font-size: 12px;
  padding: 6px 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Approval Section */
.approval-section {
  margin-bottom: 8px;
}

.approval-card {
  padding: 24px !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(25, 28, 30, 0.04) !important;
}

.approval-status {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.approval-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--surface-container);
  border-radius: 8px;
}

.approval-item .material-symbols-outlined {
  font-size: 24px;
}

.approval-item .material-symbols-outlined.positive {
  color: var(--success);
}

.approval-item .material-symbols-outlined.negative {
  color: var(--error);
}

.approval-item .material-symbols-outlined.warning {
  color: var(--warning);
}

.approval-label {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
}

.approval-badge {
  font-size: 11px;
  padding: 4px 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Actions Section */
.actions-section {
  margin-bottom: 24px;
  display: flex;
  justify-content: flex-end;
}

.edit-btn {
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}
</style>
