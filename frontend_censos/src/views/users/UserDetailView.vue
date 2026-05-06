<template>
  <div class="page-container">
    <div class="page-header">
      <q-btn
        flat
        icon="arrow_back"
        label="Volver"
        @click="router.back()"
      />
      <h1 class="title">Detalle del Usuario</h1>
    </div>

    <div v-if="!userStore.loading && user" class="content">
      <q-card class="user-detail-card">
        <q-card-section class="user-header">
          <div class="user-avatar">
            <span class="material-symbols-outlined">person</span>
          </div>
          <div class="user-info">
            <h2 class="user-name">{{ user.fullName }}</h2>
            <p class="user-email">{{ user.email }}</p>
            <div class="user-roles" v-if="user.role">
              <q-badge :color="getRoleColor(user.role)">
                {{ getRoleLabel(user.role) }}
              </q-badge>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <h3 class="section-title">Información Personal</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nombre Completo</span>
              <span class="info-value">{{ user.fullName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">{{ user.email }}</span>
            </div>
            <div class="info-item" v-if="user.phone">
              <span class="info-label">Teléfono</span>
              <span class="info-value">{{ user.phone }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de Registro</span>
              <span class="info-value">{{ formatDate(user.createdAt) }}</span>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section v-if="userResident">
          <h3 class="section-title">Información de Residente</h3>
          <div class="resident-info">
            <div class="info-item">
              <span class="info-label">Estado</span>
              <span class="info-value">
                <q-badge :color="userResident.status === 'approved' ? 'positive' : 'warning'">
                  {{ getStatusLabel(userResident.status) }}
                </q-badge>
              </span>
            </div>
            <div class="info-item" v-if="userResident.dwellingId">
              <span class="info-label">Vivienda</span>
              <span class="info-value">{{ getDwellingName(userResident.dwellingId) }}</span>
            </div>
            <div class="info-item" v-if="userResident.communityId">
              <span class="info-label">Comunidad</span>
              <span class="info-value">{{ getCommunityName(userResident.communityId) }}</span>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section v-if="canManageRoles">
          <h3 class="section-title">Gestión de Roles</h3>
          <p class="roles-hint">
            <span class="material-symbols-outlined">info</span>
            Cada usuario solo puede tener un rol a la vez. Para cambiar el rol, primero remueve el actual.
          </p>

          <!-- Roles de junta directiva ya ocupados -->
          <div v-if="occupiedBoardRoles.length > 0" class="occupied-roles-hint">
            <span class="material-symbols-outlined">block</span>
            <span>
              Los siguientes roles ya estan asignados a otro usuario:
              <strong>{{ occupiedBoardRoles.map(getRoleLabel).join(', ') }}</strong>.
            </span>
          </div>

          <!-- Usuario ya tiene un rol -->
          <div v-if="user.role" class="current-role">
            <div class="current-role-badge">
              <span class="material-symbols-outlined">badge</span>
              <span>Rol actual: <strong>{{ getRoleLabel(user.role) }}</strong></span>
            </div>
          </div>

          <div class="roles-management">
            <div
              v-for="role in availableRoles"
              :key="role"
              class="role-item"
              :class="{
                assigned: user.role === role,
                disabled: user.role && user.role !== role
              }"
            >
              <div class="role-info">
                <span class="role-name">{{ getRoleLabel(role) }}</span>
                <span class="role-description">{{ getRoleDescription(role) }}</span>
              </div>
              <q-btn
                v-if="!user.role"
                color="primary"
                label="Asignar"
                size="sm"
                @click="handleAssignRole(role)"
              />
              <q-btn
                v-else-if="user.role === role && user._id !== authStore.user?._id"
                color="negative"
                label="Remover"
                size="sm"
                @click="handleRemoveRole()"
              />
              <q-badge
                v-else-if="user.role === role && user._id === authStore.user?._id"
                color="positive"
                outline
              >
                <span class="material-symbols-outlined" style="font-size: 14px;">verified_user</span>
                Tu rol
              </q-badge>
              <q-badge
                v-else
                color="grey"
                outline
              >
                <span class="material-symbols-outlined" style="font-size: 14px;">lock</span>
                Bloqueado
              </q-badge>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="userStore.loading" class="loading">
      <q-spinner color="primary" size="3em" />
      <p>Cargando usuario...</p>
    </div>

    <div v-else class="no-data">
      <span class="material-symbols-outlined">error</span>
      <p>Usuario no encontrado</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserStore } from '@/stores/user.store'
import { useResidentStore } from '@/stores/resident.store'
import { useDwellingStore } from '@/stores/dwelling.store'
import { useCommunityStore } from '@/stores/community.store'
import { useAuthStore } from '@/stores/auth.store'
import { useRoleStore } from '@/stores/role.store'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const userStore = useUserStore()
const residentStore = useResidentStore()
const dwellingStore = useDwellingStore()
const communityStore = useCommunityStore()
const authStore = useAuthStore()
const roleStore = useRoleStore()

const userId = computed(() => route.params.id)
const user = computed(() => userStore.currentUser)

const canManageRoles = computed(() => {
  // Solo el presidente puede gestionar roles de junta directiva
  const userRole = authStore.user?.role || authStore.userRole
  const result = userRole === 'president'
  return result
})

const userResident = computed(() => {
  return residentStore.residents.find(r => r.userId?._id === userId.value || r.userId === userId.value)
})

// Roles de junta directiva ya ocupados por otro usuario en la comunidad
const occupiedBoardRoles = computed(() => {
  const boardRoles = ['president', 'tesorero', 'secretario']
  return boardRoles.filter(role => {
    const occupant = userStore.users.find(
      u => u.role === role && u._id !== userId.value && u.isActive !== false
    )
    return !!occupant
  })
})

// Roles asignables desde el store (filtra ocupados y residente por defecto)
const availableRoles = computed(() => {
  const roles = roleStore.roles
    .filter(r => r.isActive && r.name !== 'residente')
    .map(r => r.customName || r.name)

  // Ocultar roles de junta directiva ya ocupados por otro usuario
  const occupied = occupiedBoardRoles.value
  return roles.filter(role => !occupied.includes(role))
})

const getRoleColor = (role) => {
  const colors = {
    president: 'primary',
    tesorero: 'secondary',
    secretario: 'info',
    residente: 'positive',
    censista: 'teal'
  }
  return colors[role] || 'grey'
}

const getRoleLabel = (role) => {
  // Buscar si es un rol personalizado con customName
  const roleFromStore = roleStore.roles.find(r => (r.customName || r.name) === role)
  if (roleFromStore?.customName) {
    return roleFromStore.customName
  }

  const labels = {
    president: 'Presidente',
    tesorero: 'Tesorero',
    secretario: 'Secretario',
    residente: 'Residente',
    censista: 'Censista'
  }
  return labels[role] || role
}

onMounted(async () => {
  await Promise.all([
    userStore.fetchUserById(userId.value),
    userStore.fetchUsers(),
    residentStore.fetchResidents(),
    dwellingStore.fetchDwellings(),
    communityStore.fetchCommunities(),
    roleStore.fetchCommunityRoles()
  ])
})

const getRoleDescription = (role) => {
  const descriptions = {
    president: 'Puede aprobar viviendas, residentes y cartas',
    treasurer: 'Puede aprobar viviendas, residentes y cartas',
    secretary: 'Puede aprobar viviendas, residentes y cartas',
    residente: 'Residente de la comunidad',
    censista: 'Puede realizar censos'
  }
  return descriptions[role] || ''
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-ES')
}

const getDwellingName = (dwellingId) => {
  if (typeof dwellingId === 'object' && dwellingId?.houseNomenclature) {
    return dwellingId.houseNomenclature
  }
  const dwelling = dwellingStore.dwellings.find(d => d._id === dwellingId)
  return dwelling?.houseNomenclature || 'Sin nomenclatura'
}

const getCommunityName = (communityId) => {
  if (typeof communityId === 'object' && communityId?.name) {
    return communityId.name
  }
  const community = communityStore.communities.find(c => c._id === communityId)
  return community?.name || 'Comunidad'
}

const handleAssignRole = async (role) => {
  $q.dialog({
    title: 'Confirmar asignación de rol',
    message: `¿Estás seguro de que deseas asignar el rol <strong>${getRoleLabel(role)}</strong> a este usuario?<br><br>El usuario perderá cualquier rol que tenga actualmente.`,
    html: true,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Asignar',
      color: 'primary',
      flat: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey',
      flat: true
    }
  }).onOk(async () => {
    const result = await userStore.assignRole(userId.value, role)

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: `Rol ${getRoleLabel(role)} asignado exitosamente`
      })
      await userStore.fetchUserById(userId.value)
    } else {
      $q.notify({
        type: 'negative',
        message: result.message || 'Error al asignar rol'
      })
    }
  })
}

