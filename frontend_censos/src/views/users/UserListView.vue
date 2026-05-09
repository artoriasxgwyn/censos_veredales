<template>
  <div class="page">
    <div class="page-content">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <p class="page-subtitle">Administración de Usuarios</p>
          <h1 class="page-title">Usuarios</h1>
          <p class="page-description">Gestione los usuarios del sistema</p>
        </div>
        <q-btn
          v-if="canCreateUser"
          color="primary"
          label="Nuevo Usuario"
          icon="add"
          @click="showCreateUser = true"
        />
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="search-box">
          <span class="material-symbols-outlined">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre o email..."
            class="search-input"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="filter-chips">
          <button
            v-for="option in roleOptions"
            :key="option.value"
            :class="['filter-chip', { active: roleFilter === option.value }]"
            @click="roleFilter = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Users List -->
      <div class="users-section" v-if="!userStore.loading">
        <div class="users-grid">
          <div
            v-for="user in filteredUsers"
            :key="user._id"
            class="user-card"
            @click="router.push(`/admin/users/${user._id}`)"
          >
            <div class="user-avatar">
              <span class="material-symbols-outlined">person</span>
            </div>
            <div class="user-info">
              <h3 class="user-name">{{ user.fullName }}</h3>
              <p class="user-email">{{ user.email }}</p>
              <div class="user-roles">
                <span
                  v-if="user.role"
                  class="role-badge"
                  :class="user.role"
                >
                  {{ getRoleLabel(user.role) }}
                </span>
              </div>
            </div>
            <span class="material-symbols-outlined chevron">chevron_right</span>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredUsers.length === 0" class="empty-state">
          <div class="empty-icon">
            <span class="material-symbols-outlined">group</span>
          </div>
          <h3 class="empty-title">No hay usuarios registrados</h3>
          <p class="empty-description">Los usuarios creados aparecerán aquí</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="loading-state">
        <q-spinner color="primary" size="48px" />
        <p>Cargando usuarios...</p>
      </div>

      <!-- Create User Dialog -->
      <q-dialog v-model="showCreateUser" persistent>
        <q-card class="dialog-card">
          <q-card-section>
            <div class="dialog-header">
              <h4 class="dialog-title">Nuevo Usuario</h4>
            </div>

            <div class="form-grid">
              <q-input
                v-model="newUser.fullName"
                label="Nombre Completo"
                outlined
                dense
                dark
                class="dark-input"
              >
                <template v-slot:prepend>
                  <span class="material-symbols-outlined">person</span>
                </template>
              </q-input>

              <q-input
                v-model="newUser.documentNumber"
                label="Cédula"
                outlined
                dense
                dark
                class="dark-input"
              >
                <template v-slot:prepend>
                  <span class="material-symbols-outlined">badge</span>
                </template>
              </q-input>

              <q-input
                v-model="newUser.email"
                label="Email"
                type="email"
                outlined
                dense
                dark
                class="dark-input"
              >
                <template v-slot:prepend>
                  <span class="material-symbols-outlined">email</span>
                </template>
              </q-input>

              <q-input
                v-model="newUser.phone"
                label="Teléfono"
                outlined
                dense
                dark
                class="dark-input"
              >
                <template v-slot:prepend>
                  <span class="material-symbols-outlined">phone</span>
                </template>
              </q-input>

              <q-input
                v-model="newUser.birthDate"
                label="Fecha de Nacimiento"
                type="date"
                outlined
                dense
                dark
                class="dark-input"
              >
                <template v-slot:prepend>
                  <span class="material-symbols-outlined">calendar_today</span>
                </template>
              </q-input>

              <q-input
                v-model="newUser.password"
                label="Contraseña"
                type="password"
                outlined
                dense
                dark
                class="dark-input"
              >
                <template v-slot:prepend>
                  <span class="material-symbols-outlined">lock</span>
                </template>
              </q-input>
            </div>

            <!-- Firma Digital -->
            <div class="signature-section">
              <h5 class="signature-title">Firma Digital <span class="required">*</span></h5>
              <SignaturePad v-model="newUser.signature" />
              <p class="hint" style="margin-top: 8px;">
                <span class="material-symbols-outlined">info</span>
                La firma es obligatoria para todos los usuarios de la comunidad.
              </p>
            </div>

            <p class="hint">
              <span class="material-symbols-outlined">info</span>
              El usuario se creará activo inmediatamente en tu comunidad. Podrás asignarle un rol después desde el detalle del usuario.
            </p>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Cancelar"
              @click="cancelCreate"
              v-close-popup
            />
            <q-btn
              color="primary"
              label="Crear Usuario"
              @click="handleCreateUser"
              :loading="saving"
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
import { useUserStore } from '@/stores/user.store'
import { useAuthStore } from '@/stores/auth.store'
import SignaturePad from '@/components/SignaturePad.vue'
import { userService } from '@/services/user.service'

