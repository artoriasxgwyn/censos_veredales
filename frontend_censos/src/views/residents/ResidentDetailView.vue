<template>
  <div class="page-container">
    <div class="page-header">
      <q-btn
        flat
        icon="arrow_back"
        label="Volver"
        @click="router.back()"
      />
      <h1 class="title">Detalle de Residente</h1>
      <div class="header-actions">
        <q-btn
          color="primary"
          label="Editar"
          icon="edit"
          @click="router.push(`/admin/residents/${residentId}/edit`)"
        />
      </div>
    </div>

    <div v-if="!residentStore.loading && resident" class="content">
      <q-card class="resident-card">
        <q-card-section>
          <div class="resident-header">
            <div class="resident-icon">
              <span class="material-symbols-outlined">person</span>
            </div>
            <div>
              <h2 class="resident-name">{{ getUserName(resident.userId) }}</h2>
              <q-badge :color="getStatusColor(resident.status)">
                {{ getStatusLabel(resident.status) }}
              </q-badge>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <h3 class="section-title">Información del Residente</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Número de Registro</span>
              <span class="info-value">{{ resident.registrationNumber || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Vivienda</span>
              <span class="info-value">{{ getDwellingName(resident.dwellingId) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Comunidad</span>
              <span class="info-value">{{ getCommunityName(resident.communityId) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de Registro</span>
              <span class="info-value">{{ formatDate(resident.createdAt) }}</span>
            </div>
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
              <q-badge :color="getStatusColor(resident.status)">
                {{ getStatusLabel(resident.status) }}
              </q-badge>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: aprobacionProgreso.porcentaje + '%' }"></div>
            </div>
          </div>

          <div class="approval-grid">
            <div class="approval-card" :class="resident.approvedByPresident">
              <div class="approval-icon">
                <span class="material-symbols-outlined">
                  {{ getApprovalIcon(resident.approvedByPresident) }}
                </span>
              </div>
              <div class="approval-info">
                <span class="approval-label">Presidente</span>
                <span class="approval-status">{{ getApprovalLabel(resident.approvedByPresident) }}</span>
              </div>
            </div>

            <div class="approval-card" :class="resident.approvedByTreasurer">
              <div class="approval-icon">
                <span class="material-symbols-outlined">
                  {{ getApprovalIcon(resident.approvedByTreasurer) }}
                </span>
              </div>
              <div class="approval-info">
                <span class="approval-label">Tesorero</span>
                <span class="approval-status">{{ getApprovalLabel(resident.approvedByTreasurer) }}</span>
              </div>
            </div>

            <div class="approval-card" :class="resident.approvedBySecretary">
              <div class="approval-icon">
                <span class="material-symbols-outlined">
                  {{ getApprovalIcon(resident.approvedBySecretary) }}
                </span>
              </div>
              <div class="approval-info">
                <span class="approval-label">Secretario</span>
                <span class="approval-status">{{ getApprovalLabel(resident.approvedBySecretary) }}</span>
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
            label="Eliminar Residente"
            icon="delete"
            flat
            @click="handleDelete"
          />
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="residentStore.loading" class="loading">
      <q-spinner color="primary" size="3em" />
      <p>Cargando información...</p>
    </div>

    <div v-else class="no-data">
      <span class="material-symbols-outlined">error</span>
      <p>Residente no encontrado</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useResidentStore } from '@/stores/resident.store'
import { useUserStore } from '@/stores/user.store'
import { useDwellingStore } from '@/stores/dwelling.store'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const residentStore = useResidentStore()
const userStore = useUserStore()
const dwellingStore = useDwellingStore()
const authStore = useAuthStore()

const residentId = computed(() => route.params.id)
const resident = computed(() => residentStore.currentResident)

const alreadyVoted = computed(() => {
  // Verifica si el rol actual YA VOTÓ (aprobó o rechazó) este residente
  if (!resident.value) return false
  if (authStore.isPresident && resident.value.approvedByPresident !== 'pending') return true
  if (authStore.isTreasurer && resident.value.approvedByTreasurer !== 'pending') return true
  if (authStore.isSecretary && resident.value.approvedBySecretary !== 'pending') return true
  return false
})

const userAlreadyApproved = computed(() => {
  // Verifica si el usuario actual YA APROBÓ este residente
  if (!resident.value) return false
  if (authStore.isPresident && resident.value.approvedByPresident === 'approved') return true
  if (authStore.isTreasurer && resident.value.approvedByTreasurer === 'approved') return true
  if (authStore.isSecretary && resident.value.approvedBySecretary === 'approved') return true
  return false
})

const userAlreadyRejected = computed(() => {
  // Verifica si el usuario actual YA RECHAZÓ este residente
  if (!resident.value) return false
  if (authStore.isPresident && resident.value.approvedByPresident === 'rejected') return true
  if (authStore.isTreasurer && resident.value.approvedByTreasurer === 'rejected') return true
  if (authStore.isSecretary && resident.value.approvedBySecretary === 'rejected') return true
  return false
})

const canApprove = computed(() => {
  // Necesita tener rol de aprobador Y permiso para actualizar residentes Y no haber votado aún
  const isApprover = authStore.isPresident || authStore.isTreasurer || authStore.isSecretary
  return isApprover && authStore.hasPermission('resident', 'update') && !alreadyVoted.value
})

const aprobacionProgreso = computed(() => {
  if (!resident.value) return { texto: 'Sin datos', porcentaje: 0 }

  const approvals = [
    resident.value.approvedByPresident || 'pending',
    resident.value.approvedByTreasurer || 'pending',
    resident.value.approvedBySecretary || 'pending'
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
  await Promise.all([
    residentStore.fetchResidentById(residentId.value),
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

const getCommunityName = (communityId) => {
  if (typeof communityId === 'object' && communityId !== null) {
    return communityId.neighborhood || 'Comunidad'
  }
  return communityId || 'N/A'
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'info',
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
  // Si ya votó, mostrar confirmación antes de cambiar el voto
  if (alreadyVoted.value) {
    const currentVote = authStore.isPresident
      ? resident.value.approvedByPresident
      : authStore.isTreasurer
        ? resident.value.approvedByTreasurer
        : resident.value.approvedBySecretary

    const accion = status === 'approved' ? 'aprobar' : 'rechazar'

    $q.dialog({
      title: 'Cambiar voto',
      message: `Tu voto actual es "${currentVote === 'approved' ? 'Aprobado' : 'Rechazado'}". ¿Estás seguro de que quieres ${accion} este residente?`,
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
      await confirmarVoto(status)
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

  const result = await residentStore.approveResident(residentId.value, role, status)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: `Residente ${status === 'approved' ? 'aprobado' : 'rechazado'} exitosamente`,
      caption: status === 'approved'
        ? 'El residente ha sido aprobado por tu rol'
        : 'El residente ha sido rechazado',
      timeout: 4000
    })
    await residentStore.fetchResidentById(residentId.value)
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
    title: 'Eliminar Residente',
    message: '¿Estás seguro de que deseas eliminar este residente?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const result = await residentStore.deleteResident(residentId.value)
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Residente eliminado exitosamente'
      })
      router.push('/admin/residents')
    } else {
      $q.notify({
        type: 'negative',
        message: result.message || 'Error al eliminar residente'
      })
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

@media (max-width: 599px) {
  .header-actions {
    gap: 4px;
  }
}

.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.resident-card {
  border-radius: 12px;
  background: var(--surface-container-lowest);
  border: 1px solid var(--surface-container-highest);
  box-shadow: 0 4px 12px rgba(25, 28, 30, 0.04);
}

.resident-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

@media (max-width: 599px) {
  .resident-header {
    gap: 12px;
    flex-wrap: wrap;
  }
}

.resident-icon {
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
  .resident-icon {
    width: 48px;
    height: 48px;
  }

  .resident-icon .material-symbols-outlined {
    font-size: 24px;
  }
}

.resident-icon .material-symbols-outlined {
  font-size: 28px;
  color: var(--white);
}

.resident-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 8px 0;
}

@media (max-width: 599px) {
  .resident-name {
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
  font-weight: 600;
  color: var(--on-surface-variant);
  text-transform: uppercase;
}

.info-value {
  font-size: 14px;
  color: var(--on-surface);
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
  background: var(--primary-50);
}

.approval-card.rejected {
  border-color: var(--error);
  background: var(--error-container);
}

.approval-card.pending {
  border-color: var(--warning);
  background: var(--warning-container);
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
  color: var(--on-error);
}

.pending .approval-icon {
  background: var(--warning);
  color: var(--on-warning);
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
  font-weight: 600;
  color: var(--on-surface-variant);
}

.approval-status {
  font-size: 14px;
  font-weight: 700;
}

.approved .approval-status { color: var(--success); }
.rejected .approval-status { color: var(--error); }
.pending .approval-status { color: var(--on-surface-variant); }

.approval-actions {
  display: flex;
  gap: 12px;
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
