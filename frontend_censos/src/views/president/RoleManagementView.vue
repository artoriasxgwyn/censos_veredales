<template>
  <div class="page">
    <div class="page-content">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <p class="page-subtitle">Gestión de Roles</p>
          <h1 class="page-title">Roles y Permisos</h1>
          <p class="page-description">Administre los roles y permisos de la comunidad</p>
        </div>
        <q-btn
          color="primary"
          label="Nuevo Rol"
          icon="add"
          @click="showCreateRole = true"
        />
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <q-card class="stat-card">
          <div class="stat-icon primary">
            <span class="material-symbols-outlined">badge</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ roleStore.baseRoles.length }}</div>
            <div class="stat-label">Roles Base</div>
          </div>
        </q-card>

        <q-card class="stat-card">
          <div class="stat-icon secondary">
            <span class="material-symbols-outlined">admin_panel_settings</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ roleStore.customRoles.length }}</div>
            <div class="stat-label">Roles Personalizados</div>
          </div>
        </q-card>
      </div>

      <!-- Roles List -->
      <div class="roles-section" v-if="!roleStore.loading">
        <h3 class="section-title">Roles Base</h3>
        <div class="roles-grid">
          <q-card
            v-for="role in roleStore.baseRoles"
            :key="role._id"
            class="role-card"
            @click="editRole(role)"
          >
            <div class="role-header">
              <div class="role-icon base">
                <span class="material-symbols-outlined">{{ getRoleIcon(role.name) }}</span>
              </div>
              <div class="role-info">
                <h4 class="role-name">{{ formatRoleName(role.name) }}</h4>
                <q-badge color="primary" outline>Rol Base</q-badge>
              </div>
            </div>

            <q-separator />

            <div class="role-body">
              <div class="permissions-preview">
                <span class="material-symbols-outlined">visibility</span>
                {{ countPermissions(role.permissions) }} permisos configurados
              </div>
            </div>
          </q-card>
        </div>

        <h3 class="section-title">Roles Personalizados</h3>
        <div class="roles-grid">
          <q-card
            v-for="role in roleStore.customRoles"
            :key="role._id"
            class="role-card"
            @click="editRole(role)"
          >
            <div class="role-header">
              <div class="role-icon custom">
                <span class="material-symbols-outlined">badge</span>
              </div>
              <div class="role-info">
                <h4 class="role-name">{{ role.customName }}</h4>
                <q-badge color="secondary" outline>Personalizado</q-badge>
              </div>
              <q-btn
                flat
                round
                dense
                icon="more_vert"
                @click.stop="showRoleMenu(role, $event)"
              />
            </div>

            <q-separator />

            <div class="role-body">
              <div class="permissions-preview">
                <span class="material-symbols-outlined">visibility</span>
                {{ countPermissions(role.permissions) }} permisos configurados
              </div>
            </div>
          </q-card>

          <div v-if="roleStore.customRoles.length === 0" class="empty-custom-roles">
            <span class="material-symbols-outlined">admin_panel_settings</span>
            <p>No hay roles personalizados</p>
            <q-btn
              color="secondary"
              label="Crear Rol Personalizado"
              @click="showCreateRole = true"
              flat
            />
          </div>
        </div>
      </div>

      <!-- Create/Edit Role Dialog -->
      <q-dialog v-model="showCreateRole" persistent>
        <q-card class="dialog-card">
          <q-card-section>
            <div class="dialog-header">
              <h4 class="dialog-title">{{ editingRole?.isBaseRole ? 'Editar Permisos de Rol Base' : (editingRole ? 'Editar Rol Personalizado' : 'Nuevo Rol Personalizado') }}</h4>
              <q-badge v-if="editingRole?.isBaseRole" color="primary" outline>Base</q-badge>
            </div>

            <q-input
              v-model="newRoleName"
              label="Nombre del Rol"
              placeholder="Ej: Coordinador"
              outlined
              :readonly="!!editingRole?.isBaseRole"
              :disable="!!editingRole?.isBaseRole"
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <span class="material-symbols-outlined">badge</span>
              </template>
            </q-input>
          </q-card-section>

          <q-card-section>
            <h5 class="permissions-title">Permisos</h5>

            <!-- Resident Permissions -->
            <div class="permission-group">
              <div class="group-header">
                <span class="material-symbols-outlined">people</span>
                <strong>Residentes</strong>
              </div>
              <div class="permission-row">
                <q-checkbox v-model="newRolePermissions.resident.create" label="Crear" />
                <q-checkbox v-model="newRolePermissions.resident.read" label="Leer" />
                <q-checkbox v-model="newRolePermissions.resident.update" label="Actualizar" />
                <q-checkbox v-model="newRolePermissions.resident.delete" label="Eliminar" />
              </div>
            </div>

            <!-- Dwelling Permissions -->
            <div class="permission-group">
              <div class="group-header">
                <span class="material-symbols-outlined">home</span>
                <strong>Viviendas</strong>
              </div>
              <div class="permission-row">
                <q-checkbox v-model="newRolePermissions.dwelling.create" label="Crear" />
                <q-checkbox v-model="newRolePermissions.dwelling.read" label="Leer" />
                <q-checkbox v-model="newRolePermissions.dwelling.update" label="Actualizar" />
                <q-checkbox v-model="newRolePermissions.dwelling.delete" label="Eliminar" />
              </div>
            </div>

            <!-- Letter Permissions -->
            <div class="permission-group">
              <div class="group-header">
                <span class="material-symbols-outlined">description</span>
                <strong>Cartas</strong>
              </div>
              <div class="permission-row">
                <q-checkbox v-model="newRolePermissions.letter.generateNormal" label="Normal" />
                <q-checkbox v-model="newRolePermissions.letter.generateSworn" label="Juramentada" />
                <q-checkbox v-model="newRolePermissions.letter.qrScan" label="Escanear QR" />
              </div>
            </div>

            <!-- Dashboard Permissions -->
            <div class="permission-group">
              <div class="group-header">
                <span class="material-symbols-outlined">dashboard</span>
                <strong>Dashboard</strong>
              </div>
              <div class="permission-row">
                <q-checkbox v-model="newRolePermissions.dashboard.access" label="Acceder" />
                <q-select
                  v-model="newRolePermissions.dashboard.scope"
                  :options="['full', 'limited']"
                  label="Alcance"
                  outlined
                  dense
                  class="scope-select"
                />
              </div>
            </div>

            <!-- User Permissions -->
            <div class="permission-group">
              <div class="group-header">
                <span class="material-symbols-outlined">group</span>
                <strong>Usuario</strong>
              </div>
              <div class="permission-row">
                <q-checkbox v-model="newRolePermissions.user.changePassword" label="Cambiar Contraseña" />
                <q-checkbox v-model="newRolePermissions.user.manageRoles" label="Gestionar Roles" />
              </div>
            </div>

            <!-- Announcement Permissions -->
            <div class="permission-group">
              <div class="group-header">
                <span class="material-symbols-outlined">campaign</span>
                <strong>Anuncios</strong>
              </div>
              <div class="permission-row">
                <q-checkbox v-model="newRolePermissions.announcement.create" label="Crear" />
                <q-checkbox v-model="newRolePermissions.announcement.read" label="Leer" />
                <q-checkbox v-model="newRolePermissions.announcement.update" label="Actualizar" />
                <q-checkbox v-model="newRolePermissions.announcement.delete" label="Eliminar" />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Cancelar"
              @click="cancelEdit"
              v-close-popup
            />
            <q-btn
              color="primary"
              :label="editingRole ? 'Guardar Cambios' : 'Crear Rol'"
              @click="saveRole"
              :loading="saving"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- View Permissions Dialog -->
      <q-dialog v-model="showViewPermissions" persistent>
        <q-card class="dialog-card">
          <q-card-section>
            <div class="dialog-header">
              <h4 class="dialog-title">{{ selectedRole?.customName || formatRoleName(selectedRole?.name) }}</h4>
              <q-badge :color="selectedRole?.isBaseRole ? 'primary' : 'secondary'">
                {{ selectedRole?.isBaseRole ? 'Base' : 'Personalizado' }}
              </q-badge>
            </div>
          </q-card-section>

          <q-card-section class="permissions-list">
            <div v-for="(perms, module) in selectedRole?.permissions" :key="module" class="module-perms">
              <h5 class="module-title">{{ formatModuleName(module) }}</h5>
              <div class="perm-items">
                <div v-for="(value, key) in perms" :key="key" class="perm-item">
                  <span class="perm-label">{{ formatPermissionName(key) }}</span>
                  <q-badge :color="value ? 'positive' : 'negative'">
                    {{ value ? 'Sí' : 'No' }}
                  </q-badge>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Cerrar"
              @click="showViewPermissions = false"
              v-close-popup
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth.store'
import { useRoleStore } from '@/stores/role.store'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const roleStore = useRoleStore()

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

