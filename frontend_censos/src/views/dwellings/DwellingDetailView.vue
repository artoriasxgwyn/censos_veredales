<template>
  <div class="page-container">
    <div class="page-header">
      <q-btn
        flat
        icon="arrow_back"
        label="Volver"
        @click="router.back()"
      />
      <h1 class="title">Detalle de Vivienda</h1>
      <div class="header-actions">
        <q-btn
          color="primary"
          label="Editar"
          icon="edit"
          @click="router.push(`/admin/dwellings/${dwellingId}/edit`)"
        />
      </div>
    </div>

    <div v-if="!dwellingStore.loading && dwelling" class="content">
      <q-card class="dwelling-card">
        <q-card-section>
          <div class="dwelling-header">
            <div class="dwelling-icon">
              <span class="material-symbols-outlined">home</span>
            </div>
            <div>
              <h2 class="dwelling-name">{{ dwelling.houseNomenclature || 'Sin nomenclatura' }}</h2>
              <q-badge :color="getStatusColor(dwelling.status)">
                {{ getStatusLabel(dwelling.status) }}
              </q-badge>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <h3 class="section-title">Información de la Vivienda</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nomenclatura</span>
              <span class="info-value">{{ dwelling.houseNomenclature || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de Registro</span>
              <span class="info-value">{{ formatDate(dwelling.homeRegistrationDate) }}</span>
            </div>
            <div class="info-item" v-if="dwelling.constructionDate">
              <span class="info-label">Fecha de Construcción</span>
              <span class="info-value">{{ formatDate(dwelling.constructionDate) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Código de Comunidad</span>
              <span class="info-value">{{ getCommunityCode(dwelling.communityId) }}</span>
            </div>
          </div>

          <div class="info-full" v-if="dwelling.arrivalInstructions">
            <span class="info-label">Instrucciones de Llegada</span>
            <p class="info-text">{{ dwelling.arrivalInstructions }}</p>
          </div>

          <div class="info-full" v-if="dwelling.mapLocation">
            <span class="info-label">Ubicación en Mapa</span>
            <a :href="dwelling.mapLocation" target="_blank" class="info-link">
              Ver ubicación
              <span class="material-symbols-outlined">open_in_new</span>
            </a>
          </div>

          <div class="info-full" v-if="dwelling.homePhoto">
            <span class="info-label">Foto del Hogar</span>
            <img :src="dwelling.homePhoto" alt="Foto del hogar" class="home-photo" />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <h3 class="section-title">Estado de Aprobaciones</h3>

          <!-- Resumen de progreso -->
          <div class="approval-summary">
            <div class="progress-info">
              <span class="progress-text">
                {{ aprobacionProgreso.texto }}
              </span>
              <q-badge :color="getStatusColor(dwelling.status)">
                {{ getStatusLabel(dwelling.status) }}
              </q-badge>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: aprobacionProgreso.porcentaje + '%' }"></div>
            </div>
          </div>

          <div class="approval-grid">
            <div class="approval-card" :class="dwelling.approvedByPresident">
              <div class="approval-icon">
                <span class="material-symbols-outlined">
                  {{ getApprovalIcon(dwelling.approvedByPresident) }}
                </span>
              </div>
              <div class="approval-info">
                <span class="approval-label">Presidente</span>
                <span class="approval-status">{{ getApprovalLabel(dwelling.approvedByPresident) }}</span>
              </div>
            </div>

            <div class="approval-card" :class="dwelling.approvedByTreasurer">
              <div class="approval-icon">
                <span class="material-symbols-outlined">
                  {{ getApprovalIcon(dwelling.approvedByTreasurer) }}
                </span>
              </div>
              <div class="approval-info">
                <span class="approval-label">Tesorero</span>
                <span class="approval-status">{{ getApprovalLabel(dwelling.approvedByTreasurer) }}</span>
              </div>
            </div>

            <div class="approval-card" :class="dwelling.approvedBySecretary">
              <div class="approval-icon">
                <span class="material-symbols-outlined">
                  {{ getApprovalIcon(dwelling.approvedBySecretary) }}
                </span>
              </div>
              <div class="approval-info">
                <span class="approval-label">Secretario</span>
                <span class="approval-status">{{ getApprovalLabel(dwelling.approvedBySecretary) }}</span>
              </div>
            </div>
          </div>

          <!-- Acciones de aprobación -->
          <div class="approval-actions" v-if="canApprove || alreadyVoted">
            <!-- Si ya aprobó, muestra solo botón para cambiar a rechazado -->
            <q-btn
              v-if="userAlreadyApproved"
              color="negative"
              label="Cambiar a Rechazado"
              icon="close"
              @click="handleApprove('rejected')"
            />
            <!-- Si ya rechazó, muestra solo botón para cambiar a aprobado -->
            <q-btn
              v-else-if="userAlreadyRejected"
              color="positive"
              label="Cambiar a Aprobado"
              icon="check"
              @click="handleApprove('approved')"
            />
            <!-- Si no ha votado, muestra ambos botones -->
            <template v-else>
              <q-btn
                color="positive"
                label="Aprobar"
                icon="check"
                @click="handleApprove('approved')"
              />
              <q-btn
                color="negative"
                label="Rechazar"
                icon="close"
                @click="handleApprove('rejected')"
              />
            </template>
          </div>
          <div v-if="alreadyVoted" class="vote-warning">
            <q-badge color="info">
              <span class="material-symbols-outlined">info</span>
              Ya votaste. Puedes cambiar tu voto si lo necesitas.
            </q-badge>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <h3 class="section-title danger">Zona de Peligro</h3>
          <q-btn
            color="negative"
            label="Eliminar Vivienda"
            icon="delete"
            flat
            @click="handleDelete"
          />
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="dwellingStore.loading" class="loading">
      <q-spinner color="primary" size="3em" />
      <p>Cargando información...</p>
    </div>

    <div v-else class="no-data">
      <span class="material-symbols-outlined">error</span>
      <p>Vivienda no encontrada</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useDwellingStore } from '@/stores/dwelling.store'
import { useAuthStore } from '@/stores/auth.store'
import { useCommunityStore } from '@/stores/community.store'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const dwellingStore = useDwellingStore()
const authStore = useAuthStore()
const communityStore = useCommunityStore()

const dwellingId = computed(() => route.params.id)
const dwelling = computed(() => dwellingStore.currentDwelling)

const alreadyVoted = computed(() => {
  // Verifica si el rol actual YA VOTÓ (aprobó o rechazó) esta vivienda
  if (!dwelling.value) return false
  if (authStore.isPresident && dwelling.value.approvedByPresident !== 'pending') return true
  if (authStore.isTreasurer && dwelling.value.approvedByTreasurer !== 'pending') return true
  if (authStore.isSecretary && dwelling.value.approvedBySecretary !== 'pending') return true
  return false
})

const userAlreadyApproved = computed(() => {
  // Verifica si el usuario actual YA APROBÓ esta vivienda
  if (!dwelling.value) return false
  if (authStore.isPresident && dwelling.value.approvedByPresident === 'approved') return true
  if (authStore.isTreasurer && dwelling.value.approvedByTreasurer === 'approved') return true
  if (authStore.isSecretary && dwelling.value.approvedBySecretary === 'approved') return true
  return false
})

const userAlreadyRejected = computed(() => {
  // Verifica si el usuario actual YA RECHAZÓ esta vivienda
  if (!dwelling.value) return false
  if (authStore.isPresident && dwelling.value.approvedByPresident === 'rejected') return true
  if (authStore.isTreasurer && dwelling.value.approvedByTreasurer === 'rejected') return true
  if (authStore.isSecretary && dwelling.value.approvedBySecretary === 'rejected') return true
  return false
})

const canApprove = computed(() => {
  // Necesita tener rol de aprobador Y permiso para actualizar viviendas Y no haber votado aún
  const isApprover = authStore.isPresident || authStore.isTreasurer || authStore.isSecretary
  return isApprover && authStore.hasPermission('dwelling', 'update') && !alreadyVoted.value
})

const aprobacionProgreso = computed(() => {
  if (!dwelling.value) return { texto: 'Sin datos', porcentaje: 0 }

  const approvals = [
    dwelling.value.approvedByPresident || 'pending',
    dwelling.value.approvedByTreasurer || 'pending',
    dwelling.value.approvedBySecretary || 'pending'
  ]

  const approvedCount = approvals.filter(a => a === 'approved').length
  const rejectedCount = approvals.filter(a => a === 'rejected').length
  const hasRejection = rejectedCount > 0

  if (hasRejection) {
    return { texto: `Rechazada por ${rejectedCount} rol(s)`, porcentaje: 0 }
  }
  if (approvedCount === 3) {
    return { texto: 'Completamente aprobada', porcentaje: 100 }
  }
  return { texto: `${approvedCount} de 3 aprobaciones`, porcentaje: (approvedCount / 3) * 100 }
})

onMounted(async () => {
  await dwellingStore.fetchDwellingById(dwellingId.value)
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

const getCommunityCode = (communityId) => {
  if (!communityId) return 'N/A'
  if (typeof communityId === 'object' && communityId?.code) {
    return communityId.code
  }
  if (typeof communityId === 'string') {
    const community = communityStore.communities.find(c => c._id === communityId)
    return community?.code || 'N/A'
  }
  return 'N/A'
}

const handleApprove = async (status) => {
  // Si ya aprobó, mostrar confirmación antes de cambiar a rechazado
  if (userAlreadyApproved.value) {
    $q.dialog({
      title: 'Cambiar voto',
      message: 'Tu voto actual es "Aprobado". ¿Estás seguro de que quieres rechazar esta vivienda?',
      cancel: true,
      persistent: true,
      ok: {
        label: 'Cambiar',
        color: 'warning',
        flat: true
      },
      cancel: {
        label: 'Cancelar',
        color: 'primary',
        flat: true
      }
    }).onOk(async () => {
      await confirmarVoto('rejected')
    })
  // Si ya rechazó, mostrar confirmación antes de cambiar a aprobado
  } else if (userAlreadyRejected.value) {
    $q.dialog({
      title: 'Cambiar voto',
      message: 'Tu voto actual es "Rechazado". ¿Estás seguro de que quieres aprobar esta vivienda?',
      cancel: true,
      persistent: true,
      ok: {
        label: 'Cambiar',
        color: 'warning',
        flat: true
      },
      cancel: {
        label: 'Cancelar',
        color: 'primary',
        flat: true
      }
    }).onOk(async () => {
      await confirmarVoto('approved')
    })
  } else {
    await confirmarVoto(status)
  }
}

const confirmarVoto = async (status) => {
  let role = ''
  if (authStore.isPresident) role = 'president'
  else if (authStore.isTreasurer) role = 'treasurer'
  else if (authStore.isSecretary) role = 'secretary'

  const result = await dwellingStore.approveDwelling(dwellingId.value, role, status)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: `Vivienda ${status === 'approved' ? 'aprobada' : 'rechazada'} exitosamente`,
      caption: status === 'approved'
        ? 'La vivienda ha sido aprobada por tu rol'
        : 'La vivienda ha sido rechazada',
      timeout: 4000
    })
    await dwellingStore.fetchDwellingById(dwellingId.value)
  } else {
    const errorMsg = result.message || ''
    $q.notify({
      type: 'negative',
      message: 'Error en la aprobación',
      caption: errorMsg,
      timeout: 5000
    })
  }
}

const handleDelete = async () => {
  $q.dialog({
    title: 'Eliminar Vivienda',
    message: '¿Estás seguro de que deseas eliminar esta vivienda? Esta acción no se puede deshacer.',
    cancel: true,
    persistent: true,
    ok: {
      label: 'Eliminar',
      color: 'negative',
      flat: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'primary',
      flat: true
    }
  }).onOk(async () => {
    const result = await dwellingStore.deleteDwelling(dwellingId.value)
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Vivienda eliminada exitosamente',
        timeout: 3000
      })
      router.push('/admin/dwellings')
    } else {
      const errorMsg = result.message || ''

      if (errorMsg.toLowerCase().includes('permiso') || errorMsg.toLowerCase().includes('autorización')) {
        $q.notify({
          type: 'negative',
          message: 'No tienes permisos para eliminar',
          caption: 'Se requiere autorización de administrador',
          timeout: 4000
        })
      } else if (errorMsg.toLowerCase().includes('no existe') || errorMsg.toLowerCase().includes('not found')) {
        $q.notify({
          type: 'negative',
          message: 'Vivienda no encontrada',
          caption: 'La vivienda ya fue eliminada o no existe',
          timeout: 4000
        })
      } else {
        $q.notify({
          type: 'negative',
          message: 'Error al eliminar vivienda',
          caption: errorMsg,
          timeout: 5000
        })
      }
    }
  })
}
</script>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

