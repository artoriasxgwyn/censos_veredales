<template>
  <div class="page-container">
    <div class="page-header">
      <q-btn
        flat
        icon="arrow_back"
        label="Volver"
        @click="router.back()"
      />
      <h1 class="title">Detalle de Carta</h1>
      <div class="header-actions">
        <q-btn
          v-if="letter?.status === 'approved'"
          color="primary"
          label="Generar PDF"
          icon="picture_as_pdf"
          @click="handleGeneratePdf"
        />
        <q-btn
          v-if="letter?.pdfUrl"
          color="primary"
          label="Descargar PDF"
          icon="download"
          @click="handleDownload"
        />
      </div>
    </div>

    <div v-if="!letterStore.loading && letter" class="content">
      <q-card class="letter-card">
        <q-card-section>
          <div class="letter-header">
            <div class="letter-icon">
              <span class="material-symbols-outlined">description</span>
            </div>
            <div>
              <h2 class="letter-name">Carta {{ letter.type }}</h2>
              <q-badge :color="getStatusColor(letter.status)">
                {{ getStatusLabel(letter.status) }}
              </q-badge>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <h3 class="section-title">Información de la Carta</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Tipo</span>
              <span class="info-value">{{ letter.type }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Estado</span>
              <span class="info-value">
                <q-badge :color="getStatusColor(letter.status)">
                  {{ getStatusLabel(letter.status) }}
                </q-badge>
              </span>
            </div>
            <div class="info-item" v-if="letter.qrCodigo">
              <span class="info-label">Código QR</span>
              <span class="info-value">{{ letter.qrCodigo }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de Solicitud</span>
              <span class="info-value">{{ formatDate(letter.createdAt) }}</span>
            </div>
            <div class="info-item" v-if="letter.issuedAt">
              <span class="info-label">Fecha de Emisión</span>
              <span class="info-value">{{ formatDate(letter.issuedAt) }}</span>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <h3 class="section-title">Estado de Aprobaciones</h3>
          <div class="approval-grid">
            <div class="approval-card" :class="letter.approvedByPresident">
              <div class="approval-icon">
                <span class="material-symbols-outlined">
                  {{ getApprovalIcon(letter.approvedByPresident) }}
                </span>
              </div>
              <div class="approval-info">
                <span class="approval-label">Presidente</span>
                <span class="approval-status">{{ getApprovalLabel(letter.approvedByPresident) }}</span>
              </div>
            </div>

            <div class="approval-card" :class="letter.approvedByTreasurer">
              <div class="approval-icon">
                <span class="material-symbols-outlined">
                  {{ getApprovalIcon(letter.approvedByTreasurer) }}
                </span>
              </div>
              <div class="approval-info">
                <span class="approval-label">Tesorero</span>
                <span class="approval-status">{{ getApprovalLabel(letter.approvedByTreasurer) }}</span>
              </div>
            </div>

            <div class="approval-card" :class="letter.approvedBySecretary">
              <div class="approval-icon">
                <span class="material-symbols-outlined">
                  {{ getApprovalIcon(letter.approvedBySecretary) }}
                </span>
              </div>
              <div class="approval-info">
                <span class="approval-label">Secretario</span>
                <span class="approval-status">{{ getApprovalLabel(letter.approvedBySecretary) }}</span>
              </div>
            </div>
          </div>

          <!-- Acciones de aprobación -->
          <div class="approval-actions" v-if="canApprove && letter.status === 'pending'">
            <q-btn
              color="positive"
              label="Aprobar"
              icon="check"
              @click="handleApprove('approved')"
              :disable="alreadyApproved"
            />
            <q-btn
              color="negative"
              label="Rechazar"
              icon="close"
              @click="handleApprove('rejected')"
              :disable="alreadyApproved"
            />
          </div>
        </q-card-section>

        <q-separator v-if="letter.qrCodigo" />

        <q-card-section v-if="letter.qrCodigo">
          <h3 class="section-title">Código QR</h3>
          <div class="qr-section">
            <div class="qr-code">
              <!-- Aquí iría un generador de QR real -->
              <div class="qr-placeholder">
                <span class="material-symbols-outlined">qr_code</span>
                <p>{{ letter.qrCodigo }}</p>
              </div>
            </div>
            <div class="qr-info">
              <p>Escanea este código QR para verificar la autenticidad de la carta.</p>
              <p class="qr-url">
                URL de verificación:
                <a :href="verificationUrl" target="_blank">{{ verificationUrl }}</a>
              </p>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="letterStore.loading" class="loading">
      <q-spinner color="primary" size="3em" />
      <p>Cargando información...</p>
    </div>

    <div v-else class="no-data">
      <span class="material-symbols-outlined">error</span>
      <p>Carta no encontrada</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useLetterStore } from '@/stores/letter.store'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const letterStore = useLetterStore()
const authStore = useAuthStore()

const letterId = computed(() => route.params.id)
const letter = computed(() => letterStore.currentLetter)

const canApprove = computed(() => {
  // Necesita tener rol de aprobador Y permiso para generar cartas
  const isApprover = authStore.isPresident || authStore.isTreasurer || authStore.isSecretary
  return isApprover && authStore.hasPermission('letter', 'generateNormal')
})

const alreadyApproved = computed(() => {
  if (!letter.value) return false
  if (authStore.isPresident && letter.value.approvedByPresident === 'approved') return true
  if (authStore.isTreasurer && letter.value.approvedByTreasurer === 'approved') return true
  if (authStore.isSecretary && letter.value.approvedBySecretary === 'approved') return true
  return false
})

const verificationUrl = computed(() => {
  if (!letter.value?.qrCodigo) return ''
  return `${window.location.origin}/verify-letter/${letter.value.qrCodigo}`
})

onMounted(async () => {
  await letterStore.fetchLetterById(letterId.value)
})

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    approved: 'positive',
    issued: 'info',
    rejected: 'negative'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    issued: 'Emitida',
    rejected: 'Rechazada'
  }
  return labels[status] || status
}

