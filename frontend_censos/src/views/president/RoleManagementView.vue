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
          v-if="canCreateRole"
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
            :class="{ 'clickable': canUpdateRole }"
            @click="canUpdateRole && role.name !== 'president' ? editRole(role) : null"
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
            :class="{ 'clickable': canUpdateRole }"
            @click="canUpdateRole ? editRole(role) : null"
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
                v-if="canDeleteRole"
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
              placeholder="Ej: Coordinador"
              outlined
              :readonly="!!editingRole?.isBaseRole"
              :disable="!!editingRole?.isBaseRole || editingRole?.name === 'president'"
              class="q-mb-md dark-input"
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
                <q-checkbox v-model="newRolePermissions.resident.create" label="Crear" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.resident.read" label="Leer" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.resident.update" label="Actualizar" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.resident.delete" label="Eliminar" :disable="editingRole?.name === 'president'" />
              </div>
            </div>

            <!-- Dwelling Permissions -->
            <div class="permission-group">
              <div class="group-header">
                <span class="material-symbols-outlined">home</span>
                <strong>Viviendas</strong>
              </div>
              <div class="permission-row">
                <q-checkbox v-model="newRolePermissions.dwelling.create" label="Crear" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.dwelling.read" label="Leer" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.dwelling.update" label="Actualizar" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.dwelling.delete" label="Eliminar" :disable="editingRole?.name === 'president'" />
              </div>
            </div>

            <!-- Letter Permissions -->
            <div class="permission-group">
              <div class="group-header">
                <span class="material-symbols-outlined">description</span>
                <strong>Cartas</strong>
              </div>
              <div class="permission-row">
                <q-checkbox v-model="newRolePermissions.letter.generateNormal" label="Normal" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.letter.generateJuramentada" label="Juramentada" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.letter.confirmJuramentada" label="Confirmar Jur." :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.letter.download" label="Descargar" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.letter.verifyQr" label="Verificar QR" :disable="editingRole?.name === 'president'" />
              </div>
            </div>

            <!-- Dashboard Permissions -->
            <div class="permission-group">
              <div class="group-header">
                <span class="material-symbols-outlined">dashboard</span>
                <strong>Dashboard</strong>
              </div>
              <div class="permission-row">
                <q-checkbox v-model="newRolePermissions.dashboard.access" label="Acceder" :disable="editingRole?.name === 'president'" />
                <q-select
                  v-model="newRolePermissions.dashboard.scope"
                  :options="['full', 'limited']"
                  label="Alcance"
                  outlined
                  dense
                  class="scope-select"
                  :menu-props="{ contentClass: 'scope-dropdown' }"
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
                <q-checkbox v-model="newRolePermissions.user.create" label="Crear" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.user.read" label="Leer" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.user.update" label="Actualizar" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.user.delete" label="Eliminar" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.user.changePassword" label="Cambiar Contraseña" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.user.manageRoles" label="Gestionar Roles" :disable="editingRole?.name === 'president'" />
              </div>
            </div>

            <!-- Announcement Permissions -->
            <div class="permission-group">
              <div class="group-header">
                <span class="material-symbols-outlined">campaign</span>
                <strong>Anuncios</strong>
              </div>
              <div class="permission-row">
                <q-checkbox v-model="newRolePermissions.announcement.create" label="Crear" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.announcement.read" label="Leer" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.announcement.update" label="Actualizar" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.announcement.delete" label="Eliminar" :disable="editingRole?.name === 'president'" />
              </div>
            </div>

            <!-- Community Permissions -->
            <div class="permission-group">
              <div class="group-header">
                <span class="material-symbols-outlined">apartment</span>
                <strong>Comunidad</strong>
              </div>
              <div class="permission-row">
                <q-checkbox v-model="newRolePermissions.community.read" label="Ver" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.community.update" label="Actualizar" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.community.delete" label="Eliminar" :disable="editingRole?.name === 'president'" />
              </div>
            </div>

            <!-- Role Permissions -->
            <div class="permission-group">
              <div class="group-header">
                <span class="material-symbols-outlined">badge</span>
                <strong>Roles</strong>
              </div>
              <div class="permission-row">
                <q-checkbox v-model="newRolePermissions.role.create" label="Crear" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.role.read" label="Leer" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.role.update" label="Actualizar" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.role.delete" label="Eliminar" :disable="editingRole?.name === 'president'" />
              </div>
            </div>

            <!-- Export Permissions -->
            <div class="permission-group">
              <div class="group-header">
                <span class="material-symbols-outlined">download</span>
                <strong>Exportar</strong>
              </div>
              <div class="permission-row">
                <q-checkbox v-model="newRolePermissions.export.residents" label="Residentes" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.export.dwellings" label="Viviendas" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.export.letters" label="Cartas" :disable="editingRole?.name === 'president'" />
                <q-checkbox v-model="newRolePermissions.export.all" label="Todo" :disable="editingRole?.name === 'president'" />
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

