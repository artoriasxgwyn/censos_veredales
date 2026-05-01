<template>
  <div class="page">
    <div class="page-content">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <p class="page-subtitle">Configuración Avanzada</p>
          <h1 class="page-title">Registro de Auditoría</h1>
          <p class="page-description">Monitoree todas las actividades realizadas en la comunidad</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="search-box">
          <span class="material-symbols-outlined">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar en logs..."
            class="search-input"
          />
        </div>
        <div class="filter-row">
          <q-select
            v-model="selectedModule"
            :options="moduleOptions"
            label="Módulo"
            outlined
            dense
            clearable
            class="filter-select"
          />
          <q-select
            v-model="selectedAction"
            :options="actionOptions"
            label="Acción"
            outlined
            dense
            clearable
            class="filter-select"
          />
          <div class="date-range">
            <q-input
              v-model="dateFrom"
              type="date"
              label="Desde"
              outlined
              dense
              class="date-input"
            />
            <q-input
              v-model="dateTo"
              type="date"
              label="Hasta"
              outlined
              dense
              class="date-input"
            />
          </div>
          <q-btn
            color="primary"
            label="Exportar"
            icon="download"
            @click="exportLogs"
            class="export-btn"
          />
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <q-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ filteredLogs.length }}</div>
            <div class="stat-label">Logs Filtrados</div>
          </div>
        </q-card>
        <q-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ logsByAction.create }}</div>
            <div class="stat-label">Creaciones</div>
          </div>
        </q-card>
        <q-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ logsByAction.update }}</div>
            <div class="stat-label">Actualizaciones</div>
          </div>
        </q-card>
        <q-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ logsByAction.delete }}</div>
            <div class="stat-label">Eliminaciones</div>
          </div>
        </q-card>
      </div>

      <!-- Logs Table -->
      <div class="logs-section">
        <q-card class="table-card">
          <div class="table-header">
            <h3 class="table-title">Actividad Reciente</h3>
            <q-btn
              flat
              round
              dense
              icon="refresh"
              @click="loadLogs"
            >
              <q-tooltip>Actualizar</q-tooltip>
            </q-btn>
          </div>

          <div class="table-wrapper" v-if="!loading">
            <table class="logs-table">
              <thead>
                <tr>
                  <th>Fecha/Hora</th>
                  <th>Usuario</th>
                  <th>Módulo</th>
                  <th>Acción</th>
                  <th>Recurso</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="log in paginatedLogs"
                  :key="log._id || log.timestamp"
                  :class="['log-row', getActionClass(log.action)]"
                >
                  <td class="timestamp">
                    {{ formatDateTime(log.timestamp || log.createdAt) }}
                  </td>
                  <td class="user">
                    <div class="user-cell">
                      <span class="material-symbols-outlined">person</span>
                      <span>{{ log.userName || 'Sistema' }}</span>
                    </div>
                  </td>
                  <td>
                    <q-badge :color="getModuleColor(log.module)">
                      {{ log.module }}
                    </q-badge>
                  </td>
                  <td>
                    <q-badge :color="getActionColor(log.action)">
                      {{ log.action }}
                    </q-badge>
                  </td>
                  <td class="resource">{{ log.resource || 'N/A' }}</td>
                  <td class="details">{{ truncate(log.details, 50) }}</td>
                </tr>
                <tr v-if="paginatedLogs.length === 0">
                  <td colspan="6" class="empty-cell">
                    <span class="material-symbols-outlined">history</span>
                    <p>No hay registros de auditoría</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="loading-state">
            <q-spinner color="primary" size="48px" />
            <p>Cargando registros...</p>
          </div>

          <!-- Pagination -->
          <div class="pagination" v-if="totalPages > 1">
            <q-btn
              flat
              round
              dense
              icon="chevron_left"
              @click="currentPage--"
              :disable="currentPage === 1"
            />
            <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
            <q-btn
              flat
              round
              dense
              icon="chevron_right"
              @click="currentPage++"
              :disable="currentPage === totalPages"
            />
          </div>
        </q-card>
      </div>

      <!-- Info Banner -->
      <q-card class="info-banner">
        <span class="material-symbols-outlined">info</span>
        <div class="info-content">
          <strong>Nota:</strong> Los registros de auditoría se almacenan durante 90 días.
          Para exportar datos históricos, contacte al administrador del sistema.
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const $q = useQuasar()
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

const loading = ref(false)
const searchQuery = ref('')
const selectedModule = ref(null)
const selectedAction = ref(null)
const dateFrom = ref('')
const dateTo = ref('')
const currentPage = ref(1)
const itemsPerPage = 20

// Mock data for audit logs (since backend endpoint doesn't exist yet)
const auditLogs = ref([])

const moduleOptions = ['Auth', 'Users', 'Roles', 'Dwellings', 'Residents', 'Letters', 'Announcements', 'Communities']
const actionOptions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT']

const filteredLogs = computed(() => {
  let result = auditLogs.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(log =>
      log.userName?.toLowerCase().includes(query) ||
      log.module?.toLowerCase().includes(query) ||
      log.action?.toLowerCase().includes(query) ||
      log.details?.toLowerCase().includes(query)
    )
  }

  if (selectedModule.value) {
    result = result.filter(log => log.module === selectedModule.value)
  }

  if (selectedAction.value) {
    result = result.filter(log => log.action === selectedAction.value)
  }

  if (dateFrom.value) {
    const fromDate = new Date(dateFrom.value)
    result = result.filter(log => new Date(log.timestamp) >= fromDate)
  }

  if (dateTo.value) {
    const toDate = new Date(dateTo.value)
    toDate.setHours(23, 59, 59)
    result = result.filter(log => new Date(log.timestamp) <= toDate)
  }

  return result
})

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredLogs.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / itemsPerPage))

