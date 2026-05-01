<template>
  <div class="page">
    <div class="page-content">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <p class="page-subtitle">Verificación de Cartas</p>
          <h1 class="page-title">Escáner QR</h1>
          <p class="page-description">Escanee el código QR de una carta para verificar su autenticidad</p>
        </div>
      </div>

      <!-- Scanner Component -->
      <div class="scanner-wrapper">
        <QRScanner @code-scanned="handleCodeScanned" />
      </div>

      <!-- Recent Scans -->
      <div class="recent-scans" v-if="recentScans.length > 0">
        <h3 class="section-title">Escaneos Recientes</h3>
        <div class="scans-list">
          <div
            v-for="scan in recentScans"
            :key="scan.code"
            class="scan-item"
            @click="showScanDetails(scan)"
          >
            <div class="scan-icon">
              <span class="material-symbols-outlined">qr_code</span>
            </div>
            <div class="scan-info">
              <p class="scan-code">{{ scan.code }}</p>
              <p class="scan-time">{{ formatTime(scan.timestamp) }}</p>
            </div>
            <span class="material-symbols-outlined chevron">chevron_right</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth.store'
import QRScanner from '@/components/QRScanner.vue'

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

const recentScans = ref([])

const handleCodeScanned = (result) => {
  // Add to recent scans
  recentScans.value.unshift({
    code: result.code,
    data: result.data,
    timestamp: new Date().toISOString()
  })

  // Keep only last 10 scans
  if (recentScans.value.length > 10) {
    recentScans.value = recentScans.value.slice(0, 10)
  }

  // Save to localStorage
  localStorage.setItem('recentQrScans', JSON.stringify(recentScans.value))
}

const showScanDetails = (scan) => {
  $q.dialog({
    title: 'Detalles del Escaneo',
    message: `
      <div style="padding: 16px 0;">
        <div style="margin-bottom: 12px;">
          <strong>Código:</strong> ${scan.code}
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Fecha:</strong> ${formatDateTime(scan.timestamp)}
        </div>
        <div>
          <strong>Estado:</strong>
          <span style="color: var(--q-positive);">
            ${scan.data ? 'Válida' : 'Inválida'}
          </span>
        </div>
      </div>
    `,
    html: true,
    persistent: true,
    ok: 'Cerrar'
  })
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('es-ES')
}

onMounted(() => {
  // Load recent scans from localStorage
  const saved = localStorage.getItem('recentQrScans')
  if (saved) {
    recentScans.value = JSON.parse(saved)
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--surface-container-lowest);
}

.page-content {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  margin-bottom: 32px;
  text-align: center;
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
}

/* Scanner Wrapper */
.scanner-wrapper {
  margin-bottom: 32px;
}

/* Recent Scans */
.recent-scans {
  background: var(--surface-container-low);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 16px 32px rgba(25, 28, 30, 0.06);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 16px 0;
}

.scans-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scan-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: var(--surface-container);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.scan-item:hover {
  background: var(--primary-50);
}

.scan-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--primary-50);
  display: flex;
  align-items: center;
  justify-content: center;
}

.scan-icon .material-symbols-outlined {
  font-size: 20px;
  color: var(--primary);
}

.scan-info {
  flex: 1;
}

.scan-code {
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 4px 0;
  font-family: monospace;
}

.scan-time {
  font-size: 12px;
  color: var(--on-surface-variant);
  margin: 0;
}

.chevron {
  color: var(--outline);
  font-size: 20px;
}
</style>