// Security check: verificar permiso role.read
onMounted(() => {
  // Presidente tiene todos los permisos
  if (authStore.isPresident) return

  // Verificar permiso role.read
  if (!authStore.hasPermission('role', 'read')) {
    $q.notify({
      type: 'negative',
      message: 'Acceso denegado. No tienes permisos para gestionar roles.'
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
  letter: { generateNormal: false, generateJuramentada: false, confirmJuramentada: false, download: false, verifyQr: false },
  dashboard: { access: false, scope: 'limited' },
  user: { create: false, read: false, update: false, delete: false, changePassword: false, manageRoles: false },
  announcement: { create: false, read: false, update: false, delete: false },
  community: { read: false, update: false, delete: false },
  role: { create: false, read: false, update: false, delete: false },
  export: { residents: false, dwellings: false, letters: false, all: false }
})
const saving = ref(false)

onMounted(async () => {
  await roleStore.fetchCommunityRoles()
})

const canCreateRole = computed(() => {
  if (authStore.isPresident) return true
  return authStore.hasPermission('role', 'create')
})

const canUpdateRole = computed(() => {
  if (authStore.isPresident) return true
  return authStore.hasPermission('role', 'update')
})

const canDeleteRole = computed(() => {
  if (authStore.isPresident) return true
  return authStore.hasPermission('role', 'delete')
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
    announcement: 'Anuncios',
    community: 'Comunidad',
    role: 'Roles',
    export: 'Exportar'
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
    generateJuramentada: 'Generar Juramentada',
    confirmJuramentada: 'Confirmar Juramentada',
    download: 'Descargar',
    verifyQr: 'Verificar QR',
    access: 'Acceso',
    scope: 'Alcance',
    changePassword: 'Cambiar Contraseña',
    manageRoles: 'Gestionar Roles',
    residents: 'Residentes',
    dwellings: 'Viviendas',
    letters: 'Cartas',
    all: 'Todo'
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
  // Block editing president role - silently
  if (role.name === 'president') {
    return
  }
  // Verificar permiso para editar
  if (!canUpdateRole.value) {
    return
  }
  // Edit both base and custom roles
  editingRole.value = role
  newRoleName.value = role.customName || formatRoleName(role.name)
  newRolePermissions.value = JSON.parse(JSON.stringify(role.permissions))
  showCreateRole.value = true
}

const showRoleMenu = (role, event) => {
  const options = []

  // Todos pueden ver permisos si tienen role.read
  if (authStore.hasPermission('role', 'read') || authStore.isPresident) {
    options.push({
      label: 'Ver Permisos',
      handler: () => {
        selectedRole.value = role
        showViewPermissions.value = true
      }
    })
  }

  // Solo quienes tienen role.update pueden editar
  if (canUpdateRole.value) {
    options.push({
      label: 'Editar',
      handler: () => editRole(role)
    })
  }

  // Solo quienes tienen role.delete pueden desactivar
  if (canDeleteRole.value) {
    options.push({
      label: 'Desactivar',
      handler: () => deactivateRole(role)
    })
  }

  options.push({
    label: 'Cancelar',
    handler: () => {}
  })

  $q.dialog({
    message: '¿Qué desea hacer con este rol?',
    persistent: true,
    options
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
    letter: { generateNormal: false, generateJuramentada: false, confirmJuramentada: false, download: false, verifyQr: false },
    dashboard: { access: false, scope: 'limited' },
    user: { create: false, read: false, update: false, delete: false, changePassword: false, manageRoles: false },
    announcement: { create: false, read: false, update: false, delete: false },
    community: { read: false, update: false, delete: false },
    role: { create: false, read: false, update: false, delete: false },
    export: { residents: false, dwellings: false, letters: false, all: false }
  }
}

const saveRole = async () => {
  // Block saving changes to president role - silently
  if (editingRole.value?.name === 'president') {
    return
  }

  // Verificar permisos según la acción
  if (editingRole.value && !canUpdateRole.value) {
    $q.notify({
      type: 'negative',
      message: 'No tienes permisos para editar roles'
    })
    return
  }

  if (!editingRole.value && !canCreateRole.value) {
    $q.notify({
      type: 'negative',
      message: 'No tienes permisos para crear roles'
    })
    return
  }

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

.stat-icon.primary { background: var(--primary, #1E40AF); }
.stat-icon.secondary { background: var(--info, #3B82F6); }

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

.role-card:not(.clickable) {
  cursor: default;
}

.role-card.clickable:hover {
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
  color: var(--on-primary) !important;
}

.role-icon.base {
  background: linear-gradient(135deg, #1E40AF 0%, #1e3a8a 100%);
}
.role-icon.custom {
  background: linear-gradient(135deg, #3B82F6 0%, #2563eb 100%);
}

.role-info {
  flex: 1;
  min-width: 0;
}

.role-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--on-surface) !important;
  margin: 0 0 8px 0;
}

/* Badge para nombres de roles */
.role-info q-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
}

/* Badge para números en stat cards */
.stat-value q-badge,
.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--on-surface);
  letter-spacing: -0.02em;
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
  background: var(--surface-container-lowest) !important;
}

.dialog-card .q-card__section {
  background: var(--surface-container-lowest) !important;
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

/* Select styles - texto blanco y bordes blancos (fondo azul por defecto) */
.scope-select :deep(.q-field__native) {
  color: white !important;
  -webkit-text-fill-color: white !important;
}

.scope-select :deep(.q-field__label) {
  color: white !important;
}

.scope-select :deep(.q-field__control) {
  border: 1px solid white !important;
}

.scope-select :deep(.q-field__control:before) {
  border: none !important;
}

.scope-select :deep(.q-field__control::after) {
  border: none !important;
}

.scope-select :deep(.q-select__dropdown-icon) {
  color: white !important;
}

/* Dropdown menu styles */
.scope-dropdown {
  background: var(--surface-container-high) !important;
}

.scope-dropdown .q-item {
  color: var(--on-surface) !important;
}

.scope-dropdown .q-item:hover {
  background: var(--surface-container) !important;
}

.scope-dropdown .q-item--active {
  background: var(--primary) !important;
  color: var(--on-primary) !important;
}

/* Dark input styles */
.dark-input :deep(.q-field__control) {
  background-color: var(--surface-container-high) !important;
  box-shadow: none !important;
  height: 48px !important;
  align-items: center !important;
}

.dark-input :deep(.q-field__native) {
  color: var(--on-surface) !important;
  -webkit-text-fill-color: var(--on-surface) !important;
  outline: none !important;
  box-shadow: none !important;
}

.dark-input :deep(.q-field__native:focus) {
  outline: none !important;
  box-shadow: none !important;
}

.dark-input :deep(.q-field__label) {
  color: var(--on-surface-variant) !important;
}

/* Quitar bordes - :before es el borde base, ::after es el borde de focus */
.dark-input :deep(.q-field__control:before) {
  border: none !important;
}

.dark-input :deep(.q-field__control::after) {
  border: none !important;
}

/* Fix padding for labeled inputs - Quasar aplica 24px padding-top por defecto */
.dark-input.q-field--labeled :deep(.q-field__native),
.dark-input.q-field--labeled :deep(.q-field__prefix),
.dark-input.q-field--labeled :deep(.q-field__suffix) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  line-height: 1.2 !important;
}

.dark-input.q-field--disabled :deep(.q-field__control),
.dark-input.q-field--readonly :deep(.q-field__control) {
  background-color: var(--surface-container-high) !important;
  opacity: 1 !important;
}

.dark-input.q-field--disabled :deep(.q-field__native),
.dark-input.q-field--readonly :deep(.q-field__native) {
  color: var(--on-surface) !important;
  -webkit-text-fill-color: var(--on-surface) !important;
  opacity: 1 !important;
}

.dark-input.q-field--disabled :deep(.q-field__label),
.dark-input.q-field--readonly :deep(.q-field__label) {
  color: var(--on-surface-variant) !important;
  opacity: 1 !important;
}

.dialog-card .q-select__dropdown-icon,
.dialog-card .q-field__append .q-icon {
  color: var(--on-surface-variant) !important;
}

/* Menu dropdown del select */
.q-menu .q-item,
.q-menu .q-item__label,
.q-menu .q-virtual-scroll__content,
.q-menu .q-item__section--main {
  color: var(--on-surface) !important;
  background-color: var(--surface-container) !important;
}

.q-menu .q-item--active,
.q-menu .q-item:hover,
.q-menu .q-item--selected {
  background-color: var(--primary) !important;
  color: var(--on-primary) !important;
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
