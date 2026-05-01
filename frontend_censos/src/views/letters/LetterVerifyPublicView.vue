<template>
  <div class="verify-page">
    <div class="verify-container">
      <div class="logo-section">
        <span class="material-symbols-outlined logo-icon">verified_user</span>
        <h1 class="page-title">Verificación de Cartas</h1>
        <p class="page-subtitle">Sistema de Verificación de Residencia Comunitaria</p>
      </div>

      <q-card class="verify-card">
        <q-card-section class="verify-header">
          <div class="verify-icon" :class="verificationStatus">
            <span class="material-symbols-outlined">
              {{ verificationStatus === 'valid' ? 'check_circle' : verificationStatus === 'invalid' ? 'error' : 'pending' }}
            </span>
          </div>
          <h2 class="verify-title">
            {{ verificationTitle }}
          </h2>
          <p class="verify-message">
            {{ verificationMessage }}
          </p>
        </q-card-section>

        <q-separator v-if="letter" />

        <q-card-section v-if="letter" class="letter-details">
          <div class="detail-row">
            <span class="detail-label">Código de Verificación:</span>
            <span class="detail-value code">{{ letter.qrCodigo }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Tipo de Carta:</span>
            <span class="detail-value">Carta {{ letter.type }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Estado:</span>
            <span class="detail-value">
              <q-badge :color="getStatusColor(letter.status)">
                {{ getStatusLabel(letter.status) }}
              </q-badge>
            </span>
          </div>
          <div class="detail-row" v-if="letter.issuedAt">
            <span class="detail-label">Fecha de Emisión:</span>
            <span class="detail-value">{{ formatDate(letter.issuedAt) }}</span>
          </div>
          <div class="detail-row" v-if="letter.residentId">
            <span class="detail-label">Residente:</span>
            <span class="detail-value">{{ getResidentName(letter.residentId) }}</span>
          </div>
          <div class="detail-row" v-if="letter.communityId">
            <span class="detail-label">Comunidad:</span>
            <span class="detail-value">{{ getCommunityName(letter.communityId) }}</span>
          </div>
        </q-card-section>

        <q-card-actions align="center" v-if="letter && letter.pdfUrl">
          <q-btn
            color="primary"
            label="Descargar PDF"
            icon="download"
            @click="handleDownload"
            outline
          />
        </q-card-actions>
      </q-card>

      <div class="search-section" v-if="!letter && !loading">
        <q-card class="search-card">
          <q-card-section>
            <h3 class="search-title">Verificar Manualmente</h3>
            <p class="search-description">
              Ingresa el código de verificación de la carta para validar su autenticidad
            </p>
            <q-form @submit="handleManualSearch" class="search-form">
              <q-input
                v-model="searchCode"
                outlined
                label="Código QR / Código de Verificación"
                dense
                class="search-input"
              >
                <template v-slot:prepend>
                  <q-icon name="qr_code_scanner" />
                </template>
                <template v-slot:append>
                  <q-btn
                    flat
                    dense
                    icon="search"
                    type="submit"
                    :disable="!searchCode.trim()"
                  />
                </template>
              </q-input>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <div class="footer">
        <p>© {{ new Date().getFullYear() }} Sistema de Censos Veredales</p>
        <p class="footer-note">
          Este sistema permite verificar la autenticidad de cartas de residencia emitidas por las comunidades
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useLetterStore } from '@/stores/letter.store'
import { useUserStore } from '@/stores/user.store'
import { useCommunityStore } from '@/stores/community.store'

const route = useRoute()
const $q = useQuasar()
const letterStore = useLetterStore()
const userStore = useUserStore()
const communityStore = useCommunityStore()

const loading = ref(true)
const letter = ref(null)
const searchCode = ref('')

const verificationStatus = computed(() => {
  if (!letter.value) return 'pending'
  if (letter.value.status === 'issued' || letter.value.status === 'approved') return 'valid'
  return 'invalid'
})

const verificationTitle = computed(() => {
  if (!letter.value && !loading.value) return 'Buscar Carta'
  if (loading.value) return 'Verificando...'
  if (verificationStatus.value === 'valid') return 'Carta Válida'
  if (verificationStatus.value === 'invalid') return 'Carta No Válida'
  return 'Verificación de Carta'
})

const verificationMessage = computed(() => {
  if (!letter.value && !loading.value) {
    return 'Ingresa el código de verificación para validar la autenticidad de la carta.'
  }
  if (loading.value) {
    return 'Consultando el sistema de verificación...'
  }
  if (!letter.value) {
    return 'El código ingresado no corresponde a ninguna carta registrada en nuestro sistema.'
  }
  if (verificationStatus.value === 'valid') {
    return 'Esta carta ha sido verificada como auténtica y está vigente en el sistema.'
  }
  return `Esta carta tiene estado "${getStatusLabel(letter.value.status)}". Solo las cartas emitidas o aprobadas pueden verificarse como válidas.`
})

onMounted(async () => {
  await Promise.all([
    userStore.fetchAllUsersPublic(),
    communityStore.fetchCommunities()
  ])

  const qrCode = route.params.qrCode || route.query.code
  if (qrCode) {
    searchCode.value = qrCode
    await verifyCode(qrCode)
  }
  loading.value = false
})

const verifyCode = async (code) => {
  loading.value = true
  letter.value = null

  const result = await letterStore.verifyByQr(code)
  if (result.success) {
    letter.value = result.data
  } else {
    $q.notify({
      type: 'negative',
      message: 'Código no encontrado en el sistema'
    })
  }
  loading.value = false
}

const handleManualSearch = async () => {
  if (searchCode.value.trim()) {
    await verifyCode(searchCode.value.trim())
  }
}

const getResidentName = (residentId) => {
  if (typeof residentId === 'object' && residentId?.userId) {
    const userId = typeof residentId.userId === 'object' ? residentId.userId : residentId.userId
    return userId?.fullName || 'Residente'
  }
  const user = userStore.users.find(u => u._id === residentId || u._id === residentId?.userId)
  return user?.fullName || 'Residente'
}

const getCommunityName = (communityId) => {
  if (typeof communityId === 'object' && communityId?.name) {
    return communityId.name
  }
  const community = communityStore.communities.find(c => c._id === communityId)
  return community?.name || 'Comunidad'
}

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

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-ES')
}

