<template>
  <q-layout view="hHh lpR fFf" class="main-layout">
    <!-- Sidebar -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="sidebar"
    >
      <div class="sidebar-content">
        <!-- Logo -->
        <div class="logo-section">
          <span class="material-symbols-outlined logo-icon">account_balance</span>
          <h1 class="logo-text">Censos Veredales</h1>
        </div>

        <!-- User Profile -->
        <div class="user-profile">
          <div class="avatar-container">
            <q-avatar size="40px" color="surface-container-highest" text-color="on-surface">
              <span class="material-symbols-outlined">person</span>
            </q-avatar>
          </div>
          <div class="user-info">
            <p class="user-name">{{ authStore.user?.fullName || 'Usuario' }}</p>
            <p class="user-role">{{ getRoleLabel(authStore.userRole) }}</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="nav-list">
          <template v-if="isAdmin">
            <q-item
              clickable
              v-ripple
              :to="presidentDashboardRoute"
              exact
              class="nav-item"
            >
              <q-item-section avatar>
                <span class="material-symbols-outlined">dashboard</span>
              </q-item-section>
              <q-item-section>
                <q-item-label>Dashboard</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator class="nav-separator" />

            <q-item-label header class="nav-header">Gestión</q-item-label>

            <q-item
              clickable
              v-ripple
              :to="{ name: 'CommunityList' }"
              v-if="hasPermission('community', 'read')"
              class="nav-item"
            >
              <q-item-section avatar>
                <span class="material-symbols-outlined">location_city</span>
              </q-item-section>
              <q-item-section>
                <q-item-label>Comunidades</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :to="{ name: 'DwellingList' }"
              v-if="hasPermission('dwelling', 'read')"
              class="nav-item"
            >
              <q-item-section avatar>
                <span class="material-symbols-outlined">home</span>
              </q-item-section>
              <q-item-section>
                <q-item-label>Viviendas</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :to="{ name: 'ResidentList' }"
              v-if="hasPermission('resident', 'read')"
              class="nav-item"
            >
              <q-item-section avatar>
                <span class="material-symbols-outlined">people</span>
              </q-item-section>
              <q-item-section>
                <q-item-label>Residentes</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :to="{ name: 'LetterList' }"
              v-if="hasPermission('letter', 'read')"
              class="nav-item"
            >
              <q-item-section avatar>
                <span class="material-symbols-outlined">description</span>
              </q-item-section>
              <q-item-section>
                <q-item-label>Cartas</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :to="{ name: 'AnnouncementList' }"
              v-if="hasPermission('announcement', 'read')"
              class="nav-item"
            >
              <q-item-section avatar>
                <span class="material-symbols-outlined">campaign</span>
              </q-item-section>
              <q-item-section>
                <q-item-label>Anuncios</q-item-label>
              </q-item-section>
            </q-item>

            <!-- Presidente o roles con permisos específicos -->
            <q-separator class="nav-separator" />

            <q-item-label header class="nav-header">Administración</q-item-label>

            <q-item
              clickable
              v-ripple
              :to="{ name: 'UserList' }"
              v-if="hasPermission('user', 'read')"
              class="nav-item"
            >
              <q-item-section avatar>
                <span class="material-symbols-outlined">group</span>
              </q-item-section>
              <q-item-section>
                <q-item-label>Usuarios</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :to="{ name: 'PresidentRoleManagement' }"
              v-if="hasPermission('user', 'manageRoles')"
              class="nav-item"
            >
              <q-item-section avatar>
                <span class="material-symbols-outlined">badge</span>
              </q-item-section>
              <q-item-section>
                <q-item-label>Roles y Permisos</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :to="{ name: 'PresidentQRScanner' }"
              v-if="hasPermission('letter', 'qrScan')"
              class="nav-item"
            >
              <q-item-section avatar>
                <span class="material-symbols-outlined">qr_code_scanner</span>
              </q-item-section>
              <q-item-section>
                <q-item-label>Escáner QR</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator class="nav-separator" />

          </template>

          <template v-else>
            <q-item
              clickable
              v-ripple
              :to="{ name: 'ResidentDashboard' }"
              exact
              class="nav-item"
            >
              <q-item-section avatar>
                <span class="material-symbols-outlined">dashboard</span>
              </q-item-section>
              <q-item-section>
                <q-item-label>Mi Panel</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator class="nav-separator" />

            <q-item
              clickable
              v-ripple
              :to="{ name: 'MyLetters' }"
              class="nav-item"
            >
              <q-item-section avatar>
                <span class="material-symbols-outlined">description</span>
              </q-item-section>
              <q-item-section>
                <q-item-label>Mis Cartas</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :to="{ name: 'ResidentAnnouncementList' }"
              class="nav-item"
            >
              <q-item-section avatar>
                <span class="material-symbols-outlined">campaign</span>
              </q-item-section>
              <q-item-section>
                <q-item-label>Anuncios</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :to="{ name: 'UserProfile' }"
              class="nav-item"
            >
              <q-item-section avatar>
                <span class="material-symbols-outlined">person</span>
              </q-item-section>
              <q-item-section>
                <q-item-label>Mi Perfil</q-item-label>
              </q-item-section>
            </q-item>
          </template>

          <q-separator class="nav-separator" />

          <q-item
            clickable
            v-ripple
            @click="handleLogout"
            class="nav-item logout-item"
          >
            <q-item-section avatar>
              <span class="material-symbols-outlined">logout</span>
            </q-item-section>
            <q-item-section>
              <q-item-label>Cerrar sesión</q-item-label>
            </q-item-section>
          </q-item>
        </nav>
      </div>
    </q-drawer>

    <!-- Header -->
    <q-header elevated class="header">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Abrir menú de navegación"
          @click="toggleLeftDrawer"
          class="mobile-menu-btn"
        />

        <q-toolbar-title>
          <h2 class="page-title">{{ pageTitle }}</h2>
        </q-toolbar-title>

        <div class="header-actions">
          <q-btn
            flat
            round
            icon="notifications"
            @click="showNotifications = !showNotifications"
            aria-label="Notificaciones"
            :aria-busy="hasNotifications"
          >
            <q-badge color="red" floating v-if="hasNotifications">
              {{ notificationCount }}
            </q-badge>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Main Page -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const authStore = useAuthStore()

