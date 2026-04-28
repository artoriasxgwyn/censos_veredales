<template>
  <div class="page">
    <div class="page-content">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <p class="page-subtitle">Gestión de Aprobaciones</p>
          <h1 class="page-title">Aprobaciones Pendientes</h1>
          <p class="page-description">Revise y gestione las aprobaciones de residentes, viviendas y cartas</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <q-card class="stat-card" :class="{ 'has-pending': pendingResidentsCount > 0 }">
          <div class="stat-icon primary">
            <span class="material-symbols-outlined">people</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ pendingResidentsCount }}</div>
            <div class="stat-label">Residentes Pendientes</div>
          </div>
        </q-card>

        <q-card class="stat-card" :class="{ 'has-pending': pendingDwellingsCount > 0 }">
          <div class="stat-icon secondary">
            <span class="material-symbols-outlined">home</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ pendingDwellingsCount }}</div>
            <div class="stat-label">Viviendas Pendientes</div>
          </div>
        </q-card>

        <q-card class="stat-card" :class="{ 'has-pending': pendingLettersCount > 0 }">
          <div class="stat-icon tertiary">
            <span class="material-symbols-outlined">description</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ pendingLettersCount }}</div>
            <div class="stat-label">Cartas Pendientes</div>
          </div>
        </q-card>

        <q-card class="stat-card warning">
          <div class="stat-icon warning">
            <span class="material-symbols-outlined">stacks</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ totalCount }}</div>
            <div class="stat-label">Total Pendientes</div>
          </div>
        </q-card>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        <div class="tabs">
          <button
            :class="['tab', { active: activeTab === 'residents' }]"
            @click="activeTab = 'residents'"
          >
            Residentes
            <q-badge v-if="pendingResidentsCount > 0" color="primary" class="tab-badge">
              {{ pendingResidentsCount }}
            </q-badge>
          </button>
          <button
            :class="['tab', { active: activeTab === 'dwellings' }]"
            @click="activeTab = 'dwellings'"
          >
            Viviendas
            <q-badge v-if="pendingDwellingsCount > 0" color="secondary" class="tab-badge">
              {{ pendingDwellingsCount }}
            </q-badge>
          </button>
          <button
            :class="['tab', { active: activeTab === 'letters' }]"
            @click="activeTab = 'letters'"
          >
            Cartas
            <q-badge v-if="pendingLettersCount > 0" color="tertiary" class="tab-badge">
              {{ pendingLettersCount }}
            </q-badge>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Residents Tab -->
          <div v-if="activeTab === 'residents'" class="tab-panel">
            <div v-if="pendingResidents.length === 0" class="empty-state">
              <span class="material-symbols-outlined">check_circle</span>
              <h3>No hay residentes pendientes</h3>
              <p>Todos los residentes han sido aprobados</p>
            </div>
            <div v-else class="items-grid">
              <q-card
                v-for="resident in pendingResidents"
                :key="resident._id"
                class="item-card"
              >
                <div class="item-header">
                  <div class="item-icon">
                    <span class="material-symbols-outlined">person</span>
                  </div>
                  <div class="item-info">
                    <h3 class="item-title">{{ getUserName(resident.userId) }}</h3>
                    <p class="item-subtitle">{{ getDwellingName(resident.dwellingId) }}</p>
                  </div>
                  <q-badge :color="getStatusColor(resident.status)">
                    {{ getStatusLabel(resident.status) }}
                  </q-badge>
                </div>

                <q-separator />

                <div class="item-body">
                  <div class="approval-status">
                    <div class="approval-item" :class="resident.approvedByPresident">
                      <span class="material-symbols-outlined">
                        {{ resident.approvedByPresident ? 'check_circle' : 'pending' }}
                      </span>
                      <span>Presidente</span>
                    </div>
                    <div class="approval-item" :class="resident.approvedByTreasurer">
                      <span class="material-symbols-outlined">
                        {{ resident.approvedByTreasurer ? 'check_circle' : 'pending' }}
                      </span>
                      <span>Tesorero</span>
                    </div>
                    <div class="approval-item" :class="resident.approvedBySecretary">
                      <span class="material-symbols-outlined">
                        {{ resident.approvedBySecretary ? 'check_circle' : 'pending' }}
                      </span>
                      <span>Secretario</span>
                    </div>
                  </div>

                  <div class="item-actions">
                    <q-btn
                      color="positive"
                      label="Aprobar"
                      icon="check"
                      @click="handleApprove('resident', resident)"
                      :loading="resident.loading"
                      flat
                    />
                    <q-btn
                      color="negative"
                      label="Rechazar"
                      icon="close"
                      @click="handleReject('resident', resident)"
                      :loading="resident.loading"
                      flat
                    />
                  </div>
                </div>
              </q-card>
            </div>
          </div>

          <!-- Dwellings Tab -->
          <div v-if="activeTab === 'dwellings'" class="tab-panel">
            <div v-if="pendingDwellings.length === 0" class="empty-state">
              <span class="material-symbols-outlined">check_circle</span>
              <h3>No hay viviendas pendientes</h3>
              <p>Todas las viviendas han sido aprobadas</p>
            </div>
            <div v-else class="items-grid">
              <q-card
                v-for="dwelling in pendingDwellings"
                :key="dwelling._id"
                class="item-card"
              >
                <div class="item-header">
                  <div class="item-icon">
                    <span class="material-symbols-outlined">home</span>
                  </div>
                  <div class="item-info">
                    <h3 class="item-title">{{ dwelling.houseNomenclature || 'Sin nomenclatura' }}</h3>
                    <p class="item-subtitle">{{ dwelling.communityId?.neighborhood || 'Comunidad' }}</p>
                  </div>
                  <q-badge :color="getStatusColor(dwelling.status)">
                    {{ getStatusLabel(dwelling.status) }}
                  </q-badge>
                </div>

                <q-separator />

                <div class="item-body">
                  <div class="approval-status">
                    <div class="approval-item" :class="dwelling.approvedByPresident">
                      <span class="material-symbols-outlined">
                        {{ dwelling.approvedByPresident ? 'check_circle' : 'pending' }}
                      </span>
                      <span>Presidente</span>
                    </div>
                    <div class="approval-item" :class="dwelling.approvedByTreasurer">
                      <span class="material-symbols-outlined">
                        {{ dwelling.approvedByTreasurer ? 'check_circle' : 'pending' }}
                      </span>
                      <span>Tesorero</span>
                    </div>
                    <div class="approval-item" :class="dwelling.approvedBySecretary">
                      <span class="material-symbols-outlined">
                        {{ dwelling.approvedBySecretary ? 'check_circle' : 'pending' }}
                      </span>
                      <span>Secretario</span>
                    </div>
                  </div>

                  <div class="item-actions">
                    <q-btn
                      color="positive"
                      label="Aprobar"
                      icon="check"
                      @click="handleApprove('dwelling', dwelling)"
                      :loading="dwelling.loading"
                      flat
                    />
                    <q-btn
                      color="negative"
                      label="Rechazar"
                      icon="close"
                      @click="handleReject('dwelling', dwelling)"
                      :loading="dwelling.loading"
                      flat
                    />
                  </div>
                </div>
              </q-card>
            </div>
          </div>

          <!-- Letters Tab -->
          <div v-if="activeTab === 'letters'" class="tab-panel">
            <div v-if="pendingLetters.length === 0" class="empty-state">
              <span class="material-symbols-outlined">check_circle</span>
              <h3>No hay cartas pendientes</h3>
              <p>Todas las cartas han sido aprobadas</p>
            </div>
            <div v-else class="items-grid">
              <q-card
                v-for="letter in pendingLetters"
                :key="letter._id"
                class="item-card"
              >
                <div class="item-header">
                  <div class="item-icon">
                    <span class="material-symbols-outlined">description</span>
                  </div>
                  <div class="item-info">
                    <h3 class="item-title">Carta {{ letter.type }}</h3>
                    <p class="item-subtitle">{{ getUserName(letter.userId) }}</p>
                  </div>
                  <q-badge :color="getStatusColor(letter.status)">
                    {{ getStatusLabel(letter.status) }}
                  </q-badge>
                </div>

                <q-separator />

                <div class="item-body">
                  <div class="approval-status">
                    <div class="approval-item" :class="letter.approvedByPresident">
                      <span class="material-symbols-outlined">
                        {{ letter.approvedByPresident ? 'check_circle' : 'pending' }}
                      </span>
                      <span>Presidente</span>
                    </div>
                    <div class="approval-item" :class="letter.approvedByTreasurer">
                      <span class="material-symbols-outlined">
                        {{ letter.approvedByTreasurer ? 'check_circle' : 'pending' }}
                      </span>
                      <span>Tesorero</span>
                    </div>
                    <div class="approval-item" :class="letter.approvedBySecretary">
                      <span class="material-symbols-outlined">
                        {{ letter.approvedBySecretary ? 'check_circle' : 'pending' }}
                      </span>
                      <span>Secretario</span>
                    </div>
                  </div>

                  <div class="item-actions">
                    <q-btn
                      color="positive"
                      label="Aprobar"
                      icon="check"
                      @click="handleApprove('letter', letter)"
                      :loading="letter.loading"
                      flat
                    />
                    <q-btn
                      color="negative"
                      label="Rechazar"
                      icon="close"
                      @click="handleReject('letter', letter)"
                      :loading="letter.loading"
                      flat
                    />
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useResidentStore } from '@/stores/resident.store'
import { useDwellingStore } from '@/stores/dwelling.store'
import { useLetterStore } from '@/stores/letter.store'
import { useUserStore } from '@/stores/user.store'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const $q = useQuasar()
const residentStore = useResidentStore()
const dwellingStore = useDwellingStore()
const letterStore = useLetterStore()
const userStore = useUserStore()
const authStore = useAuthStore()