const handleDownload = () => {
  if (letter.value?.pdfUrl) {
    window.open(letter.value.pdfUrl, '_blank')
  }
}
</script>

<style scoped>
.verify-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--success-container) 0%, var(--success-container) 100%);
  padding: 40px 20px;
}

.verify-container {
  max-width: 600px;
  margin: 0 auto;
}

.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  font-size: 56px;
  color: var(--success);
  margin-bottom: 16px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: var(--outline);
  margin: 0;
}

.verify-card {
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.verify-header {
  text-align: center;
  padding: 40px 32px;
}

.verify-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.verify-icon.valid {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
}

.verify-icon.invalid {
  background: linear-gradient(135deg, var(--error) 0%, var(--error-container) 100%);
}

.verify-icon.pending {
  background: linear-gradient(135deg, var(--warning) 0%, var(--warning-container) 100%);
}

.verify-icon .material-symbols-outlined {
  font-size: 56px;
  color: var(--on-primary);
}

.verify-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 12px 0;
}

.verify-message {
  font-size: 14px;
  color: var(--outline);
  margin: 0;
  line-height: 1.6;
}

.letter-details {
  padding: 24px 32px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--surface-container);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--outline);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
}

.detail-value.code {
  font-family: monospace;
  background: var(--surface-container);
  padding: 4px 8px;
  border-radius: 4px;
}

.search-section {
  margin-top: 24px;
}

.search-card {
  border-radius: 12px;
}

.search-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 8px 0;
}

.search-description {
  font-size: 13px;
  color: var(--outline);
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.search-form {
  margin-top: 16px;
}

.search-input {
  background: var(--surface-container-lowest);
}

.footer {
  text-align: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--surface-container-highest);
}

.footer p {
  font-size: 13px;
  color: var(--outline);
  margin: 4px 0;
}

.footer-note {
  font-size: 12px;
  max-width: 400px;
  margin: 8px auto 0;
  line-height: 1.5;
}
</style>