const leftDrawerOpen = ref(false)
const showNotifications = ref(false)

// Variables para notificaciones (pendientes de implementar)
const hasNotifications = ref(false)
const notificationCount = ref(0)

// Rol admin: presidente, tesorero o secretario
const isAdmin = computed(() => {
  return authStore.isPresident || authStore.isTreasurer || authStore.isSecretary
})

// Verificar permisos usando el getter del store
const hasPermission = (module, action) => {
  return authStore.hasPermission(module, action)
}

// Verificar si tiene acceso al dashboard de admin (requiere dashboard:access)
const hasDashboardAccess = computed(() => {
  return authStore.isPresident || hasPermission('dashboard', 'access')
})

const presidentDashboardRoute = computed(() => {
  return authStore.isPresident
    ? { name: 'PresidentDashboard' }
    : { name: 'AdminDashboard' }
})

const pageTitle = computed(() => {
  const titles = {
    AdminDashboard: 'Dashboard',
    PresidentDashboard: 'Dashboard del Presidente',
    CommunityList: 'Comunidades',
    CommunityDetail: 'Detalle de Comunidad',
    CommunityCreate: 'Nueva Comunidad',
    CommunityEdit: 'Editar Comunidad',
    DwellingList: 'Viviendas',
    DwellingDetail: 'Detalle de Vivienda',
    DwellingCreate: 'Nueva Vivienda',
    DwellingEdit: 'Editar Vivienda',
    ResidentList: 'Residentes',
    ResidentDetail: 'Detalle de Residente',
    ResidentCreate: 'Nuevo Residente',
    ResidentEdit: 'Editar Residente',
    LetterList: 'Cartas',
    LetterDetail: 'Detalle de Carta',
    LetterVerify: 'Verificar Carta',
    AnnouncementList: 'Anuncios',
    AnnouncementDetail: 'Detalle de Anuncio',
    AnnouncementCreate: 'Nuevo Anuncio',
    AnnouncementEdit: 'Editar Anuncio',
    UserList: 'Usuarios',
    UserDetail: 'Detalle de Usuario',
    PresidentApprovals: 'Aprobaciones',
    PresidentRoleManagement: 'Roles y Permisos',
    PresidentQRScanner: 'Escáner QR',
    PresidentAuditLogs: 'Registro de Auditoría',
    ResidentDashboard: 'Mi Panel',
    MyLetters: 'Mis Cartas',
    LetterRequest: 'Solicitar Carta',
    ResidentAnnouncementList: 'Anuncios',
    ResidentAnnouncementDetail: 'Detalle de Anuncio',
    UserProfile: 'Mi Perfil'
  }
  return titles[route.name] || 'Censos Veredales'
})

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const getRoleLabel = (role) => {
  const labels = {
    president: 'Presidente',
    tesorero: 'Tesorero',
    secretario: 'Secretario',
    residente: 'Residente',
    censista: 'Censista'
  }
  return labels[role] || 'Usuario'
}

const handleLogout = async () => {
  $q.dialog({
    title: 'Cerrar sesión',
    message: '¿Estás seguro de que deseas cerrar sesión?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await authStore.logout()
    router.push('/login')
  })
}
</script>

<style scoped>
.main-layout {
  background: var(--surface);
}

/* Sidebar */
.sidebar {
  background: var(--surface);
  width: 280px;
}