const router = useRouter()
const $q = useQuasar()
const userStore = useUserStore()
const authStore = useAuthStore()

const searchQuery = ref('')
const roleFilter = ref('all')
const roleOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Presidente', value: 'president' },
  { label: 'Tesorero', value: 'tesorero' },
  { label: 'Secretario', value: 'secretario' },
  { label: 'Residente', value: 'residente' },
  { label: 'Censista', value: 'censista' }
]

const filteredUsers = computed(() => {
  let result = userStore.users

  if (roleFilter.value !== 'all') {
    result = result.filter(u => u.role === roleFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(u =>
      u.fullName?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query)
    )
  }

  return result
})

const canCreateUser = computed(() => {
  // Presidente tiene todos los permisos
  if (authStore.isPresident) return true
  // Verificar permiso user.create
  return authStore.hasPermission('user', 'create')
})

const showCreateUser = ref(false)
const saving = ref(false)
const newUser = ref({
  fullName: '',
  documentNumber: '',
  email: '',
  phone: '',
  birthDate: '',
  password: '',
  signature: ''
})

const cancelCreate = () => {
  showCreateUser.value = false
  newUser.value = {
    fullName: '',
    documentNumber: '',
    email: '',
    phone: '',
    birthDate: '',
    password: '',
    signature: ''
  }
}