// Security check: Only presidents can access this view
onMounted(() => {
  if (!authStore.isPresident) {
    $q.notify({
      type: 'negative',
      message: 'Acceso denegado. Solo el presidente puede acceder a esta sección.'
    })
    router.push('/admin/dashboard')
  }
})

const activeTab = ref('residents')

const pendingResidents = computed(() => residentStore.residents.filter(r => r.status === 'pending'))
const pendingDwellings = computed(() => dwellingStore.dwellings.filter(d => d.status === 'pending'))
const pendingLetters = computed(() => letterStore.letters.filter(l => l.status === 'pending'))

const pendingResidentsCount = computed(() => pendingResidents.value.length)
const pendingDwellingsCount = computed(() => pendingDwellings.value.length)
const pendingLettersCount = computed(() => pendingLetters.value.length)
const totalCount = computed(() => pendingResidentsCount.value + pendingDwellingsCount.value + pendingLettersCount.value)

onMounted(async () => {
  await Promise.all([
    residentStore.fetchResidents(),
    dwellingStore.fetchDwellings(),
    letterStore.fetchCommunityLetters(),
    userStore.fetchAllUsersPublic()
  ])
})

const getUserName = (userId) => {
  if (typeof userId === 'object' && userId !== null) {
    return userId.fullName || 'Usuario'
  }
  const user = userStore.users.find(u => u._id === userId)
  return user?.fullName || 'Usuario'
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
    rejected: 'negative',
    issued: 'info'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    issued: 'Emitido'
  }
  return labels[status] || status
}