@media (max-width: 1023px) {
  .sidebar {
    width: 260px;
  }
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px 16px;
}

@media (max-width: 599px) {
  .sidebar-content {
    padding: 16px 12px;
  }
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
  margin-bottom: 8px;
}

.logo-icon {
  font-size: 32px;
  color: var(--primary);
}

.logo-text {
  font-size: 18px;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: -0.02em;
  margin: 0;
}

@media (max-width: 599px) {
  .logo-section {
    padding: 16px 12px;
    gap: 8px;
  }

  .logo-icon {
    font-size: 28px;
  }

  .logo-text {
    font-size: 16px;
  }
}

/* User Profile */
.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  margin-bottom: 16px;
  background: var(--surface-container-lowest);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.avatar-container {
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 11px;
  color: var(--outline);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 2px 0 0 0;
}

@media (max-width: 599px) {
  .user-profile {
    padding: 12px;
    gap: 8px;
  }

  .user-name {
    font-size: 13px;
  }

  .user-role {
    font-size: 10px;
  }
}

/* Navigation */
.nav-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.nav-header {
  font-size: 11px;
  font-weight: 700;
  color: var(--outline);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 16px 12px 8px;
  margin: 0;
}

.nav-separator {
  margin: 12px 0;
  background: var(--surface-container-highest);
}

.nav-item {
  border-radius: 10px;
  margin: 2px 4px;
  padding: 12px 16px;
  transition: all 0.15s;
}

.nav-item:hover {
  background: var(--primary-fixed);
}

.nav-item--active {
  background: var(--surface-container-lowest);
  box-shadow: 0 2px 8px rgba(0, 40, 142, 0.12);
}

.nav-item--active .material-symbols-outlined,
.nav-item--active q-item-label {
  color: var(--primary);
}

.nav-item .material-symbols-outlined {
  color: var(--outline);
  font-size: 22px;
}

.nav-item q-item-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--on-surface-variant);
}

@media (max-width: 599px) {
  .nav-item {
    padding: 10px 12px;
    margin: 2px;
  }

  .nav-item .material-symbols-outlined {
    font-size: 20px;
  }

  .nav-item q-item-label {
    font-size: 13px;
  }

  .nav-header {
    padding: 12px 8px 6px;
    font-size: 10px;
  }
}

.logout-item {
  margin-top: auto;
}

.logout-item .material-symbols-outlined {
  color: var(--error);
}

.logout-item q-item-label {
  color: var(--error);
  font-weight: 600;
}

/* Header */
.header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--surface-container-highest);
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: -0.01em;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-menu-btn {
  display: none;
  color: var(--on-surface) !important;
}

.mobile-menu-btn .material-icons {
  color: var(--on-surface) !important;
}

@media (max-width: 1023px) {
  .mobile-menu-btn {
    display: inline-flex;
  }
}

@media (max-width: 599px) {
  .page-title {
    font-size: 16px;
  }

  .header-actions {
    gap: 4px;
  }
}

/* Deep styling for Quasar components */
:deep(.q-drawer) {
  border-right: none;
}

:deep(.q-header),
:deep(.q-header .q-toolbar) {
  height: 64px !important;
  min-height: 64px !important;
}

:deep(.q-toolbar) {
  padding: 0 16px !important;
}

:deep(.q-toolbar .q-btn) {
  width: 40px !important;
  height: 40px !important;
  min-height: 40px !important;
}

:deep(.q-toolbar .q-btn .q-icon) {
  font-size: 24px !important;
}

:deep(.q-toolbar-title) {
  font-size: 18px !important;
  font-weight: 600 !important;
}

@media (max-width: 599px) {
  :deep(.q-header),
  :deep(.q-header .q-toolbar) {
    height: 56px !important;
    min-height: 56px !important;
  }

  :deep(.q-toolbar) {
    padding: 0 12px !important;
  }

  :deep(.q-toolbar .q-btn) {
    width: 36px !important;
    height: 36px !important;
    min-height: 36px !important;
  }

  :deep(.q-toolbar .q-btn .q-icon) {
    font-size: 22px !important;
  }

  :deep(.q-toolbar-title) {
    font-size: 16px !important;
  }
}

:deep(.q-item) {
  min-height: 44px;
}

:deep(.q-badge) {
  font-size: 10px;
  padding: 2px 6px;
}

@media (max-width: 599px) {
  :deep(.q-header),
  :deep(.q-header .q-toolbar) {
    height: 52px !important;
    min-height: 52px !important;
  }

  :deep(.q-toolbar) {
    padding: 0 12px !important;
  }

  :deep(.q-toolbar .q-btn) {
    width: 36px !important;
    height: 36px !important;
    min-height: 36px !important;
  }

  :deep(.q-toolbar .q-btn .q-icon) {
    font-size: 22px !important;
  }

  :deep(.q-toolbar-title) {
    font-size: 16px !important;
  }
}
</style>