const handleRemoveRole = async () => {
  const currentRole = user.value.role
  $q.dialog({
    title: 'Confirmar remoción de rol',
    message: `¿Estás seguro de que deseas remover el rol <strong>${getRoleLabel(currentRole)}</strong> de este usuario?<br><br>El usuario quedará sin rol asignado.`,
    html: true,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Remover',
      color: 'negative',
      flat: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey',
      flat: true
    }
  }).onOk(async () => {
    const result = await userStore.removeRole(userId.value)

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Rol removido exitosamente'
      })
      await userStore.fetchUserById(userId.value)
    } else {
      $q.notify({
        type: 'negative',
        message: result.message || 'Error al remover rol'
      })
    }
  })
}

const isLastAdmin = (role) => {
  // Solo aplica para roles de junta directiva
  if (!['president', 'tesorero', 'secretario'].includes(role)) return false
  // No bloquear la remoción - el backend puede validar si es necesario
  return false
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

.user-detail-card {
  border-radius: 16px;
  background: var(--surface-container-lowest) !important;
  border: 1px solid var(--surface-container-highest);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-detail-card :deep(.q-card__section) {
  background: transparent !important;
}

.user-detail-card :deep(.q-separator) {
  background: var(--surface-container-highest) !important;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 40, 142, 0.2);
}

.user-avatar .material-symbols-outlined {
  font-size: 32px;
  color: var(--on-primary);
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 4px 0;
}

.user-email {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0 0 8px 0;
}

.user-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--primary);
}

