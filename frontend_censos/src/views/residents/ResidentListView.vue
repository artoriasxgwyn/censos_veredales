<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="title">Residentes</h1>
      <q-btn
        color="primary"
        label="Nuevo Residente"
        icon="add"
        @click="router.push('/admin/residents/create')"
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

    <div class="residents-list" v-if="!residentStore.loading">
      <q-card
        v-for="resident in filteredResidents"
        :key="resident._id"
        class="resident-card"
        @click="router.push(`/admin/residents/${resident._id}`)"
      >
        <q-card-section class="resident-header">
          <div class="resident-icon">
            <span class="material-symbols-outlined">person</span>
          </div>
          <div class="resident-info">
            <h3 class="resident-name">{{ getUserName(resident.userId) }}</h3>
            <p class="resident-dwelling">{{ getDwellingName(resident.dwellingId) }}</p>
          </div>
          <q-badge :color="getStatusColor(resident.status)">
            {{ getStatusLabel(resident.status) }}
          </q-badge>
        </q-card-section>

        <q-separator />

        <q-card-section class="resident-body">
          <div class="approval-progress">
            <div class="approval-item" :class="resident.approvedByPresident">
              <span class="material-symbols-outlined">verified</span>
              <span>Presidente</span>
            </div>
            <div class="approval-item" :class="resident.approvedByTreasurer">
              <span class="material-symbols-outlined">verified</span>
              <span>Tesorero</span>
            </div>
            <div class="approval-item" :class="resident.approvedBySecretary">
              <span class="material-symbols-outlined">verified</span>
              <span>Secretario</span>
            </div>
          </div>

          <div class="resident-meta">
            <span class="material-symbols-outlined">badge</span>
            {{ resident.registrationNumber || 'Sin número de registro' }}
          </div>
        </q-card-section>
      </q-card>

      <div v-if="filteredResidents.length === 0" class="no-data">
        <span class="material-symbols-outlined">people</span>
        <p>No hay residentes registrados</p>
      </div>
    </div>

    <div v-else class="loading">
      <q-spinner color="primary" size="3em" />
      <p>Cargando residentes...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useResidentStore } from '@/stores/resident.store'
import { useUserStore } from '@/stores/user.store'
import { useDwellingStore } from '@/stores/dwelling.store'

const router = useRouter()
const residentStore = useResidentStore()
const userStore = useUserStore()
const dwellingStore = useDwellingStore()

const statusFilter = ref('all')
const statusOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'Aprobados', value: 'approved' },
  { label: 'Rechazados', value: 'rejected' }
]

const filteredResidents = computed(() => {
  if (statusFilter.value === 'all') {
    return residentStore.residents
  }
  return residentStore.residents.filter(r => r.status === statusFilter.value)
})

onMounted(async () => {
  await Promise.all([
    residentStore.fetchResidents(),
    userStore.fetchAllUsersPublic(),
    dwellingStore.fetchDwellings()
  ])
})

const getUserName = (userId) => {
  if (typeof userId === 'object' && userId !== null) {
    return userId.fullName || 'Usuario'
  }
  const user = userStore.users.find(u => u._id === userId)
  return user?.fullName || 'Residente'
}

const getDwellingName = (dwellingId) => {
  if (typeof dwellingId === 'object' && dwellingId !== null) {
    return dwellingId.houseNomenclature || 'Vivienda'
  }
  const dwelling = dwellingStore.dwellings.find(d => d._id === dwellingId)
  return dwelling?.houseNomenclature || 'Vivienda'
}

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
    approved: 'Aprobado',
    rejected: 'Rechazado'
  }
  return labels[status] || status
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

.residents-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.resident-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.resident-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.resident-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.resident-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--tertiary) 0%, var(--tertiary-container) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resident-icon .material-symbols-outlined {
  font-size: 24px;
  color: var(--on-primary);
}

.resident-info {
  flex: 1;
}

.resident-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 4px 0;
}

.resident-dwelling {
  font-size: 13px;
  color: var(--outline);
  margin: 0;
}

.resident-body {
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

.resident-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--on-surface-variant);
}

.resident-meta .material-symbols-outlined {
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
