<template>
  <div class="dashboard-page">
    <div class="dashboard-content">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <p class="page-subtitle">{{ pageTitle }}</p>
          <h1 class="page-title">{{ pageTitle }}</h1>
          <p class="page-description">{{ pageDescription }}</p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <q-card class="stat-card">
          <div class="stat-icon primary">
            <span class="material-symbols-outlined">people</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalResidents }}</div>
            <div class="stat-label">Total Residentes</div>
          </div>
        </q-card>

        <q-card class="stat-card">
          <div class="stat-icon secondary">
            <span class="material-symbols-outlined">home</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalDwellings }}</div>
            <div class="stat-label">Total Viviendas</div>
          </div>
        </q-card>

        <q-card class="stat-card">
          <div class="stat-icon tertiary">
            <span class="material-symbols-outlined">calendar_month</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.upcomingAnniversaries }}</div>
            <div class="stat-label">Próximos a cumplir 1 año</div>
          </div>
        </q-card>

        <q-card class="stat-card">
          <div class="stat-icon warning">
            <span class="material-symbols-outlined">hourglass_top</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.pendingApprovals }}</div>
            <div class="stat-label">{{ pendingLabel }}</div>
          </div>
        </q-card>
      </div>

      <!-- Bento Layout -->
      <div class="bento-grid">
        <!-- Main Content - Quick Actions -->
        <section class="bento-main">
          <div class="card-header">
            <span class="material-symbols-outlined">apps</span>
            <h2 class="card-title">Accesos Rápidos</h2>
          </div>
          <div class="actions-grid">
            <router-link to="/president/approvals" class="action-card highlight" v-if="hasPermission('resident', 'update')">
              <span class="material-symbols-outlined">pending_actions</span>
              <span>Aprobaciones</span>
              <q-badge v-if="pendingApprovalsForPresident > 0" color="warning" class="count-badge">
                {{ pendingApprovalsForPresident }}
              </q-badge>
            </router-link>

            <router-link to="/admin/dwellings" class="action-card" v-if="hasPermission('dwelling', 'read')">
              <span class="material-symbols-outlined">home</span>
              <span>Viviendas</span>
            </router-link>

            <router-link to="/admin/residents" class="action-card" v-if="hasPermission('resident', 'read')">
              <span class="material-symbols-outlined">people</span>
              <span>Residentes</span>
            </router-link>

            <router-link to="/admin/letters" class="action-card" v-if="hasPermission('letter', 'read')">
              <span class="material-symbols-outlined">description</span>
              <span>Cartas</span>
            </router-link>

            <router-link to="/admin/announcements" class="action-card" v-if="hasPermission('announcement', 'read')">
              <span class="material-symbols-outlined">campaign</span>
              <span>Anuncios</span>
            </router-link>

            <router-link to="/admin/users" class="action-card" v-if="hasPermission('user', 'read')">
              <span class="material-symbols-outlined">group</span>
              <span>Usuarios</span>
            </router-link>

            <router-link to="/president/roles" class="action-card" v-if="hasPermission('user', 'manageRoles')">
              <span class="material-symbols-outlined">badge</span>
              <span>Roles</span>
            </router-link>

            <router-link to="/president/qr-scanner" class="action-card" v-if="hasPermission('letter', 'qrScan')">
              <span class="material-symbols-outlined">qr_code_scanner</span>
              <span>Escanear QR</span>
            </router-link>

            <router-link to="/president/audit-logs" class="action-card" v-if="hasPermission('dashboard', 'access')">
              <span class="material-symbols-outlined">fact_check</span>
              <span>Auditoría</span>
            </router-link>
          </div>
        </section>

        <!-- Side Panel - Impact Card -->
        <aside class="bento-side">
          <div class="impact-card">
            <span class="material-symbols-outlined impact-icon">analytics</span>
            <h3 class="impact-title">Impacto Comunitario</h3>
            <p class="impact-description">La gestión eficiente mejora la asignación de recursos significativamente.</p>
            <div class="impact-stat">
              <span class="impact-value">{{ stats.pendingApprovals === 0 ? '100' : '92' }}%</span>
              <span class="impact-label">Datos Verificados</span>
            </div>
          </div>

          <div class="status-card">
            <div class="status-icon">
              <span class="material-symbols-outlined">check_circle</span>
            </div>
            <div class="status-content">
              <p class="status-text">Estado del Sistema</p>
              <p class="status-subtext">Certificación institucional activa</p>
            </div>
          </div>
        </aside>
      </div>

      <!-- Últimos Anuncios -->
      <section class="announcements-section">
        <div class="section-header">
          <span class="material-symbols-outlined">campaign</span>
          <h2 class="section-title">Últimos Anuncios</h2>
        </div>

        <div class="announcements-grid">
          <div v-if="dashboardStore.adminStats?.recentAnnouncements?.length === 0" class="empty-state">
            <span class="material-symbols-outlined">campaign</span>
            <p>No hay anuncios publicados recientemente</p>
          </div>

          <div
            v-for="announcement in dashboardStore.adminStats?.recentAnnouncements"
            :key="announcement._id"
            class="announcement-card"
            @click="router.push(`/admin/announcements/${announcement._id}`)"
          >
            <h3 class="announcement-title">{{ announcement.title }}</h3>
            <p class="announcement-header">{{ announcement.header }}</p>
            <p class="announcement-body">{{ truncate(announcement.body, 120) }}</p>
            <div class="announcement-footer">
              <span class="announcement-date">{{ formatDate(announcement.publishedAt) }}</span>
              <span class="announcement-author">por {{ announcement.createdBy?.fullName || 'Admin' }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Mis Registros Recientes (Presidente, Secretario y Tesorero) -->
      <section v-if="isPresident || isSecretary || isTreasurer" class="recent-registrations-section">
        <div class="section-header">
          <span class="material-symbols-outlined">fact_check</span>
          <h2 class="section-title">Mis Registros Recientes</h2>
        </div>

        <div class="recent-list">
          <div v-if="recentRegistrations.length === 0" class="empty-state">
            <span class="material-symbols-outlined">info</span>
            <p>No has registrado elementos recientemente</p>
          </div>

          <div v-else class="recent-items">
            <div v-for="item in recentRegistrations" :key="item._id" class="recent-item">
              <div class="recent-info">
                <span class="material-symbols-outlined recent-icon">{{ getIconForType(item.type) }}</span>
                <div class="recent-details">
                  <p class="recent-name">{{ item.name }}</p>
                  <p class="recent-type">{{ item.type }} • {{ formatDate(item.createdAt) }}</p>
                </div>
              </div>
              <q-badge :color="getStatusColor(item.status)" class="status-badge">
                {{ item.status }}
              </q-badge>
            </div>
          </div>
        </div>
      </section>

      <!-- Aprobaciones Pendientes (Mi Voto Pendiente) -->
      <section class="pending-section">
        <div class="section-header">
          <span class="material-symbols-outlined">pending_actions</span>
          <h2 class="section-title">Pendientes de Mi Voto</h2>
        </div>

        <div class="pending-list">
          <div v-if="myPendingItems.length === 0" class="empty-state">
            <span class="material-symbols-outlined">check_circle</span>
            <p>No tienes aprobaciones pendientes</p>
          </div>

          <div v-else class="pending-items">
            <div v-for="item in myPendingItems" :key="item._id" class="pending-item">
              <div class="pending-info">
                <span class="material-symbols-outlined pending-icon">{{ getIconForType(item.type) }}</span>
                <div class="pending-details">
                  <p class="pending-name">{{ item.name }}</p>
                  <p class="pending-type">{{ item.typeLabel }}</p>
                </div>
              </div>
              <div class="pending-actions">
                <q-badge :color="getStatusColor(item.status)" class="status-badge">
                  {{ item.status }}
                </q-badge>
                <div class="action-buttons">
                  <q-btn
                    flat
                    round
                    dense
                    color="positive"
                    icon="check"
                    @click="handleApprove(item)"
                    class="action-btn"
                  />
                  <q-btn
                    flat
                    round
                    dense
                    color="negative"
                    icon="close"
                    @click="handleReject(item)"
                    class="action-btn"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth.store'
import { useDashboardStore } from '@/stores/dashboard.store'
import { useDwellingStore } from '@/stores/dwelling.store'
import { useResidentStore } from '@/stores/resident.store'
import { useLetterStore } from '@/stores/letter.store'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const dashboardStore = useDashboardStore()
const dwellingStore = useDwellingStore()
const residentStore = useResidentStore()
const letterStore = useLetterStore()

const isPresident = computed(() => authStore.isPresident)
const isSecretary = computed(() => authStore.isSecretary)
const isTreasurer = computed(() => authStore.isTreasurer)

// Verificar permisos usando el getter del store
const hasPermission = (module, action) => {
  return authStore.hasPermission(module, action)
}

// Redirect president to their specific dashboard
onMounted(() => {
  if (authStore.isPresident) {
    router.replace('/president/dashboard')
    return
  }
})

const stats = ref({
  totalResidents: 0,
  totalDwellings: 0,
  upcomingAnniversaries: 0,
  pendingApprovals: 0
})

const pageTitle = computed(() => {
  if (isSecretary.value) return 'Secretaría'
  if (isTreasurer.value) return 'Tesorería'
  return 'Administración'
})

const pageDescription = computed(() => {
  if (isSecretary.value) return 'Gestión de documentos y aprobaciones'
  if (isTreasurer.value) return 'Control financiero y aprobaciones'
  return 'Gestión de comunidad y residentes'
})

// Calcular aprobaciones pendientes para el badge de accesos rápidos (solo presidente)
const pendingApprovalsForPresident = computed(() => {
  const dwellingsToApprove = dwellingStore.dwellings.filter(d => d.approvedByPresident === 'pending').length
  const residentsToApprove = residentStore.residents.filter(r => r.approvedByPresident === 'pending').length
  const lettersToApprove = letterStore.letters.filter(l => l.approvedByPresident === 'pending').length
  return dwellingsToApprove + residentsToApprove + lettersToApprove
})

// Obtener items pendientes de MI voto (cada rol ve solo lo que aún no ha votado)
const myPendingItems = computed(() => {
  const items = []

  if (isPresident.value) {
    // Presidente ve solo donde él NO ha votado
    dwellingStore.dwellings
      .filter(d => d.approvedByPresident === 'pending')
      .forEach(d => items.push({
        _id: d._id,
        type: 'dwelling',
        typeLabel: 'Vivienda',
        name: d.houseNomenclature || 'Sin nomenclatura',
        status: d.status
      }))

    residentStore.residents
      .filter(r => r.approvedByPresident === 'pending')
      .forEach(r => items.push({
        _id: r._id,
        type: 'resident',
        typeLabel: 'Residente',
        name: r.userId?.fullName || 'Residente',
        status: r.status
      }))

    letterStore.letters
      .filter(l => l.approvedByPresident === 'pending')
      .forEach(l => items.push({
        _id: l._id,
        type: 'letter',
        typeLabel: `Carta ${l.type}`,
        name: `Carta ${l.type}`,
        status: l.status
      }))
  }

  if (isSecretary.value) {
    // Secretario ve solo donde él NO ha votado
    dwellingStore.dwellings
      .filter(d => d.approvedBySecretary === 'pending')
      .forEach(d => items.push({
        _id: d._id,
        type: 'dwelling',
        typeLabel: 'Vivienda',
        name: d.houseNomenclature || 'Sin nomenclatura',
        status: d.status
      }))

    residentStore.residents
      .filter(r => r.approvedBySecretary === 'pending')
      .forEach(r => items.push({
        _id: r._id,
        type: 'resident',
        typeLabel: 'Residente',
        name: r.userId?.fullName || 'Residente',
        status: r.status
      }))

    letterStore.letters
      .filter(l => l.approvedBySecretary === 'pending')
      .forEach(l => items.push({
        _id: l._id,
        type: 'letter',
        typeLabel: `Carta ${l.type}`,
        name: `Carta ${l.type}`,
        status: l.status
      }))
  }

  if (isTreasurer.value) {
    // Tesorero ve solo donde él NO ha votado
    dwellingStore.dwellings
      .filter(d => d.approvedByTreasurer === 'pending')
      .forEach(d => items.push({
        _id: d._id,
        type: 'dwelling',
        typeLabel: 'Vivienda',
        name: d.houseNomenclature || 'Sin nomenclatura',
        status: d.status
      }))

    residentStore.residents
      .filter(r => r.approvedByTreasurer === 'pending')
      .forEach(r => items.push({
        _id: r._id,
        type: 'resident',
        typeLabel: 'Residente',
        name: r.userId?.fullName || 'Residente',
        status: r.status
      }))

    letterStore.letters
      .filter(l => l.approvedByTreasurer === 'pending')
      .forEach(l => items.push({
        _id: l._id,
        type: 'letter',
        typeLabel: `Carta ${l.type}`,
        name: `Carta ${l.type}`,
        status: l.status
      }))
  }

  return items
})

// Obtener registros recientes según el rol (Secretario y Tesorero)
const recentRegistrations = computed(() => {
  const items = []
  const currentUserId = authStore.user?.id

  const myDwellings = dwellingStore.dwellings
    .filter(d => d.createdBy === currentUserId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const myResidents = residentStore.residents
    .filter(r => r.createdBy === currentUserId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return [...myDwellings.map(d => ({
    _id: d._id,
    type: 'dwelling',
    name: d.houseNomenclature || 'Sin nomenclatura',
    status: d.status,
    createdAt: d.createdAt
  })), ...myResidents.map(r => ({
    _id: r._id,
    type: 'resident',
    name: r.userId?.fullName || 'Residente',
    status: r.status,
    createdAt: r.createdAt
  }))]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
})

// Calcular próximos aniversarios de 1 año
const calculateUpcomingAnniversaries = () => {
  const now = new Date()
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  const oneYearAndThirtyDaysAgo = new Date(now.getTime() - (365 + 30) * 24 * 60 * 60 * 1000)

  return residentStore.residents.filter(r => {
    if (!r.createdAt) return false
    const createdAt = new Date(r.createdAt)
    return createdAt >= oneYearAndThirtyDaysAgo && createdAt <= oneYearAgo
  }).length
}

onMounted(async () => {
  // Fetch dashboard data from API
  await dashboardStore.fetchAdminDashboard()

  // Fetch data for pending approvals badge
  await Promise.all([
    dwellingStore.fetchDwellings(),
    residentStore.fetchResidents(),
    letterStore.fetchCommunityLetters()
  ])

  // Calcular stats desde los datos locales
  stats.value = {
    totalResidents: residentStore.residentCount || 0,
    totalDwellings: dwellingStore.dwellingCount || 0,
    upcomingAnniversaries: calculateUpcomingAnniversaries(),
    pendingApprovals: pendingApprovalsForPresident.value
  }
})

const getIconForType = (type) => {
  const icons = {
    dwelling: 'home',
    resident: 'person',
    letter: 'description'
  }
  return icons[type] || 'info'
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

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const truncate = (text, length) => {
  if (!text) return ''
  // Quitar tags HTML antes de truncar
  const plainText = text.replace(/<[^>]*>/g, '')
  return plainText.length > length ? plainText.substring(0, length) + '...' : plainText
}

const handleApprove = async (item) => {
  try {
    let result
    const userRole = authStore.userRole

    if (item.type === 'dwelling') {
      result = await dwellingStore.approveDwelling(item._id, userRole, 'approved')
    } else if (item.type === 'resident') {
      result = await residentStore.approveResident(item._id, userRole, 'approved')
    } else if (item.type === 'letter') {
      result = await letterStore.approveLetter(item._id, userRole, 'approved')
    }

    if (result?.success) {
      $q.notify({
        type: 'positive',
        message: `${item.typeLabel} aprobado exitosamente`
      })
      // Refresh data para que el item desaparezca de la lista
      await Promise.all([
        dwellingStore.fetchDwellings(),
        residentStore.fetchResidents(),
        letterStore.fetchCommunityLetters()
      ])
    } else {
      throw new Error(result?.message || 'Error al aprobar')
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al aprobar'
    })
  }
}

const handleReject = async (item) => {
  try {
    let result
    const userRole = authStore.userRole

    if (item.type === 'dwelling') {
      result = await dwellingStore.approveDwelling(item._id, userRole, 'rejected')
    } else if (item.type === 'resident') {
      result = await residentStore.approveResident(item._id, userRole, 'rejected')
    } else if (item.type === 'letter') {
      result = await letterStore.approveLetter(item._id, userRole, 'rejected')
    }

    if (result?.success) {
      $q.notify({
        type: 'negative',
        message: `${item.typeLabel} rechazado`
      })
      // Refresh data para que el item desaparezca de la lista
      await Promise.all([
        dwellingStore.fetchDwellings(),
        residentStore.fetchResidents(),
        letterStore.fetchCommunityLetters()
      ])
    } else {
      throw new Error(result?.message || 'Error al rechazar')
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al rechazar'
    })
  }
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: var(--surface-container-low);
}

.dashboard-content {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 599px) {
  .dashboard-content {
    padding: 16px;
  }
}

/* Page Header */
.page-header {
  margin-bottom: 32px;
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
    margin-bottom: 6px;
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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

@media (max-width: 599px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
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
  background: var(--surface-container-lowest) !important;
  box-shadow: 0 4px 12px rgba(25, 28, 30, 0.04) !important;
}

@media (max-width: 599px) {
  .stat-card {
    padding: 16px !important;
    gap: 12px;
  }
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

.stat-icon.primary { background: var(--primary); }
.stat-icon.primary .material-symbols-outlined { color: var(--on-primary); }

.stat-icon.secondary { background: var(--info); }
.stat-icon.secondary .material-symbols-outlined { color: var(--on-info); }

.stat-icon.tertiary { background: var(--success); }
.stat-icon.tertiary .material-symbols-outlined { color: var(--on-success); }

.stat-icon.warning { background: var(--warning); }
.stat-icon.warning .material-symbols-outlined { color: var(--on-warning); }

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

@media (max-width: 599px) {
  .stat-icon {
    width: 48px;
    height: 48px;
  }

  .stat-icon .material-symbols-outlined {
    font-size: 24px;
  }

  .stat-value {
    font-size: 22px;
  }

  .stat-label {
    font-size: 11px;
  }
}

/* Bento Grid */
.bento-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  margin-bottom: 24px;
}

@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }
}

/* Main Card */
.bento-main {
  background: var(--surface-container-lowest);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 16px 32px rgba(25, 28, 30, 0.06);
}

@media (max-width: 599px) {
  .bento-main {
    padding: 16px;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.card-header .material-symbols-outlined {
  color: var(--primary);
  font-size: 24px;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
}

@media (max-width: 599px) {
  .card-header {
    gap: 8px;
    margin-bottom: 16px;
  }

  .card-header .material-symbols-outlined {
    font-size: 20px;
  }

  .card-title {
    font-size: 16px;
  }
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

@media (min-width: 1200px) {
  .actions-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 599px) {
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}

@media (max-width: 399px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 16px;
  background: var(--surface-container);
  border: 1px solid var(--surface-container-highest);
  border-radius: 10px;
  text-decoration: none;
  color: var(--on-surface);
  transition: all 0.2s;
  position: relative;
}

.action-card:hover {
  background: var(--primary-50);
  border-color: var(--primary);
  transform: translateY(-2px);
}

.action-card.highlight {
  background: var(--primary-50);
  border-color: var(--primary);
}

.action-card .material-symbols-outlined {
  font-size: 32px;
  color: var(--primary);
}

.action-card span:last-child {
  font-size: 13px;
  font-weight: 600;
  color: var(--on-surface-variant);
}

@media (max-width: 599px) {
  .action-card {
    padding: 16px 12px;
    gap: 8px;
  }

  .action-card .material-symbols-outlined {
    font-size: 28px;
  }

  .action-card span:last-child {
    font-size: 12px;
  }
}

.count-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10px;
  padding: 2px 6px;
}

/* Side Panel */
.bento-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.impact-card {
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--info-container) 100%);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  min-height: 180px;
}

@media (max-width: 599px) {
  .impact-card {
    padding: 20px;
    min-height: 140px;
  }
}

.impact-icon {
  font-size: 36px;
  color: var(--primary);
  margin-bottom: 12px;
}

.impact-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--primary);
  margin: 0 0 8px 0;
}