.roles-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--on-surface-variant);
  background: var(--surface-container);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid var(--surface-container-highest);
}

.roles-hint .material-symbols-outlined {
  font-size: 18px;
  color: var(--primary);
}

.occupied-roles-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--on-error-container);
  background: var(--error-container);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid var(--error);
}

.occupied-roles-hint .material-symbols-outlined {
  font-size: 18px;
  color: var(--error);
}

.current-role {
  margin-bottom: 16px;
}

.current-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--primary-50);
  color: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.current-role-badge .material-symbols-outlined {
  font-size: 18px;
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
  font-size: 11px;
  font-weight: 600;
  color: var(--outline);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 14px;
  color: var(--on-surface);
}

.resident-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.roles-management {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--surface-container);
  border-radius: 12px;
  border: 1px solid var(--surface-container-highest);
  transition: all 0.2s;
}

.role-item.assigned {
  border-color: var(--success);
  background: var(--success-container);
}

.role-item.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.role-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.role-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
}

.role-description {
  font-size: 12px;
  color: var(--on-surface-variant);
}

.loading, .no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading {
  color: var(--on-surface-variant);
}

.no-data .material-symbols-outlined {
  font-size: 48px;
  color: var(--error);
  margin-bottom: 16px;
}

.no-data p {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0;
}
</style>