const handleCreateUser = async () => {
  // Validar nombre completo
  if (!newUser.value.fullName?.trim()) {
    $q.notify({
      type: 'warning',
      message: 'El nombre completo es requerido',
      timeout: 4000
    })
    return
  }

  // Validar cédula (10 dígitos exactamente)
  const cedulaTrimmed = newUser.value.documentNumber?.trim() || ''
  if (!cedulaTrimmed) {
    $q.notify({
      type: 'warning',
      message: 'La cédula es requerida',
      timeout: 4000
    })
    return
  }
  // Solo verificar que sean exactamente 10 dígitos numéricos
  const cedulaRegex = /^\d{10}$/
  if (!cedulaRegex.test(cedulaTrimmed)) {
    $q.notify({
      type: 'warning',
      message: 'La cédula debe tener exactamente 10 dígitos numéricos',
      caption: `Ingresaste ${cedulaTrimmed.length} dígitos. Ejemplo: 1234567890`,
      timeout: 5000
    })
    return
  }

  // Validar email
  if (!newUser.value.email?.trim()) {
    $q.notify({
      type: 'warning',
      message: 'El email es requerido',
      timeout: 4000
    })
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(newUser.value.email.trim())) {
    $q.notify({
      type: 'warning',
      message: 'El email no es válido',
      caption: 'Ejemplo: usuario@ejemplo.com',
      timeout: 5000
    })
    return
  }

  // Validar teléfono (opcional pero si se proporciona, debe ser válido)
  if (newUser.value.phone?.trim()) {
    const phoneRegex = /^\d{10,11}$/
    if (!phoneRegex.test(newUser.value.phone.trim())) {
      $q.notify({
        type: 'warning',
        message: 'El teléfono debe tener 10 o 11 dígitos numéricos',
        timeout: 4000
      })
      return
    }
  }

  // Validar contraseña (mínimo 6 caracteres)
  if (!newUser.value.password) {
    $q.notify({
      type: 'warning',
      message: 'La contraseña es requerida',
      timeout: 4000
    })
    return
  }
  if (newUser.value.password.length < 6) {
    $q.notify({
      type: 'warning',
      message: 'La contraseña debe tener al menos 6 caracteres',
      timeout: 4000
    })
    return
  }

  // Validar firma digital (obligatoria)
  if (!newUser.value.signature) {
    $q.notify({
      type: 'warning',
      message: 'La firma digital es obligatoria',
      caption: 'Por favor dibuja tu firma en el recuadro correspondiente',
      timeout: 5000
    })
    return
  }

  saving.value = true

  try {
    // Crear usuario sin firma primero
    const userData = {
      fullName: newUser.value.fullName,
      documentNumber: newUser.value.documentNumber,
      email: newUser.value.email,
      phone: newUser.value.phone,
      birthDate: newUser.value.birthDate,
      password: newUser.value.password
    }

    const result = await userStore.createUser(userData)

    if (result.success) {
      const userId = result.data._id

      // Si hay firma, subirla después de crear el usuario
      if (newUser.value.signature) {
        try {
          await userService.uploadSignature(userId, newUser.value.signature)
        } catch (signatureError) {
          console.error('Error al subir firma:', signatureError)
          // No fallar el proceso, solo loguear el error
        }
      }

      $q.notify({
        type: 'positive',
        message: 'Usuario creado exitosamente',
        caption: newUser.value.signature
          ? 'El usuario ya puede iniciar sesión con su firma guardada'
          : 'El usuario ya puede iniciar sesión',
        timeout: 4000
      })
      showCreateUser.value = false
      cancelCreate()
      await userStore.fetchUsers()
    } else {
      throw new Error(result.message)
    }
  } catch (error) {
    const errorMsg = error.message || ''

    if (errorMsg.toLowerCase().includes('email') || errorMsg.toLowerCase().includes('duplicado')) {
      $q.notify({
        type: 'negative',
        message: 'El email ya está registrado',
        caption: 'Usa un email diferente',
        timeout: 4000
      })
    } else if (errorMsg.toLowerCase().includes('ya existe') || errorMsg.toLowerCase().includes('rol')) {
      $q.notify({
        type: 'negative',
        message: 'No se puede crear el usuario',
        caption: errorMsg,
        timeout: 5000
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Error al crear usuario',
        caption: errorMsg,
        timeout: 5000
      })
    }
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  // Verificar permiso para ver usuarios
  if (!authStore.hasPermission('user', 'read')) {
    $q.notify({
      type: 'negative',
      message: 'Acceso denegado. No tienes permisos para ver usuarios.'
    })
    router.push('/admin/dashboard')
    return
  }

  await userStore.fetchUsers()
})

