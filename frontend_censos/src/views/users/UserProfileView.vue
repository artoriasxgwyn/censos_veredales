<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="title">Mi Perfil</h1>
      <q-btn
        color="primary"
        label="Editar Perfil"
        icon="edit"
        @click="showEditProfile = true"
      />
    </div>

    <!-- Banner de solicitud pendiente -->
    <q-banner v-if="hasPendingChange" class="pending-banner" dense rounded>
      <template v-slot:avatar>
        <span class="material-symbols-outlined">hourglass_top</span>
      </template>
      Tienes una solicitud de cambio de perfil en revisión. La junta directiva debe aprobarla.
    </q-banner>

    <div v-if="!authStore.loading && authStore.user" class="content">
      <q-card class="profile-card">
        <q-card-section class="profile-header">
          <div class="profile-avatar">
            <span class="material-symbols-outlined">person</span>
          </div>
          <div class="profile-info">
            <h2 class="profile-name">{{ authStore.user.fullName }}</h2>
            <p class="profile-email">{{ authStore.user.email }}</p>
            <div class="profile-roles">
              <q-badge
                v-for="role in authStore.user.roles"
                :key="role"
                :color="getRoleColor(role)"
              >
                {{ getRoleLabel(role) }}
              </q-badge>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section id="personal-info">
          <h3 class="section-title">Información Personal</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nombre Completo</span>
              <span class="info-value">{{ authStore.user.fullName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">{{ authStore.user.email }}</span>
            </div>
            <div class="info-item" v-if="authStore.user.phone">
              <span class="info-label">Teléfono</span>
              <span class="info-value">{{ authStore.user.phone }}</span>
            </div>
            <div class="info-item" v-if="authStore.user.birthDate">
              <span class="info-label">Fecha de Nacimiento</span>
              <span class="info-value">{{ formatDate(authStore.user.birthDate) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de Registro</span>
              <span class="info-value">{{ formatDate(authStore.user.createdAt) }}</span>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section v-if="residentInfo">
          <h3 class="section-title">Información de Residente</h3>
          <div class="resident-info">
            <div class="info-item">
              <span class="info-label">Estado</span>
              <span class="info-value">
                <q-badge :color="residentInfo.status === 'approved' ? 'positive' : 'warning'">
                  {{ getStatusLabel(residentInfo.status) }}
                </q-badge>
              </span>
            </div>
            <div class="info-item" v-if="residentInfo.dwellingId">
              <span class="info-label">Vivienda</span>
              <span class="info-value">{{ getDwellingName(residentInfo.dwellingId) }}</span>
            </div>
            <div class="info-item" v-if="residentInfo.communityId">
              <span class="info-label">Comunidad</span>
              <span class="info-value">{{ getCommunityName(residentInfo.communityId) }}</span>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <h3 class="section-title">Seguridad</h3>
          <div class="security-actions">
            <q-btn
              color="secondary"
              label="Cambiar Contraseña"
              icon="lock"
              @click="showChangePassword = true"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Stats cards -->
      <div class="stats-grid" v-if="dashboardStats">
        <q-card class="stat-card dark-card">
          <q-card-section class="stat-header">
            <div class="stat-icon tertiary">
              <span class="material-symbols-outlined">home</span>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ dashboardStats.dwellings || 0 }}</span>
              <span class="stat-label">Viviendas</span>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card dark-card">
          <q-card-section class="stat-header">
            <div class="stat-icon warning">
              <span class="material-symbols-outlined">people</span>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ dashboardStats.residents || 0 }}</span>
              <span class="stat-label">Residentes</span>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card dark-card">
          <q-card-section class="stat-header">
            <div class="stat-icon primary">
              <span class="material-symbols-outlined">description</span>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ dashboardStats.letters || 0 }}</span>
              <span class="stat-label">Cartas</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-else-if="authStore.loading" class="loading">
      <q-spinner color="primary" size="3em" />
      <p>Cargando perfil...</p>
    </div>

    <!-- Dialog para editar perfil -->
    <q-dialog v-model="showEditProfile">
      <q-card class="dark-dialog" style="min-width: 400px">
        <q-card-section>
          <div class="dialog-title">Editar Perfil</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="editForm.fullName"
            label="Nombre Completo"
            outlined
            dense
            class="q-mb-md"
          />
          <q-input
            v-model="editForm.documentNumber"
            label="Número de Documento"
            outlined
            dense
            class="q-mb-md"
          />
          <q-input
            v-model="editForm.birthDate"
            label="Fecha de Nacimiento"
            type="date"
            outlined
            dense
            class="q-mb-md"
          />
          <q-input
            v-model="editForm.phone"
            label="Teléfono"
            outlined
            dense
            class="q-mb-md"
          />
          <q-input
            v-model="editForm.email"
            label="Correo Electrónico"
            type="email"
            outlined
            dense
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn label="Guardar" color="primary" @click="handleUpdateProfile" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para cambiar contraseña -->
    <q-dialog v-model="showChangePassword">
      <q-card class="dark-dialog" style="min-width: 400px">
        <q-card-section>
          <div class="dialog-title">Cambiar Contraseña</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="passwordForm.currentPassword"
            label="Contraseña Actual"
            type="password"
            outlined
            dense
            class="q-mb-md"
          />
          <q-input
            v-model="passwordForm.newPassword"
            label="Nueva Contraseña"
            type="password"
            outlined
            dense
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn label="Cambiar" color="primary" @click="handleChangePassword" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth.store'
import { useResidentStore } from '@/stores/resident.store'
import { useDwellingStore } from '@/stores/dwelling.store'
import { useCommunityStore } from '@/stores/community.store'
import { useDashboardStore } from '@/stores/dashboard.store'
import { userService } from '@/services/user.service'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const residentStore = useResidentStore()
const dwellingStore = useDwellingStore()
const communityStore = useCommunityStore()
const dashboardStore = useDashboardStore()