const handleApprove = async (type, item) => {
  item.loading = true
  try {
    let result
    if (type === 'resident') {
      result = await residentStore.approveResident(item._id, authStore.userRole, 'approved')
    } else if (type === 'dwelling') {
      result = await dwellingStore.approveDwelling(item._id, authStore.userRole, 'approved')
    } else if (type === 'letter') {
      result = await letterStore.approveLetter(item._id, authStore.userRole, 'approved')
    }

    if (result?.success) {
      $q.notify({
        type: 'positive',
        message: `${type === 'resident' ? 'Residente' : type === 'dwelling' ? 'Vivienda' : 'Carta'} aprobado exitosamente`
      })
      // Refresh data
      if (type === 'resident') await residentStore.fetchResidents()
      if (type === 'dwelling') await dwellingStore.fetchDwellings()
      if (type === 'letter') await letterStore.fetchCommunityLetters()
    } else {
      throw new Error(result?.message || 'Error al aprobar')
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al aprobar'
    })
  } finally {
    item.loading = false
  }
}

const handleReject = async (type, item) => {
  item.loading = true
  try {
    let result
    if (type === 'resident') {
      result = await residentStore.approveResident(item._id, authStore.userRole, 'rejected')
    } else if (type === 'dwelling') {
      result = await dwellingStore.approveDwelling(item._id, authStore.userRole, 'rejected')
    } else if (type === 'letter') {
      result = await letterStore.approveLetter(item._id, authStore.userRole, 'rejected')
    }

    if (result?.success) {
      $q.notify({
        type: 'negative',
        message: `${type === 'resident' ? 'Residente' : type === 'dwelling' ? 'Vivienda' : 'Carta'} rechazado`
      })
      // Refresh data
      if (type === 'resident') await residentStore.fetchResidents()
      if (type === 'dwelling') await dwellingStore.fetchDwellings()
      if (type === 'letter') await letterStore.fetchCommunityLetters()
    } else {
      throw new Error(result?.message || 'Error al rechazar')
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al rechazar'
    })
  } finally {
    item.loading = false
  }
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
  margin-bottom: 32px;
}

