<template>
  <div class="page">
    <div class="page-content">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <p class="page-subtitle">Gestión de Viviendas</p>
          <h1 class="page-title">Viviendas</h1>
          <p class="page-description">Administre las viviendas registradas en las comunidades</p>
        </div>
        <q-btn
          color="primary"
          label="Nueva Vivienda"
          icon="add"
          @click="router.push('/admin/dwellings/create')"
          class="create-btn"
        >
          <template v-slot:append>
            <span class="material-symbols-outlined">arrow_forward</span>
          </template>
        </q-btn>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-chips">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            :class="['filter-chip', { active: statusFilter === option.value }]"
            @click="statusFilter = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Dwellings List -->
      <div class="dwellings-section" v-if="!dwellingStore.loading">
        <div class="dwellings-grid">
          <div
            v-for="dwelling in filteredDwellings"
            :key="dwelling._id"
            class="dwelling-card"
            @click="verDetalle(dwelling._id)"
          >
            <div class="dwelling-badge" :class="dwelling.status">
              {{ getStatusLabel(dwelling.status) }}
            </div>

            <div class="dwelling-icon">
              <span class="material-symbols-outlined">home</span>
            </div>

            <h3 class="dwelling-type">{{ dwelling.houseNomenclature || 'Sin nomenclatura' }}</h3>
            <p class="dwelling-community">Código: {{ getCommunityCode(dwelling.communityId) }}</p>

            <div class="approval-status">
              <div class="approval-item" :class="getApprovalClass(dwelling.approvedByPresident)">
                <span class="material-symbols-outlined">
                  {{ getApprovalIcon(dwelling.approvedByPresident) }}
                </span>
              </div>
              <div class="approval-item" :class="getApprovalClass(dwelling.approvedByTreasurer)">
                <span class="material-symbols-outlined">
                  {{ getApprovalIcon(dwelling.approvedByTreasurer) }}
                </span>
              </div>
              <div class="approval-item" :class="getApprovalClass(dwelling.approvedBySecretary)">
                <span class="material-symbols-outlined">
                  {{ getApprovalIcon(dwelling.approvedBySecretary) }}
                </span>
              </div>
            </div>

            <div class="dwelling-footer">
              <span class="dwelling-date">
                <span class="material-symbols-outlined">calendar_today</span>
                {{ formatDate(dwelling.createdAt) }}
              </span>
              <span class="material-symbols-outlined chevron">chevron_right</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredDwellings.length === 0" class="empty-state">
          <div class="empty-icon">
            <span class="material-symbols-outlined">home</span>
          </div>
          <h3 class="empty-title">No hay viviendas registradas</h3>
          <p class="empty-description">Las viviendas creadas aparecerán aquí</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="loading-state">
        <q-spinner color="primary" size="48px" />
        <p>Cargando viviendas...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDwellingStore } from '@/stores/dwelling.store'
import { useCommunityStore } from '@/stores/community.store'

const router = useRouter()
const dwellingStore = useDwellingStore()
const communityStore = useCommunityStore()

const statusFilter = ref('all')
const statusOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'Aprobadas', value: 'approved' },
  { label: 'Rechazadas', value: 'rejected' }
]

const filteredDwellings = computed(() => {
  if (statusFilter.value === 'all') {
    return dwellingStore.dwellings
  }
  return dwellingStore.dwellings.filter(d => d.status === statusFilter.value)
})

onMounted(async () => {
  await dwellingStore.fetchDwellings()
})

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const getApprovalIcon = (status) => {
  if (status === 'approved') return 'check_circle'
  if (status === 'rejected') return 'cancel'
  return 'pending'
}

const getApprovalClass = (status) => {
  return status || 'pending'
}

const getCommunityCode = (communityId) => {
  if (!communityId) return 'N/A'
  if (typeof communityId === 'object' && communityId?.code) {
    return communityId.code
  }
  if (typeof communityId === 'string') {
    const community = communityStore.communities.find(c => c._id === communityId)
    return community?.code || 'N/A'
  }
  return 'N/A'
}

const verDetalle = async (dwellingId) => {
  // Asegurar que los datos estén cargados antes de navegar
  await dwellingStore.fetchDwellingById(dwellingId)
  router.push(`/admin/dwellings/${dwellingId}`)
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--surface-container-lowest);
}

.page-content {
  padding: 24px;
  max-width: 1400px;
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

/* Filters */
.filters-section {
  margin-bottom: 24px;
}

.filter-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 8px 16px;
  background: var(--surface-container-low);
  border: 1px solid var(--surface-container-highest);
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip:hover {
  background: var(--primary-50);
  border-color: var(--primary);
}

.filter-chip.active {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--on-primary);
}

/* Dwellings Section */
.dwellings-section {
  background: var(--surface-container-low);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 16px 32px rgba(25, 28, 30, 0.06);
}

.dwellings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

@media (max-width: 599px) {
  .dwellings-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.dwelling-card {
  background: var(--surface-container-lowest);
  border: 1px solid var(--surface-container-highest);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

@media (max-width: 599px) {
  .dwelling-card {
    padding: 16px;
  }

  .dwelling-card:hover {
    transform: none;
  }
}

.dwelling-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.dwelling-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dwelling-badge.pending { background: var(--info); color: var(--on-info); }
.dwelling-badge.approved { background: var(--success); color: var(--on-success); }
.dwelling-badge.rejected { background: var(--error); color: var(--on-error); }

.dwelling-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

@media (max-width: 599px) {
  .dwelling-icon {
    width: 40px;
    height: 40px;
    margin-bottom: 12px;
  }

  .dwelling-icon .material-symbols-outlined {
    font-size: 20px;
  }
}

.dwelling-icon .material-symbols-outlined {
  font-size: 24px;
  color: var(--white);
}

.dwelling-type {
  font-size: 18px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 4px 0;
}

@media (max-width: 599px) {
  .dwelling-type {
    font-size: 16px;
  }
}

.dwelling-community {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0 0 16px 0;
}

@media (max-width: 599px) {
  .dwelling-community {
    font-size: 13px;
    margin-bottom: 12px;
  }
}

.approval-status {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.approval-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--outline);
}

.approval-item .material-symbols-outlined {
  font-size: 16px;
}

.approval-item.approved { color: var(--primary); }
.approval-item.rejected { color: var(--error); }
.approval-item.pending { color: var(--warning); }

.dwelling-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--surface-container-highest);
}

.dwelling-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--on-surface-variant);
}

.dwelling-date .material-symbols-outlined {
  font-size: 14px;
}

.chevron {
  color: var(--on-surface-variant);
  font-size: 20px;
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