const logsByAction = computed(() => {
  const counts = { create: 0, update: 0, delete: 0 }
  filteredLogs.value.forEach(log => {
    const action = log.action?.toLowerCase()
    if (action === 'create') counts.create++
    else if (action === 'update') counts.update++
    else if (action === 'delete') counts.delete++
  })
  return counts
})

onMounted(() => {
  loadLogs()
})

const loadLogs = () => {
  loading.value = true

  // Generate mock data for demonstration
  setTimeout(() => {
    const mockUsers = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez']
    const mockModules = ['Users', 'Residents', 'Dwellings', 'Letters', 'Announcements']
    const mockActions = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT']
    const mockResources = ['Usuario #123', 'Residente #456', 'Vivienda #789', 'Carta #ABC']

    auditLogs.value = Array.from({ length: 50 }, (_, i) => ({
      _id: `log_${i}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      userName: mockUsers[Math.floor(Math.random() * mockUsers.length)],
      module: mockModules[Math.floor(Math.random() * mockModules.length)],
      action: mockActions[Math.floor(Math.random() * mockActions.length)],
      resource: mockResources[Math.floor(Math.random() * mockResources.length)],
      details: `El usuario realizó una acción en el sistema. Detalles adicionales de la operación.`
    }))

    loading.value = false
  }, 500)
}

const getActionClass = (action) => {
  return `action-${action?.toLowerCase()}`
}

const getModuleColor = (module) => {
  const colors = {
    Auth: 'primary',
    Users: 'secondary',
    Roles: 'tertiary',
    Dwellings: 'warning',
    Residents: 'positive',
    Letters: 'info',
    Announcements: 'accent',
    Communities: 'dark'
  }
  return colors[module] || 'grey'
}

const getActionColor = (action) => {
  const colors = {
    CREATE: 'positive',
    UPDATE: 'info',
    DELETE: 'negative',
    LOGIN: 'primary',
    LOGOUT: 'secondary',
    APPROVE: 'positive',
    REJECT: 'negative'
  }
  return colors[action] || 'grey'
}

const formatDateTime = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const truncate = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const exportLogs = () => {
  const data = filteredLogs.value.map(log => ({
    Fecha: log.timestamp,
    Usuario: log.userName,
    Módulo: log.module,
    Acción: log.action,
    Recurso: log.resource,
    Detalles: log.details
  }))

  const csv = [
    Object.keys(data[0] || {}).join(','),
    ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    message: 'Registros exportados exitosamente'
  })
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

/* Filters */
.filters-section {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-box .material-symbols-outlined {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--outline);
  font-size: 20px;
}

.search-input {
  width: 100%;
  padding: 14px 44px 14px 48px;
  background: var(--surface-container-low);
  border: 1px solid var(--surface-container-highest);
  border-radius: 12px;
  font-size: 14px;
  color: var(--on-surface);
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-50);
}

.filter-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-select {
  min-width: 150px;
  flex: 1;
}

.date-range {
  display: flex;
  gap: 8px;
}

.date-input {
  width: 150px;
}

.export-btn {
  margin-left: auto;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px !important;
  border-radius: 12px !important;
  background: var(--surface-container) !important;
}

.stat-content {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--on-surface);
}

.stat-label {
  font-size: 12px;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Logs Table */
.logs-section {
  margin-bottom: 24px;
}

.table-card {
  border-radius: 12px !important;
  overflow: hidden;
  background: var(--surface-container-lowest) !important;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--surface-container);
  border-bottom: 1px solid var(--surface-container-highest);
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0;
}

.table-wrapper {
  overflow-x: auto;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
}

.logs-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--surface-container);
  border-bottom: 1px solid var(--surface-container-highest);
}

.logs-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: var(--on-surface);
  border-bottom: 1px solid var(--surface-container-highest);
}

.log-row:hover {
  background: var(--primary-50);
}

.timestamp {
  white-space: nowrap;
  font-family: monospace;
  color: var(--on-surface-variant);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-cell .material-symbols-outlined {
  font-size: 18px;
  color: var(--outline);
}

.resource {
  color: var(--on-surface-variant);
}

.details {
  color: var(--on-surface-variant);
  max-width: 300px;
}

.empty-cell {
  text-align: center;
  padding: 60px 20px;
  color: var(--outline);
}

.empty-cell .material-symbols-outlined {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-cell p {
  margin: 0;
  font-size: 14px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: var(--surface-container);
}

.page-info {
  font-size: 14px;
  color: var(--on-surface-variant);
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-state p {
  margin-top: 16px;
  color: var(--on-surface-variant);
}

/* Info Banner */
.info-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px !important;
  border-radius: 12px !important;
  background: var(--primary-50) !important;
}

.info-banner .material-symbols-outlined {
  font-size: 32px;
  color: var(--primary);
}

.info-content {
  flex: 1;
  font-size: 14px;
  color: var(--on-surface-variant);
}

.info-content strong {
  color: var(--on-surface);
}
</style>
