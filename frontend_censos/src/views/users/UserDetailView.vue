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
      <div class="header-actions">
        <q-btn
          color="primary"
          label="Asignar Rol"
          icon="badge"
          @click="showAssignRole = true"
          v-if="canManageRoles"
        />
      </div>
    </div>

    <div v-if="!userStore.loading && user" class="content">
      <q-card class="user-card">
        <q-card-section class="user-header">
          <div class="user-avatar">
            <span class="material-symbols-outlined">person</span>
          </div>
          <div class="user-info">
            <h2 class="user-name">{{ user.fullName }}</h2>
            <p class="user-email">{{ user.email }}</p>
            <div class="user-roles">
              <q-badge
                v-for="role in user.roles"
                :key="role"
                :color="getRoleColor(role)"
              >
                {{ getRoleLabel(role) }}
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
          <div class="roles-management">
            <div
              v-for="role in availableRoles"
              :key="role"
              class="role-item"
              :class="{ assigned: user.roles?.includes(role) }"
            >
              <div class="role-info">
                <span class="role-name">{{ getRoleLabel(role) }}</span>
                <span class="role-description">{{ getRoleDescription(role) }}</span>
              </div>
              <q-btn
                v-if="!user.roles?.includes(role)"
                color="primary"
                label="Asignar"
                size="sm"
                @click="handleAssignRole(role)"
              />
              <q-btn
                v-else
                color="negative"
                label="Remover"
                size="sm"
                @click="handleRemoveRole(role)"
                :disable="isLastAdmin(role)"
              />
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

    <!-- Dialog para asignar rol -->
    <q-dialog v-model="showAssignRole">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Asignar Rol</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            v-model="selectedRole"
            :options="availableRolesOptions"
            option-value="value"
            option-label="label"
            label="Selecciona un rol"
            outlined
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn label="Asignar" color="primary" @click="confirmAssignRole" />
        </q-card-actions>
      </q-card>
    </q-dialog>
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

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const userStore = useUserStore()
const residentStore = useResidentStore()
const dwellingStore = useDwellingStore()
const communityStore = useCommunityStore()
const authStore = useAuthStore()

const userId = computed(() => route.params.id)
const user = computed(() => userStore.currentUser)

const canManageRoles = computed(() => {
  return authStore.user?.roles?.includes('admin')
})

const userResident = computed(() => {
  return residentStore.residents.find(r => r.userId?._id === userId.value || r.userId === userId.value)
})

const showAssignRole = ref(false)
const selectedRole = ref('')

const availableRoles = ['president', 'treasurer', 'secretary', 'residente', 'censista']

const availableRolesOptions = availableRoles.map(role => ({
  value: role,
  label: getRoleLabel(role)
}))

onMounted(async () => {
  await Promise.all([
    userStore.fetchUserById(userId.value),
    residentStore.fetchResidents(),
    dwellingStore.fetchDwellings(),
    communityStore.fetchCommunities()
  ])
})

const getRoleColor = (role) => {
  const colors = {
    admin: 'purple',
    president: 'primary',
    treasurer: 'secondary',
    secretary: 'info',
    residente: 'positive',
    censista: 'teal'
  }
  return colors[role] || 'grey'
}

const getRoleLabel = (role) => {
  const labels = {
    admin: 'Administrador',
    president: 'Presidente',
    treasurer: 'Tesorero',
    secretary: 'Secretario',
    residente: 'Residente',
    censista: 'Censista'
  }
  return labels[role] || role
}

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

const handleAssignRole = (role) => {
  selectedRole.value = role
  showAssignRole.value = true
}

const confirmAssignRole = async () => {
  if (!selectedRole.value) return

  const result = await userStore.assignRole(userId.value, selectedRole.value)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Rol asignado exitosamente'
    })
    await userStore.fetchUserById(userId.value)
    showAssignRole.value = false
  } else {
    $q.notify({
      type: 'negative',
      message: result.message || 'Error al asignar rol'
    })
  }
}

const handleRemoveRole = async (role) => {
  $q.dialog({
    title: 'Remover Rol',
    message: `¿Estás seguro de que quieres remover el rol de ${getRoleLabel(role)} a este usuario?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const result = await userStore.removeRole(userId.value, role)

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
  if (role !== 'admin') return false
  const admins = userStore.users.filter(u => u.roles?.includes('admin'))
  return admins.length <= 1
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

.user-card {
  border-radius: 12px;
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
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 4px 0;
}

.user-email {
  font-size: 14px;
  color: var(--outline);
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
  background: var(--surface-container-lowest);
  border-radius: 8px;
  border: 2px solid transparent;
}

.role-item.assigned {
  border-color: var(--tertiary);
  background: var(--tertiary-fixed);
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
  color: var(--outline);
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