.impact-description {
  font-size: 13px;
  color: var(--on-primary-container);
  line-height: 1.5;
  margin: 0 0 auto 0;
}

.impact-stat {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 16px;
}

.impact-value {
  font-size: 36px;
  font-weight: 900;
  color: var(--primary);
  letter-spacing: -0.03em;
}

.impact-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--on-primary-container);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

@media (max-width: 599px) {
  .impact-icon {
    font-size: 28px;
    margin-bottom: 8px;
  }

  .impact-title {
    font-size: 16px;
    margin-bottom: 6px;
  }

  .impact-description {
    font-size: 12px;
  }

  .impact-value {
    font-size: 28px;
  }

  .impact-label {
    font-size: 9px;
  }
}

.status-card {
  background: var(--surface-container-lowest);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(25, 28, 30, 0.04);
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--success);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon .material-symbols-outlined {
  font-size: 24px;
  color: var(--on-success);
}

.status-content {
  flex: 1;
}

.status-text {
  font-size: 14px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
}

.status-subtext {
  font-size: 12px;
  color: var(--outline);
  margin: 2px 0 0 0;
}

/* Section Header (reutilizable) */
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-header .material-symbols-outlined {
  color: var(--primary);
  font-size: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
}

@media (max-width: 599px) {
  .section-header {
    gap: 8px;
    margin-bottom: 16px;
  }

  .section-header .material-symbols-outlined {
    font-size: 20px;
  }

  .section-title {
    font-size: 16px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--outline);
}