const user = computed(() => authStore.user)

const residentInfo = computed(() => {
  if (!user.value) return null
  return residentStore.residents.find(r =>
    r.userId?._id === user.value._id || r.userId === user.value._id
  )
})

const dashboardStats = ref(null)

const showEditProfile = ref(false)
const showChangePassword = ref(false)

const editForm = ref({
  fullName: '',
  phone: '',
  documentNumber: '',
  birthDate: '',
  email: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: ''
})

const pendingChanges = ref([])
const hasPendingChange = computed(() => pendingChanges.value.some(c => c.status === 'pending'))

onMounted(async () => {
  await authStore.fetchUser()

  if (residentInfo.value) {
    await Promise.all([
      dwellingStore.fetchDwellings(),
      communityStore.fetchCommunities()
    ])
  }

  // Cargar stats del dashboard
  if (authStore.isAdmin || authStore.isPresident || authStore.isTreasurer || authStore.isSecretary) {
    const stats = await dashboardStore.fetchAdminDashboard()
    if (stats) {
      dashboardStats.value = stats
    }
  } else {
    const stats = await dashboardStore.fetchResidentDashboard()
    if (stats) {
      dashboardStats.value = stats
    }
  }

  // Cargar solicitudes de cambio de perfil pendientes
  try {
    const pendingRes = await userService.getMyPendingChanges()
    if (pendingRes.success) {
      pendingChanges.value = pendingRes.data || []
    }
  } catch (e) {
    // Silenciar error si el endpoint no está disponible
  }

  if (user.value) {
    editForm.value = {
      fullName: user.value.fullName || '',
      phone: user.value.phone || '',
      documentNumber: user.value.documentNumber || '',
      birthDate: user.value.birthDate ? user.value.birthDate.split('T')[0] : '',
      email: user.value.email || ''
    }
  }

  // Scroll automático si viene con hash
  setTimeout(() => {
    const hash = window.location.hash
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, 300)
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

const handleUpdateProfile = async () => {
  try {
    // Filtrar solo campos con valor
    const payload = {};
    if (editForm.value.fullName) payload.fullName = editForm.value.fullName;
    if (editForm.value.phone) payload.phone = editForm.value.phone;
    if (editForm.value.documentNumber) payload.documentNumber = editForm.value.documentNumber;
    if (editForm.value.birthDate) payload.birthDate = editForm.value.birthDate;
    if (editForm.value.email) payload.email = editForm.value.email;

    if (Object.keys(payload).length === 0) {
      $q.notify({ type: 'warning', message: 'No has realizado ningún cambio' })
      return
    }

    if (authStore.isPresident) {
      // Presidente: cambio inmediato
      const res = await userService.updateUser(authStore.user._id || authStore.user.id, payload)
      if (res.success) {
        $q.notify({ type: 'positive', message: 'Perfil actualizado exitosamente' })
        await authStore.fetchUser()
        showEditProfile.value = false
      } else {
        throw new Error(res.message || 'Error al actualizar')
      }
    } else {
      // Otros roles: solicitud con triple aprobación
      const res = await userService.requestProfileChange(payload)
      if (res.success) {
        $q.notify({
          type: 'positive',
          message: 'Solicitud enviada. La junta directiva debe aprobar el cambio.'
        })
        pendingChanges.value.unshift(res.data)
        showEditProfile.value = false
      } else {
        throw new Error(res.message || 'Error al enviar solicitud')
      }
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al procesar la solicitud'
    })
  }
}

const handleChangePassword = async () => {
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    $q.notify({
      type: 'warning',
      message: 'Por favor completa todos los campos'
    })
    return
  }

  // Nota: Esto requeriría un endpoint de cambio de contraseña en el backend
  $q.notify({
    type: 'info',
    message: 'El cambio de contraseña estará disponible próximamente'
  })
  showChangePassword.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: ''
  }
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-card {
  border-radius: 12px;
  background: var(--surface-container) !important;
  border: 1px solid var(--surface-container-highest);
}

.profile-card :deep(.q-card__section) {
  background: transparent !important;
}

.profile-card :deep(.q-separator) {
  background: var(--surface-container-highest) !important;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar .material-symbols-outlined {
  font-size: 40px;
  color: var(--on-primary);
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 4px 0;
}

.profile-email {
  font-size: 14px;
  color: var(--outline);
  margin: 0 0 8px 0;
}

.profile-roles {
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

.security-actions {
  display: flex;
  gap: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  border-radius: 12px;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
}
.stat-icon.primary .material-symbols-outlined {
  color: var(--on-primary);
}

.stat-icon.tertiary {
  background: linear-gradient(135deg, var(--success) 0%, var(--success-container) 100%);
}
.stat-icon.tertiary .material-symbols-outlined {
  color: var(--on-success-container);
}

.stat-icon.warning {
  background: linear-gradient(135deg, var(--warning) 0%, var(--warning-container) 100%);
}
.stat-icon.warning .material-symbols-outlined {
  color: var(--on-warning-container);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--on-surface);
}

.stat-label {
  font-size: 13px;
  color: var(--outline);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--outline);
}

.pending-banner {
  background: var(--warning-container) !important;
  color: var(--on-warning-container) !important;
  margin-bottom: 16px;
  border-radius: 8px;
}

.pending-banner .material-symbols-outlined {
  color: var(--warning) !important;
}

/* ============================================================
   ESTILOS OSCUROS - DIALOGS, CARDS, INPUTS
   ============================================================ */

/* Dialogs oscuros */
.dark-dialog {
  background: var(--surface-container) !important;
  border: 1px solid var(--surface-container-highest);
  border-radius: 12px;
}

.dark-dialog :deep(.q-card__section) {
  background: transparent !important;
}

.dark-dialog .dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--on-surface);
}

/* Inputs dentro de dialogs oscuros */
.dark-dialog :deep(.q-field--outlined .q-field__control) {
  background: var(--surface-container-high) !important;
  border-color: var(--surface-container-highest) !important;
}

.dark-dialog :deep(.q-field--outlined .q-field__label) {
  color: var(--on-surface-variant) !important;
}

.dark-dialog :deep(.q-field--outlined .q-field__native) {
  color: var(--on-surface) !important;
}

.dark-dialog :deep(.q-field__messages) {
  color: var(--on-surface-variant) !important;
}

.dark-dialog :deep(.q-btn--flat) {
  color: var(--on-surface) !important;
}

.dark-dialog :deep(.q-btn--flat:hover) {
  background: var(--surface-container-high) !important;
}

/* Stat cards oscuras */
.dark-card {
  background: var(--surface-container) !important;
  border: 1px solid var(--surface-container-highest);
}

.dark-card :deep(.q-card__section) {
  background: transparent !important;
}
</style>