@media (max-width: 599px) {
  .page-header {
    margin-bottom: 20px;
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
  max-width: 600px;
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 599px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }
}

@media (max-width: 399px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(25, 28, 30, 0.04) !important;
}

@media (max-width: 599px) {
  .stat-card {
    padding: 16px !important;
    gap: 12px;
  }
}

.stat-card.has-pending {
  border-left: 4px solid var(--warning);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

@media (max-width: 599px) {
  .stat-icon {
    width: 48px;
    height: 48px;
  }

  .stat-icon .material-symbols-outlined {
    font-size: 24px;
  }
}

.stat-icon .material-symbols-outlined {
  font-size: 28px;
  color: var(--on-primary);
}

.stat-icon.primary { background: var(--primary); }
.stat-icon.secondary { background: var(--secondary); }
.stat-icon.tertiary { background: var(--tertiary); }
.stat-icon.warning { background: var(--warning); }

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--on-surface);
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 13px;
  color: var(--on-surface-variant);
  font-weight: 500;
}

/* Tabs */
.tabs-container {
  background: var(--surface);
  border-radius: 12px;
  box-shadow: 0 16px 32px rgba(25, 28, 30, 0.06);
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--surface-container-highest);
}

.tab {
  flex: 1;
  padding: 16px 24px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@media (max-width: 599px) {
  .tab {
    padding: 12px 16px;
    font-size: 13px;
    gap: 6px;
  }
}

.tab:hover {
  background: var(--primary-fixed);
}

.tab.active {
  color: var(--primary);
  background: var(--primary-fixed-dim);
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary);
}

.tab-badge {
  font-size: 10px;
  padding: 2px 8px;
}

.tab-content {
  padding: 24px;
}

.tab-panel {
  min-height: 400px;
}

/* Items Grid */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 16px;
}

@media (max-width: 599px) {
  .items-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.item-card {
  border-radius: 12px !important;
  overflow: hidden;
  transition: all 0.2s;
}

@media (max-width: 599px) {
  .item-card:hover {
    transform: none;
  }
}

.item-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

@media (max-width: 599px) {
  .item-header {
    gap: 12px;
    padding: 12px;
    flex-wrap: wrap;
  }
}

.item-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--tertiary) 0%, var(--tertiary-container) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

@media (max-width: 599px) {
  .item-icon {
    width: 40px;
    height: 40px;
  }

  .item-icon .material-symbols-outlined {
    font-size: 20px;
  }
}

.item-icon .material-symbols-outlined {
  font-size: 24px;
  color: var(--on-primary);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 599px) {
  .item-title {
    font-size: 14px;
  }
}

.item-subtitle {
  font-size: 13px;
  color: var(--outline);
  margin: 0;
}

@media (max-width: 599px) {
  .item-subtitle {
    font-size: 12px;
  }
}

.item-body {
  padding: 16px;
  padding-top: 0 !important;
}

.approval-status {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

@media (max-width: 599px) {
  .approval-status {
    gap: 12px;
    margin-bottom: 12px;
  }
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

@media (max-width: 599px) {
  .approval-item {
    font-size: 10px;
  }

  .approval-item .material-symbols-outlined {
    font-size: 14px;
  }
}

.approval-item.true {
  color: var(--positive);
}

.approval-item.false {
  color: var(--negative);
}

.item-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--outline);
}

.empty-state .material-symbols-outlined {
  font-size: 64px;
  color: var(--tertiary);
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0;
}
</style>