.empty-state .material-symbols-outlined {
  font-size: 48px;
  color: var(--success);
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

/* Pending Approvals Section */
.pending-section {
  background: var(--surface-container-lowest);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 16px 32px rgba(25, 28, 30, 0.06);
  margin-bottom: 24px;
}

@media (max-width: 599px) {
  .pending-section {
    padding: 16px;
  }
}

.pending-list {
  min-height: 100px;
}

.pending-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pending-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--surface-container);
  border-radius: 10px;
  transition: background 0.2s;
}

.pending-item:hover {
  background: var(--primary-50);
}

.pending-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pending-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--surface-container-lowest);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.pending-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0;
}

.pending-type {
  font-size: 12px;
  color: var(--outline);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 2px 0 0 0;
}

.pending-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  font-size: 11px;
  padding: 4px 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
}

/* Recent Registrations Section (Secretary/Treasurer) */
.recent-registrations-section {
  background: var(--surface-container-lowest);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 16px 32px rgba(25, 28, 30, 0.06);
  margin-bottom: 24px;
}

@media (max-width: 599px) {
  .recent-registrations-section {
    padding: 16px;
  }
}

.recent-list {
  min-height: 100px;
}

.recent-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--surface-container);
  border-radius: 10px;
  transition: background 0.2s;
}