const showCreateRole = ref(false)
const showViewPermissions = ref(false)
const editingRole = ref(null)
const selectedRole = ref(null)
const newRoleName = ref('')
const newRolePermissions = ref({
  resident: { create: false, read: false, update: false, delete: false },
  dwelling: { create: false, read: false, update: false, delete: false },
  letter: { generateNormal: false, generateSworn: false, qrScan: false },
  dashboard: { access: false, scope: 'limited' },
  user: { changePassword: false, manageRoles: false },
  announcement: { create: false, read: false, update: false, delete: false }
})
const saving = ref(false)

onMounted(async () => {
  await roleStore.fetchCommunityRoles()
})

const getRoleIcon = (roleName) => {
  const icons = {
    president: 'admin_panel_settings',
    secretario: 'assignment',
    tesorero: 'account_balance',
    residente: 'person',
    censista: 'fact_check'
  }
  return icons[roleName] || 'badge'
}

const formatRoleName = (name) => {
  const names = {
    president: 'Presidente',
    secretario: 'Secretario',
    tesorero: 'Tesorero',
    residente: 'Residente',
    censista: 'Censista'
  }
  return names[name] || name
}

const formatModuleName = (module) => {
  const names = {
    resident: 'Residentes',
    dwelling: 'Viviendas',
    letter: 'Cartas',
    dashboard: 'Dashboard',
    user: 'Usuario',
    announcement: 'Anuncios'
  }
  return names[module] || module
}

