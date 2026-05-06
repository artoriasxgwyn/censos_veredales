<template>
  <div class="dashboard-page">
    <div class="dashboard-content">
      <!-- Page Header -->
      <div class="page-header">
        <p class="page-subtitle">Panel Personal</p>
        <h1 class="page-title">Bienvenido, {{ userName }}</h1>
        <p class="page-description">Gestión de censos y registros</p>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <q-card class="stat-card">
          <div class="stat-icon primary">
            <span class="material-symbols-outlined">home</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.myDwellings }}</div>
            <div class="stat-label">Viviendas Registradas por Mí</div>
          </div>
        </q-card>

        <q-card class="stat-card">
          <div class="stat-icon secondary">
            <span class="material-symbols-outlined">people</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.myResidents }}</div>
            <div class="stat-label">Residentes Registrados por Mí</div>
          </div>
        </q-card>

        <q-card class="stat-card">
          <div class="stat-icon warning">
            <span class="material-symbols-outlined">hourglass_top</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.pendingApprovals }}</div>
            <div class="stat-label">Pendientes de Aprobación</div>
          </div>
        </q-card>
      </div>

      <!-- Consejos Útiles -->
      <section class="tips-section">
        <div class="tips-card">
          <span class="material-symbols-outlined tips-icon">lightbulb</span>
          <div class="tips-content">
            <h3 class="tips-title">Consejos Útiles</h3>
            <ul class="tips-list">
              <li>Recuerda tomar foto de la fachada de la vivienda</li>
              <li>Captura la firma digital del residente antes de guardar</li>
              <li>Verifica que la nomenclatura sea correcta antes de registrar</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Mis Registros Recientes -->
      <section class="recent-registrations-section">
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

      <!-- Accesos Rápidos -->
      <section class="quick-actions-section">
        <div class="section-header">
          <span class="material-symbols-outlined">bolt</span>
          <h2 class="section-title">Accesos Rápidos</h2>
        </div>

        <div class="actions-grid">
          <router-link to="/censista/dwellings/new" class="action-card primary" v-if="hasPermission('dwelling', 'create')">
            <span class="material-symbols-outlined">add_circle</span>
            <span>Registrar Vivienda</span>
          </router-link>

          <router-link to="/censista/residents/new" class="action-card secondary" v-if="hasPermission('resident', 'create')">
            <span class="material-symbols-outlined">person_add</span>
            <span>Registrar Residente</span>
          </router-link>

          <router-link to="/censista/qr-scanner" class="action-card tertiary" v-if="hasPermission('letter', 'qrScan')">
            <span class="material-symbols-outlined">qr_code_scanner</span>
            <span>Escanear QR</span>
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useDashboardStore } from '@/stores/dashboard.store'
import { useDwellingStore } from '@/stores/dwelling.store'
import { useResidentStore } from '@/stores/resident.store'

const authStore = useAuthStore()
const dashboardStore = useDashboardStore()
const dwellingStore = useDwellingStore()
const residentStore = useResidentStore()

// Verificar permisos usando el getter del store
const hasPermission = (module, action) => {
  return authStore.hasPermission(module, action)
}

const userName = computed(() => authStore.user?.fullName || 'Censista')

const stats = computed(() => {
  return dashboardStore.censusTakerStats?.stats || {
    myDwellings: 0,
    myResidents: 0,
    pendingApprovals: 0
  }
})

// Obtener registros recientes del censista desde el endpoint
const recentRegistrations = computed(() => {
  return dashboardStore.censusTakerStats?.recentRegistrations || []
})

onMounted(async () => {
  await dashboardStore.fetchCensusTakerDashboard()
  // Mantener stores locales cargados para otras vistas que puedan depender de ellos
  await Promise.all([
    dwellingStore.fetchDwellings(),
    residentStore.fetchResidents()
  ])
})

const getIconForType = (type) => {
  const icons = {
    dwelling: 'home',
    resident: 'person'
  }
  return icons[type] || 'info'
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    approved: 'positive',
    rejected: 'negative'
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
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: var(--surface-container-lowest);
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
  margin-bottom: 24px;
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

/* Tips Section */
.tips-section {
  margin-bottom: 24px;
}

.tips-card {
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--info-container) 100%);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 20px;
  box-shadow: 0 4px 12px rgba(25, 28, 30, 0.04);
}

@media (max-width: 599px) {
  .tips-card {
    padding: 20px;
    gap: 16px;
  }
}

.tips-icon {
  font-size: 40px;
  color: var(--primary);
  flex-shrink: 0;
}

.tips-content {
  flex: 1;
}

.tips-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  margin: 0 0 12px 0;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
}

.tips-list li {
  font-size: 14px;
  color: var(--on-primary-container);
  line-height: 1.8;
}

@media (max-width: 599px) {
  .tips-icon {
    font-size: 32px;
  }

  .tips-title {
    font-size: 16px;
    margin-bottom: 8px;
  }

  .tips-list li {
    font-size: 13px;
    line-height: 1.6;
  }
}

/* Recent Registrations Section */
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

.recent-list {
  min-height: 100px;
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

.status-badge {
  font-size: 11px;
  padding: 4px 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Quick Actions Section */
.quick-actions-section {
  background: var(--surface-container-lowest);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 16px 32px rgba(25, 28, 30, 0.06);
}

@media (max-width: 599px) {
  .quick-actions-section {
    padding: 16px;
  }
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

@media (max-width: 599px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 24px;
  background: var(--surface-container);
  border: 1px solid var(--surface-container-highest);
  border-radius: 12px;
  text-decoration: none;
  color: var(--on-surface);
  transition: all 0.2s;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(25, 28, 30, 0.1);
}

.action-card.primary {
  background: var(--primary);
  border-color: var(--primary);
}

.action-card.primary .material-symbols-outlined,
.action-card.primary span:last-child {
  color: var(--on-primary);
}

.action-card.secondary {
  background: var(--info);
  border-color: var(--info);
}

.action-card.secondary .material-symbols-outlined,
.action-card.secondary span:last-child {
  color: var(--on-info);
}

.action-card.tertiary {
  background: var(--success);
  border-color: var(--success);
}

.action-card.tertiary .material-symbols-outlined,
.action-card.tertiary span:last-child {
  color: var(--on-success);
}

.action-card .material-symbols-outlined {
  font-size: 40px;
}

.action-card span:last-child {
  font-size: 14px;
  font-weight: 700;
}

@media (max-width: 599px) {
  .action-card {
    padding: 24px 20px;
  }

  .action-card .material-symbols-outlined {
    font-size: 32px;
  }

  .action-card span:last-child {
    font-size: 13px;
  }
}
</style>
