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
              :to="{ name: 'AdminDashboard' }"
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
              v-if="authStore.isPresident"
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
              class="nav-item"
            >
              <q-item-section avatar>
                <span class="material-symbols-outlined">campaign</span>
              </q-item-section>
              <q-item-section>
                <q-item-label>Anuncios</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator class="nav-separator" />

            <q-item-label header class="nav-header">Administración</q-item-label>

            <q-item
              clickable
              v-ripple
              :to="{ name: 'UserList' }"
              v-if="authStore.isPresident"
              class="nav-item"
            >
              <q-item-section avatar>
                <span class="material-symbols-outlined">group</span>
              </q-item-section>
              <q-item-section>
                <q-item-label>Usuarios</q-item-label>
              </q-item-section>
            </q-item>
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
          aria-label="Menu"
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
const hasNotifications = ref(false)
const notificationCount = ref(0)

const isAdmin = computed(() => {
  return authStore.isPresident || authStore.isTreasurer || authStore.isSecretary
})

const pageTitle = computed(() => {
  const titles = {
    AdminDashboard: 'Dashboard',
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

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px 16px;
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
}

@media (max-width: 1023px) {
  .mobile-menu-btn {
    display: inline-flex;
  }
}

/* Deep styling for Quasar components */
:deep(.q-drawer) {
  border-right: none;
}

:deep(.q-toolbar) {
  min-height: 64px;
  padding: 0 24px;
}

:deep(.q-item) {
  min-height: 44px;
}

:deep(.q-badge) {
  font-size: 10px;
  padding: 2px 6px;
}
</style>