const formatPermissionName = (key) => {
  const names = {
    create: 'Crear',
    read: 'Leer',
    update: 'Actualizar',
    delete: 'Eliminar',
    generateNormal: 'Generar Normal',
    generateSworn: 'Generar Juramentada',
    qrScan: 'Escanear QR',
    access: 'Acceso',
    scope: 'Alcance',
    changePassword: 'Cambiar Contraseña',
    manageRoles: 'Gestionar Roles'
  }
  return names[key] || key
}

const countPermissions = (permissions) => {
  let count = 0
  for (const module of Object.values(permissions)) {
    for (const value of Object.values(module)) {
      if (value === true) count++
    }
  }
  return count
}

const editRole = (role) => {
  // Edit both base and custom roles
  editingRole.value = role
  newRoleName.value = role.customName || formatRoleName(role.name)
  newRolePermissions.value = JSON.parse(JSON.stringify(role.permissions))
  showCreateRole.value = true
}

const showRoleMenu = (role, event) => {
  $q.dialog({
    message: '¿Qué desea hacer con este rol?',
    persistent: true,
    options: [
      {
        label: 'Ver Permisos',
        handler: () => {
          selectedRole.value = role
          showViewPermissions.value = true
        }
      },
      {
        label: 'Editar',
        handler: () => editRole(role)
      },
      {
        label: 'Desactivar',
        handler: () => deactivateRole(role)
      },
      {
        label: 'Cancelar',
        handler: () => {}
      }
    ]
  })
}