const getApprovalIcon = (status) => {
  if (status === 'approved') return 'check_circle'
  if (status === 'rejected') return 'cancel'
  return 'pending'
}

const getApprovalLabel = (status) => {
  const labels = {
    approved: 'Aprobado',
    rejected: 'Rechazado',
    pending: 'Pendiente'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-ES')
}

const handleApprove = async (status) => {
  let role = ''
  if (authStore.isPresident) role = 'president'
  else if (authStore.isTreasurer) role = 'treasurer'
  else if (authStore.isSecretary) role = 'secretary'

  const result = await letterStore.approveLetter(letterId.value, role, status)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: `Carta ${status === 'approved' ? 'aprobada' : 'rechazada'} exitosamente`
    })
    await letterStore.fetchLetterById(letterId.value)
  } else {
    $q.notify({
      type: 'negative',
      message: result.message || 'Error en la aprobación'
    })
  }
}

const handleGeneratePdf = async () => {
  const result = await letterStore.generatePdf(letterId.value)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'PDF generado exitosamente'
    })
    await letterStore.fetchLetterById(letterId.value)
  } else {
    $q.notify({
      type: 'negative',
      message: result.message || 'Error al generar PDF'
    })
  }
}

const handleDownload = () => {
  const url = letterStore.downloadPdf(letterId.value)
  window.open(url, '_blank')
}
</script>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
  flex: 1;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.letter-card {
  border-radius: 12px;
}

.letter-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.letter-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.letter-icon .material-symbols-outlined {
  font-size: 28px;
  color: var(--on-primary);
}

.letter-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 8px 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 16px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--outline);
  text-transform: uppercase;
}

.info-value {
  font-size: 14px;
  color: var(--on-surface);
}

.approval-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.approval-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--surface-container-lowest);
  border-radius: 8px;
  border: 2px solid transparent;
}

.approval-card.approved {
  border-color: var(--primary);
  background: var(--primary-fixed);
}

.approval-card.rejected {
  border-color: var(--error);
  background: var(--error-fixed);
}

.approval-card.pending {
  border-color: var(--warning);
  background: var(--warning-fixed);
}

.approval-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.approved .approval-icon {
  background: var(--primary);
  color: var(--on-primary);
}

.rejected .approval-icon {
  background: var(--error);
  color: var(--on-primary);
}

.pending .approval-icon {
  background: var(--warning);
  color: var(--on-primary);
}

.approval-icon .material-symbols-outlined {
  font-size: 20px;
  color: var(--on-primary);
}

.approval-info {
  display: flex;
  flex-direction: column;
}

.approval-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--outline);
}

.approval-status {
  font-size: 14px;
  font-weight: 600;
}

.approved .approval-status { color: var(--primary); }
.rejected .approval-status { color: var(--error); }
.pending .approval-status { color: var(--warning); }

.approval-actions {
  display: flex;
  gap: 12px;
}

.qr-section {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.qr-code {
  flex-shrink: 0;
}

.qr-placeholder {
  width: 200px;
  height: 200px;
  background: var(--surface-container-lowest);
  border: 2px dashed var(--surface-container-highest);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.qr-placeholder .material-symbols-outlined {
  font-size: 48px;
  color: var(--outline);
}

.qr-placeholder p {
  font-size: 12px;
  color: var(--outline);
  font-family: monospace;
}

.qr-info {
  flex: 1;
}

.qr-info p {
  font-size: 14px;
  color: var(--outline);
  margin: 0 0 12px 0;
}

.qr-url {
  font-size: 13px;
}

.qr-url a {
  color: var(--tertiary);
  word-break: break-all;
}

.loading, .no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--on-surface-variant);
}

.loading {
  color: var(--outline);
}
</style>