@media (max-width: 599px) {
  .page-container {
    padding: 16px;
  }
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

@media (max-width: 599px) {
  .page-header {
    gap: 8px;
    margin-bottom: 16px;
  }

  .title {
    font-size: 20px;
  }
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

.dwelling-card {
  border-radius: 12px;
  background: var(--surface-container-lowest);
  border: 1px solid var(--surface-container-highest);
  box-shadow: 0 4px 12px rgba(25, 28, 30, 0.04);
}

.dwelling-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

@media (max-width: 599px) {
  .dwelling-header {
    gap: 12px;
    flex-wrap: wrap;
  }
}

.dwelling-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

@media (max-width: 599px) {
  .dwelling-icon {
    width: 48px;
    height: 48px;
  }

  .dwelling-icon .material-symbols-outlined {
    font-size: 24px;
  }
}

.dwelling-icon .material-symbols-outlined {
  font-size: 28px;
  color: var(--on-primary);
}

.dwelling-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 8px 0;
}

@media (max-width: 599px) {
  .dwelling-name {
    font-size: 18px;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 16px 0;
}

.section-title.danger {
  color: var(--error);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 599px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
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

.info-full {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-text {
  font-size: 14px;
  color: var(--on-surface);
  line-height: 1.6;
  background: var(--surface-container-lowest);
  padding: 12px;
  border-radius: 8px;
}

.info-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--primary);
  text-decoration: none;
}

.info-link:hover {
  text-decoration: underline;
}

.home-photo {
  max-width: 100%;
  border-radius: 8px;
  margin-top: 8px;
}

.approval-summary {
  background: var(--surface-container-lowest);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
}

.progress-bar {
  height: 8px;
  background: var(--surface-container-highest);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, var(--primary-container) 100%);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.approval-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

@media (max-width: 599px) {
  .approval-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
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

@media (max-width: 599px) {
  .approval-card {
    padding: 12px;
    gap: 10px;
  }
}

.approval-card.approved {
  border-color: var(--primary);
  background: var(--primary-50);
}

.approval-card.rejected {
  border-color: var(--error);
  background: var(--error-container);
}

.approval-card.pending {
  border-color: var(--outline);
  background: var(--surface-container-highest);
}

.approval-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

@media (max-width: 599px) {
  .approval-icon {
    width: 36px;
    height: 36px;
  }
}

.approved .approval-icon {
  background: var(--primary);
  color: var(--on-primary);
}

.rejected .approval-icon {
  background: var(--error);
  color: var(--on-error);
}

.pending .approval-icon {
  background: var(--outline);
  color: var(--on-surface);
}

.approval-icon .material-symbols-outlined {
  font-size: 20px;
  color: var(--on-primary);
}

@media (max-width: 599px) {
  .approval-icon .material-symbols-outlined {
    font-size: 18px;
  }
}

.approval-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.approval-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--outline);
}

@media (max-width: 599px) {
  .approval-label {
    font-size: 11px;
  }
}

.approval-status {
  font-size: 14px;
  font-weight: 600;
}

@media (max-width: 599px) {
  .approval-status {
    font-size: 13px;
  }
}

.approved .approval-status { color: var(--primary); }
.rejected .approval-status { color: var(--error); }
.pending .approval-status { color: var(--on-surface-variant); }

.approval-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.vote-warning {
  margin-top: 8px;
}

.vote-warning .q-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
}

.vote-warning .material-symbols-outlined {
  font-size: 16px;
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
