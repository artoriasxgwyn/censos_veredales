<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="title">Viviendas</h1>
      <q-btn
        color="primary"
        label="Nueva Vivienda"
        icon="add"
        @click="router.push('/admin/dwellings/create')"
      />
    </div>

    <!-- Filtros -->
    <div class="filters">
      <q-btn-toggle
        v-model="statusFilter"
        toggle-color="primary"
        :options="statusOptions"
        outline
      />
    </div>

    <div class="dwellings-list" v-if="!dwellingStore.loading">
      <q-card
        v-for="dwelling in filteredDwellings"
        :key="dwelling._id"
        class="dwelling-card"
        @click="router.push(`/admin/dwellings/${dwelling._id}`)"
      >
        <q-card-section class="dwelling-header">
          <div class="dwelling-icon">
            <span class="material-symbols-outlined">home</span>
          </div>
          <div class="dwelling-info">
            <h3 class="dwelling-name">{{ dwelling.houseNomenclature || 'Sin nomenclatura' }}</h3>
            <p class="dwelling-location">{{ dwelling.communityId?.neighborhood || 'Comunidad' }}</p>
          </div>
          <q-badge :color="getStatusColor(dwelling.status)">
            {{ getStatusLabel(dwelling.status) }}
          </q-badge>
        </q-card-section>

        <q-separator />

        <q-card-section class="dwelling-body">
          <div class="approval-progress">
            <div class="approval-item" :class="dwelling.approvedByPresident">
              <span class="material-symbols-outlined">verified</span>
              <span>Presidente</span>
            </div>
            <div class="approval-item" :class="dwelling.approvedByTreasurer">
              <span class="material-symbols-outlined">verified</span>
              <span>Tesorero</span>
            </div>
            <div class="approval-item" :class="dwelling.approvedBySecretary">
              <span class="material-symbols-outlined">verified</span>
              <span>Secretario</span>
            </div>
          </div>

          <div class="dwelling-meta">
            <span class="material-symbols-outlined">calendar_today</span>
            {{ formatDate(dwelling.createdAt) }}
          </div>
        </q-card-section>
      </q-card>

      <div v-if="filteredDwellings.length === 0" class="no-data">
        <span class="material-symbols-outlined">home</span>
        <p>No hay viviendas registradas</p>
      </div>
    </div>

    <div v-else class="loading">
      <q-spinner color="primary" size="3em" />
      <p>Cargando viviendas...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDwellingStore } from '@/stores/dwelling.store'

const router = useRouter()
const dwellingStore = useDwellingStore()

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

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    approved: 'positive',
    rejected: 'negative'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-ES')
}
</script>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
}

.filters {
  margin-bottom: 20px;
}

.dwellings-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.dwelling-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.dwelling-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.dwelling-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dwelling-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--tertiary) 0%, var(--tertiary-container) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dwelling-icon .material-symbols-outlined {
  font-size: 24px;
  color: var(--on-primary);
}

.dwelling-info {
  flex: 1;
}

.dwelling-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 4px 0;
}

.dwelling-location {
  font-size: 13px;
  color: var(--outline);
  margin: 0;
}

.dwelling-body {
  padding-top: 12px !important;
}

.approval-progress {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.approval-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--on-surface-variant);
}

.approval-item .material-symbols-outlined {
  font-size: 16px;
}

.approval-item.approved {
  color: var(--primary);
}

.approval-item.rejected {
  color: var(--error);
}

.approval-item.pending {
  color: var(--warning);
}

.dwelling-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--on-surface-variant);
}

.dwelling-meta .material-symbols-outlined {
  font-size: 14px;
}

.no-data, .loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--on-surface-variant);
  grid-column: 1 / -1;
}

.loading {
  color: var(--outline);
}
</style>