const getRoleLabel = (role) => {
  const labels = {
    president: 'Presidente',
    treasurer: 'Tesorero',
    secretary: 'Secretario',
    residente: 'Residente',
    censista: 'Censista'
  }
  return labels[role] || role
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

@media (max-width: 599px) {
  .page-content {
    padding: 16px;
  }
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

@media (max-width: 599px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;
    gap: 16px;
  }
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

@media (max-width: 599px) {
  .page-subtitle {
    font-size: 10px;
  }

  .page-title {
    font-size: 28px;
  }

  .page-description {
    font-size: 14px;
  }
}

/* Filters */
.filters-section {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box .material-symbols-outlined {
  position: absolute;
  left: 16px;
  color: var(--outline);
  font-size: 20px;
}

.search-input {
  width: 100%;
  padding: 14px 44px 14px 48px;
  background: var(--surface);
  border: 1px solid var(--surface-container-highest);
  border-radius: 12px;
  font-size: 14px;
  color: var(--on-surface);
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-50);
}

.search-input::placeholder {
  color: var(--outline);
}

.clear-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn .material-symbols-outlined {
  font-size: 18px;
  color: var(--outline);
}

.filter-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 8px 16px;
  background: var(--surface);
  border: 1px solid var(--surface-container-highest);
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip:hover {
  background: var(--primary-50);
  border-color: var(--primary);
}

.filter-chip.active {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--on-primary);
}

/* Users Section */
.users-section {
  background: #1e293b;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid #475569;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

@media (max-width: 599px) {
  .users-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #0f172a;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #475569;
}

@media (max-width: 599px) {
  .user-card {
    padding: 16px;
    gap: 12px;
  }

  .user-card:hover {
    transform: none;
  }
}

.user-card:hover {
  background: #334155;
  border-color: #3b82f6;
  transform: translateX(4px);
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar .material-symbols-outlined {
  font-size: 28px;
  color: var(--on-primary);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 16px;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 13px;
  color: #94a3b8;
  margin: 0 0 10px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.role-badge {
  padding: 4px 10px;
  background: #475569;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-badge.president { background: #3b82f6; color: #ffffff; }
.role-badge.treasurer { background: #60a5fa; color: #0f172a; }
.role-badge.secretary { background: #34d399; color: #064e3b; }
.role-badge.residente { background: #10b981; color: #ffffff; }
.role-badge.censista { background: #f59e0b; color: #78350f; }

.chevron {
  color: #94a3b8;
  font-size: 24px;
  flex-shrink: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--primary-50);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-icon .material-symbols-outlined {
  font-size: 40px;
  color: var(--primary);
}

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0 0 24px 0;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-state p {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin-top: 16px;
}

/* Dialog */
.dialog-card {
  border-radius: 16px !important;
  max-width: 550px;
  width: 100%;
  background: var(--surface-container-lowest) !important;
}

.dialog-card :deep(.q-card__section) {
  background: var(--surface-container-lowest) !important;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dialog-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* Dark input styles - TODOS los inputs iguales */
.dark-input :deep(.q-field__control) {
  background: #2a2d35 !important;
  border-radius: 8px !important;
  min-height: 42px !important;
}

/* Input nativo - forzar transparente y texto blanco */
.dark-input :deep(input) {
  background: transparent !important;
  color: white !important;
  -webkit-text-fill-color: white !important;
  caret-color: white !important;
}

/* Chrome Autofill - EL VERDADERO BUG */
.dark-input :deep(input:-webkit-autofill),
.dark-input :deep(input:-webkit-autofill:hover),
.dark-input :deep(input:-webkit-autofill:focus) {
  -webkit-box-shadow: 0 0 0 1000px #2a2d35 inset !important;
  -webkit-text-fill-color: white !important;
  transition: background-color 9999s ease-in-out 0s;
}

/* Date input - color-scheme dark para el picker */
.dark-input :deep(input[type="date"]) {
  color-scheme: dark;
  background: transparent !important;
  color: white !important;
}

.dark-input :deep(input[type="date"])::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

/* Password input */
.dark-input :deep(input[type="password"]) {
  -webkit-text-fill-color: white !important;
  color: white !important;
}

/* Labels */
.dark-input :deep(.q-field__label) {
  color: #9ca3af !important;
  font-size: 12px;
}

/* Bordes */
.dark-input :deep(.q-field__control:before) {
  border: none !important;
}

.dark-input :deep(.q-field__control::after) {
  border: 1px solid var(--primary) !important;
}

/* Iconos prepend/append */
.dark-input :deep(.q-field__prepend) {
  color: #9ca3af !important;
}

.dark-input :deep(.q-field__append) {
  color: #9ca3af !important;
}

/* Select dropdown */
:deep(.q-menu) {
  background: #2a2d35 !important;
}

:deep(.q-item) {
  color: white !important;
}

:deep(.q-item:hover) {
  background: #374151 !important;
}

:deep(.q-item--active) {
  background: var(--primary) !important;
  color: white !important;
}

/* Select dropdown */
:deep(.q-menu) {
  background-color: var(--surface-container) !important;
}

:deep(.q-item) {
  color: var(--on-surface) !important;
}

:deep(.q-item:hover) {
  background-color: var(--surface-container-high) !important;
}

:deep(.q-item--active) {
  background-color: var(--primary) !important;
  color: var(--on-primary) !important;
}

.hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--on-surface-variant);
  background: var(--surface-container);
  padding: 10px 14px;
  border-radius: 8px;
  margin-top: 12px;
}

.hint .material-symbols-outlined {
  font-size: 16px;
  color: var(--primary);
}

.signature-section {
  margin-top: 16px;
  padding: 16px;
  background: var(--surface-container);
  border-radius: 8px;
  border: 1px solid var(--surface-container-highest);
}

.signature-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 12px 0;
}

.signature-title .required {
  color: var(--error);
  font-size: 16px;
  margin-left: 4px;
}
</style>