const deactivateRole = async (role) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de desactivar el rol "${role.customName}"? Los usuarios con este rol perderán sus permisos.`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Desactivar',
      color: 'negative',
      flat: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'primary',
      flat: true
    }
  }).onOk(async () => {
    const result = await roleStore.deactivateRole(role._id)
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Rol desactivado exitosamente',
        caption: 'Los usuarios con este rol han perdido sus permisos',
        timeout: 4000
      })
    } else {
      const errorMsg = result.message || ''

      if (errorMsg.toLowerCase().includes('permiso') || errorMsg.toLowerCase().includes('autorización')) {
        $q.notify({
          type: 'negative',
          message: 'No tienes permisos para desactivar roles',
          caption: 'Se requiere autorización de presidente',
          timeout: 4000
        })
      } else if (errorMsg.toLowerCase().includes('último rol') || errorMsg.toLowerCase().includes('no se puede')) {
        $q.notify({
          type: 'negative',
          message: 'No se puede desactivar este rol',
          caption: errorMsg,
          timeout: 5000
        })
      } else {
        $q.notify({
          type: 'negative',
          message: 'Error al desactivar rol',
          caption: errorMsg,
          timeout: 5000
        })
      }
    }
  })
}

const cancelEdit = () => {
  editingRole.value = null
  newRoleName.value = ''
  newRolePermissions.value = {
    resident: { create: false, read: false, update: false, delete: false },
    dwelling: { create: false, read: false, update: false, delete: false },
    letter: { generateNormal: false, generateSworn: false, qrScan: false },
    dashboard: { access: false, scope: 'limited' },
    user: { changePassword: false, manageRoles: false },
    announcement: { create: false, read: false, update: false, delete: false }
  }
}

const saveRole = async () => {
  if (!editingRole.value?.isBaseRole && !newRoleName.value.trim()) {
    $q.notify({
      type: 'warning',
      message: 'El nombre del rol es requerido',
      caption: 'Ingresa un nombre válido para el rol',
      timeout: 4000
    })
    return
  }

  saving.value = true

  try {
    if (editingRole.value) {
      // Update existing role (base or custom)
      const result = await roleStore.updateRolePermissions(editingRole.value._id, newRolePermissions.value)
      if (result.success) {
        $q.notify({
          type: 'positive',
          message: 'Permisos actualizados exitosamente',
          caption: editingRole.value.isBaseRole
            ? 'Los permisos del rol base han sido modificados'
            : 'El rol personalizado ha sido actualizado',
          timeout: 4000
        })
        showCreateRole.value = false
        cancelEdit()
      } else {
        throw new Error(result.message)
      }
    } else {
      // Create new role
      const result = await roleStore.createRole({
        customName: newRoleName.value.trim(),
        permissions: newRolePermissions.value
      })
      if (result.success) {
        $q.notify({
          type: 'positive',
          message: 'Rol creado exitosamente',
          caption: 'Ya puedes asignar este rol a los usuarios',
          timeout: 4000
        })
        showCreateRole.value = false
        cancelEdit()
      } else {
        throw new Error(result.message)
      }
    }
  } catch (error) {
    const errorMsg = error.message || ''

    if (errorMsg.toLowerCase().includes('ya existe') || errorMsg.toLowerCase().includes('duplicado')) {
      $q.notify({
        type: 'negative',
        message: 'El rol ya existe',
        caption: 'Usa un nombre diferente para el rol',
        timeout: 4000
      })
    } else if (errorMsg.toLowerCase().includes('permiso') || errorMsg.toLowerCase().includes('autorización')) {
      $q.notify({
        type: 'negative',
        message: 'No tienes permisos para gestionar roles',
        caption: 'Se requiere autorización de presidente',
        timeout: 4000
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Error al guardar rol',
        caption: errorMsg,
        timeout: 5000
      })
    }
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--surface-container-lowest);
}

.page-content {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
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
  max-width: 500px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(25, 28, 30, 0.04) !important;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon .material-symbols-outlined {
  font-size: 28px;
  color: var(--on-primary);
}

.stat-icon.primary { background: var(--primary); }
.stat-icon.secondary { background: var(--secondary); }

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--on-surface);
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 13px;
  color: var(--on-surface-variant);
  font-weight: 500;
}

/* Roles Section */
.roles-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 16px 0;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.role-card {
  border-radius: 12px !important;
  cursor: pointer;
  transition: all 0.2s;
}

.role-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
  transform: translateY(-2px);
}

.role-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.role-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.role-icon .material-symbols-outlined {
  font-size: 24px;
  color: var(--on-primary);
}

.role-icon.base { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%); }
.role-icon.custom { background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-container) 100%); }

.role-info {
  flex: 1;
  min-width: 0;
}

.role-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 8px 0;
}

.role-body {
  padding: 16px;
  padding-top: 0 !important;
}

.permissions-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--on-surface-variant);
}

.permissions-preview .material-symbols-outlined {
  font-size: 18px;
  color: var(--primary);
}

.empty-custom-roles {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  background: var(--surface-container);
  border-radius: 12px;
  text-align: center;
}

.empty-custom-roles .material-symbols-outlined {
  font-size: 48px;
  color: var(--outline);
  margin-bottom: 12px;
}

.empty-custom-roles p {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0 0 16px 0;
}

/* Dialog */
.dialog-card {
  border-radius: 16px !important;
  max-width: 600px;
  width: 100%;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
}

.permissions-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 16px 0;
}

.permission-group {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--surface-container);
  border-radius: 8px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.group-header .material-symbols-outlined {
  color: var(--primary);
}

.permission-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.scope-select {
  width: 150px;
  margin-left: auto;
}

/* Permissions List Dialog */
.permissions-list {
  max-height: 400px;
  overflow-y: auto;
}

.module-perms {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--surface-container-highest);
}

.module-perms:last-child {
  border-bottom: none;
}

.module-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.perm-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.perm-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--surface-container-lowest);
  border-radius: 6px;
}

.perm-label {
  font-size: 13px;
  color: var(--on-surface-variant);
}
</style>
