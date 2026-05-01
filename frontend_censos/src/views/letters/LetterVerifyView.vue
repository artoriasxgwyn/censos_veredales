<template>
  <div class="page-container">
    <div class="page-header">
      <q-btn
        flat
        icon="arrow_back"
        label="Volver"
        @click="router.back()"
      />
      <h1 class="title">Verificar Carta</h1>
    </div>

    <q-card class="verify-card" v-if="!loading && letter">
      <q-card-section class="verify-header">
        <div class="verify-icon" :class="verificationStatus">
          <span class="material-symbols-outlined">
            {{ verificationStatus === 'valid' ? 'check_circle' : 'error' }}
          </span>
        </div>
        <h2 class="verify-title">
          {{ verificationStatus === 'valid' ? 'Carta Válida' : 'Carta No Válida' }}
        </h2>
        <p class="verify-message">
          {{ verificationMessage }}
        </p>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <h3 class="section-title">Información de la Carta</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Código QR</span>
            <span class="info-value">{{ letter.qrCodigo }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Tipo</span>
            <span class="info-value">Carta {{ letter.type }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Estado</span>
            <span class="info-value">
              <q-badge :color="getStatusColor(letter.status)">
                {{ getStatusLabel(letter.status) }}
              </q-badge>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Fecha de Emisión</span>
            <span class="info-value">{{ formatDate(letter.issuedAt) }}</span>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <h3 class="section-title">Información del Residente</h3>
        <div class="resident-info">
          <div class="resident-avatar">
            <span class="material-symbols-outlined">person</span>
          </div>
          <div class="resident-details">
            <h4 class="resident-name">{{ getResidentName(letter.residentId) }}</h4>
            <p class="resident-community">{{ getCommunityName(letter.communityId) }}</p>
          </div>
        </div>
      </q-card-section>

      <q-separator v-if="letter.approvals && letter.approvals.length > 0" />

      <q-card-section v-if="letter.approvals && letter.approvals.length > 0">
        <h3 class="section-title">Aprobaciones</h3>
        <div class="approval-list">
          <div
            v-for="approval in letter.approvals"
            :key="approval.role"
            class="approval-item"
            :class="approval.status"
          >
            <span class="material-symbols-outlined">
              {{ approval.status === 'approved' ? 'check_circle' : 'cancel' }}
            </span>
            <span class="approval-role">{{ getRoleLabel(approval.role) }}</span>
            <span class="approval-date">{{ formatDate(approval.approvedAt) }}</span>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="actions">
        <q-btn
          v-if="letter.pdfUrl"
          color="primary"
          label="Descargar PDF"
          icon="download"
          @click="handleDownload"
        />
        <q-btn
          flat
          color="primary"
          label="Ver detalles completos"
          @click="router.push(`/admin/letters/${letter._id}`)"
          v-if="canViewFull"
        />
      </q-card-actions>
    </q-card>

    <q-card class="verify-card" v-else-if="!loading && !letter">
      <q-card-section class="text-center">
        <span class="material-symbols-outlined error-icon">search_off</span>
        <h2 class="verify-title">Carta No Encontrada</h2>
        <p class="verify-message">
          El código QR no corresponde a ninguna carta registrada en el sistema.
        </p>
        <q-btn
          color="primary"
          label="Volver al inicio"
          @click="router.push('/')"
        />
      </q-card-section>
    </q-card>

    <div v-else class="loading">
      <q-spinner color="primary" size="3em" />
      <p>Verificando carta...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useLetterStore } from '@/stores/letter.store'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import { useCommunityStore } from '@/stores/community.store'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const letterStore = useLetterStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const communityStore = useCommunityStore()

const loading = ref(true)
const letter = ref(null)

const verificationStatus = computed(() => {
  if (!letter.value) return 'invalid'
  if (letter.value.status === 'issued' || letter.value.status === 'approved') return 'valid'
  return 'invalid'
})

const verificationMessage = computed(() => {
  if (!letter.value) return 'El código ingresado no existe en nuestro sistema.'
  if (verificationStatus.value === 'valid') {
    return 'Esta carta ha sido verificada como auténtica y está vigente.'
  }
  return `Esta carta tiene estado "${getStatusLabel(letter.value.status)}" y no puede ser verificada como válida.`
})

const canViewFull = computed(() => {
  return authStore.isAuthenticated && (authStore.isAdmin || authStore.isPresident || authStore.isTreasurer || authStore.isSecretary)
})

onMounted(async () => {
  await Promise.all([
    userStore.fetchAllUsersPublic(),
    communityStore.fetchCommunities()
  ])

  const qrCode = route.params.qrCode
  if (qrCode) {
    const result = await letterStore.verifyByQr(qrCode)
    if (result.success) {
      letter.value = result.data
    }
  }
  loading.value = false
})

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

const getRoleLabel = (role) => {
  const labels = {
    president: 'Presidente',
    treasurer: 'Tesorero',
    secretary: 'Secretario'
  }
  return labels[role] || role
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
.page-container {
  padding: 24px;
  max-width: 800px;
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

.verify-card {
  border-radius: 12px;
}

.verify-header {
  text-align: center;
  padding: 32px 24px;
}

.verify-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.verify-icon.valid {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
}

.verify-icon.invalid {
  background: linear-gradient(135deg, var(--error) 0%, var(--error-container) 100%);
}

.verify-icon .material-symbols-outlined {
  font-size: 48px;
  color: var(--on-primary);
}

.verify-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 8px 0;
}

.verify-message {
  font-size: 14px;
  color: var(--outline);
  margin: 0;
  line-height: 1.6;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 16px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

.resident-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--surface-container-lowest);
  border-radius: 8px;
}

.resident-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resident-avatar .material-symbols-outlined {
  font-size: 28px;
  color: var(--on-primary);
}

.resident-details {
  flex: 1;
}

.resident-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 4px 0;
}

.resident-community {
  font-size: 13px;
  color: var(--outline);
  margin: 0;
}

.approval-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.approval-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--surface-container-lowest);
  border-radius: 8px;
  border-left: 4px solid transparent;
}

.approval-item.approved {
  border-left-color: var(--success);
  background: var(--success-container);
}

.approval-item.rejected {
  border-left-color: var(--error);
  background: var(--error-container);
}

.approval-item .material-symbols-outlined {
  font-size: 20px;
}

.approval-item.approved .material-symbols-outlined {
  color: var(--primary);
}

.approval-item.rejected .material-symbols-outlined {
  color: var(--error);
}

.approval-role {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--on-surface);
}

.approval-date {
  font-size: 12px;
  color: var(--outline);
}

.actions {
  padding: 24px;
  gap: 12px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--on-surface-variant);
  gap: 16px;
}

.error-icon {
  font-size: 64px;
  color: var(--outline);
  margin-bottom: 16px;
}
</style>