.recent-item:hover {
  background: var(--primary-50);
}

.recent-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.recent-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--surface-container-lowest);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.recent-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0;
}

.recent-type {
  font-size: 12px;
  color: var(--outline);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 2px 0 0 0;
}

/* Announcements Section */
.announcements-section {
  background: var(--surface-container-lowest);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 16px 32px rgba(25, 28, 30, 0.06);
  margin-bottom: 24px;
}

@media (max-width: 599px) {
  .announcements-section {
    padding: 16px;
  }
}

.announcements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.announcement-card {
  background: var(--surface-container);
  border: 1px solid var(--surface-container-highest);
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.announcement-card:hover {
  background: var(--primary-50);
  border-color: var(--primary);
  transform: translateY(-2px);
}

.announcement-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 8px 0;
}

.announcement-header {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  margin: 0 0 8px 0;
}

.announcement-body {
  font-size: 14px;
  color: var(--on-surface-variant);
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.announcement-date {
  font-size: 12px;
  color: var(--outline);
  white-space: nowrap;
}

.announcement-author {
  font-size: 12px;
  color: var(--primary);
  font-weight: 600;
  white-space: nowrap;
}

@media (max-width: 599px) {
  .announcement-title {
    font-size: 14px;
  }

  .announcement-body {
    font-size: 13px;
  }
}
</style>
