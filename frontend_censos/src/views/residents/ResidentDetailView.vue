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
          <div class="approval-actions" v-if="canApprove && resident.status === 'pending'">
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

const canApprove = computed(() => {
  return authStore.isPresident || authStore.isTreasurer || authStore.isSecretary
})

const alreadyApproved = computed(() => {
  if (!resident.value) return false
  if (authStore.isPresident && resident.value.approvedByPresident === 'approved') return true
  if (authStore.isTreasurer && resident.value.approvedByTreasurer === 'approved') return true
  if (authStore.isSecretary && resident.value.approvedBySecretary === 'approved') return true
  return false
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
    pending: 'warning',
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
  let role = ''
  if (authStore.isPresident) role = 'president'
  else if (authStore.isTreasurer) role = 'treasurer'
  else if (authStore.isSecretary) role = 'secretary'

  const result = await residentStore.approveResident(residentId.value, role, status)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: `Residente ${status === 'approved' ? 'aprobado' : 'rechazado'} exitosamente`
    })
    await residentStore.fetchResidentById(residentId.value)
  } else {
    $q.notify({
      type: 'negative',
      message: result.message || 'Error en la aprobación'
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

.resident-card {
  border-radius: 12px;
}

.resident-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.resident-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--tertiary) 0%, var(--tertiary-container) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resident-icon .material-symbols-outlined {
  font-size: 28px;
  color: var(--on-primary);
}

.resident-name {
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

.section-title.danger {
  color: var(--error);
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
