<template>
  <div class="dashboard-page">
    <div class="dashboard-content">
      <!-- Page Header -->
      <div class="page-header">
        <p class="page-subtitle">Panel Personal</p>
        <h1 class="page-title">Bienvenido, {{ userName }}</h1>
        <p class="page-description">{{ seniorityMessage }}</p>
      </div>

      <!-- Mensaje de antigüedad -->
      <section class="seniority-section">
        <div class="seniority-card">
          <span class="material-symbols-outlined seniority-icon">calendar_month</span>
          <div class="seniority-content">
            <h3 class="seniority-title">{{ seniorityTitle }}</h3>
            <p class="seniority-description">{{ seniorityDescription }}</p>
          </div>
        </div>
      </section>

      <!-- Mis Trámites -->
      <section class="my-requests-section">
        <div class="section-header">
          <span class="material-symbols-outlined">assignment</span>
          <h2 class="section-title">Mis Trámites</h2>
        </div>

        <div class="requests-grid">
          <q-card class="request-card" @click="router.push('/resident/letters')">
            <div class="request-icon primary">
              <span class="material-symbols-outlined">description</span>
            </div>
            <div class="request-content">
              <div class="request-label">Cartas</div>
              <div class="request-count">{{ letterStore.letterCount || 0 }}</div>
              <div class="request-status" v-if="letterStore.pendingLetters?.length > 0">
                <q-badge color="warning">{{ letterStore.pendingLetters.length }} pendientes</q-badge>
              </div>
            </div>
            <span class="material-symbols-outlined chevron">chevron_right</span>
          </q-card>

          <q-card class="request-card" @click="router.push('/resident/my-dwelling')">
            <div class="request-icon secondary">
              <span class="material-symbols-outlined">home</span>
            </div>
            <div class="request-content">
              <div class="request-label">Mi Vivienda</div>
              <div class="request-status-text">{{ dwellingInfo || 'Sin vivienda registrada' }}</div>
            </div>
            <span class="material-symbols-outlined chevron">chevron_right</span>
          </q-card>

          <q-card class="request-card" @click="router.push('/resident/profile')">
            <div class="request-icon tertiary">
              <span class="material-symbols-outlined">person</span>
            </div>
            <div class="request-content">
              <div class="request-label">Mi Estado</div>
              <div class="request-status-text">Ver información</div>
            </div>
            <span class="material-symbols-outlined chevron">chevron_right</span>
          </q-card>
        </div>
      </section>

      <!-- Últimas Cartas Solicitadas -->
      <section v-if="recentLetters.length > 0" class="recent-letters-section">
        <div class="section-header">
          <span class="material-symbols-outlined">description</span>
          <h2 class="section-title">Últimas Cartas</h2>
        </div>

        <div class="letters-list">
          <div
            v-for="letter in recentLetters"
            :key="letter._id"
            class="letter-item"
            @click="router.push(`/resident/letters/${letter._id}`)"
          >
            <div class="letter-info">
              <span class="material-symbols-outlined letter-icon">mail</span>
              <div class="letter-details">
                <p class="letter-name">Carta {{ letter.type }}</p>
                <p class="letter-date">{{ formatDate(letter.createdAt) }}</p>
              </div>
            </div>
            <q-badge :color="getStatusColor(letter.status)" class="status-badge">
              {{ letter.status }}
            </q-badge>
          </div>
        </div>
      </section>

      <!-- Mi Vivienda Card -->
      <section v-if="myDwelling" class="dwelling-detail-section">
        <div class="section-header">
          <span class="material-symbols-outlined">home</span>
          <h2 class="section-title">Mi Vivienda</h2>
        </div>

        <div class="dwelling-detail-card">
          <div class="dwelling-image" v-if="myDwelling.facadeImage">
            <img :src="myDwelling.facadeImage" alt="Fachada de la vivienda" class="dwelling-photo" />
          </div>
          <div class="dwelling-image" v-else>
            <span class="material-symbols-outlined no-image-icon">home</span>
          </div>
          <div class="dwelling-info">
            <h3 class="dwelling-nomenclature">{{ myDwelling.houseNomenclature || 'Sin nomenclatura' }}</h3>
            <p class="dwelling-arrival" v-if="myDwelling.arrivalInstructions">
              <span class="material-symbols-outlined">directions</span>
              {{ myDwelling.arrivalInstructions }}
            </p>
            <div class="dwelling-actions">
              <q-btn
                color="primary"
                label="Ver detalles"
                @click="router.push('/resident/my-dwelling')"
                class="action-btn"
              />
              <q-btn
                v-if="isOwner"
                color="secondary"
                label="Editar"
                @click="router.push(`/admin/dwellings/${myDwelling._id}/edit`)"
                class="action-btn"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Contacto al Presidente -->
      <section class="contact-section">
        <div class="section-header">
          <span class="material-symbols-outlined">support_agent</span>
          <h2 class="section-title">¿Necesitas ayuda?</h2>
        </div>

        <div class="contact-card">
          <div class="contact-content">
            <h3 class="contact-title">Contactar al Presidente</h3>
            <p class="contact-description">Si tienes alguna duda o necesitas asistencia, puedes contactar directamente al presidente de la comunidad.</p>
          </div>
          <q-btn
            color="success"
            icon="whatsapp"
            label="Contactar por WhatsApp"
            @click="contactPresident"
            class="contact-btn"
          />
        </div>
      </section>

      <!-- Bento Layout -->
      <div class="bento-grid">
        <!-- Anuncios -->
        <section class="bento-main">
          <div class="card-header">
            <span class="material-symbols-outlined">campaign</span>
            <h2 class="card-title">Anuncios de la Comunidad</h2>
            <q-btn
              flat
              color="primary"
              label="Ver todos"
              @click="router.push('/resident/announcements')"
              class="view-all-btn"
            />
          </div>

          <div class="announcements-grid">
            <div
              v-for="announcement in recentAnnouncements"
              :key="announcement._id"
              class="announcement-card"
              @click="viewAnnouncement(announcement)"
            >
              <div class="announcement-badge" v-if="isRecent(announcement.publishedAt)">
                Nuevo
              </div>
              <h3 class="announcement-title">{{ announcement.title }}</h3>
              <p class="announcement-header">{{ announcement.header }}</p>
              <p class="announcement-body">{{ truncate(announcement.body, 100) }}</p>
              <div class="announcement-footer">
                <span class="announcement-date">{{ formatDate(announcement.publishedAt) }}</span>
              </div>
            </div>

            <div v-if="announcementStore.announcements?.length === 0" class="no-announcements">
              <span class="material-symbols-outlined">campaign</span>
              <p>No hay anuncios publicados</p>
            </div>
          </div>
        </section>

        <!-- Side Panel - Quick Actions -->
        <aside class="bento-side">
          <div class="actions-card">
            <div class="card-header">
              <span class="material-symbols-outlined">bolt</span>
              <h2 class="card-title">Acciones Rápidas</h2>
            </div>

            <div class="quick-actions-list">
              <router-link to="/resident/letters/request" class="quick-action-item" v-if="hasPermission('letter', 'generateNormal')">
                <div class="action-icon-wrapper primary">
                  <span class="material-symbols-outlined">add_circle</span>
                </div>
                <span class="action-label">Solicitar Carta</span>
              </router-link>

              <router-link to="/resident/profile" class="quick-action-item">
                <div class="action-icon-wrapper secondary">
                  <span class="material-symbols-outlined">person</span>
                </div>
                <span class="action-label">Mi Perfil</span>
              </router-link>

              <router-link to="/resident/qr-scanner" class="quick-action-item" v-if="hasPermission('letter', 'verifyQr')">
                <div class="action-icon-wrapper tertiary">
                  <span class="material-symbols-outlined">qr_code_scanner</span>
                </div>
                <span class="action-label">Escanear QR</span>
              </router-link>
            </div>
          </div>

          <!-- Status Card -->
          <div class="status-card">
            <div class="status-icon">
              <span class="material-symbols-outlined">check_circle</span>
            </div>
            <div class="status-content">
              <p class="status-text">Estado Activo</p>
              <p class="status-subtext">Residente verificado</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useDashboardStore } from '@/stores/dashboard.store'
import { useAnnouncementStore } from '@/stores/announcement.store'
import { useLetterStore } from '@/stores/letter.store'
import { useDwellingStore } from '@/stores/dwelling.store'
import { useResidentStore } from '@/stores/resident.store'

const router = useRouter()
const authStore = useAuthStore()
const dashboardStore = useDashboardStore()
const announcementStore = useAnnouncementStore()
const letterStore = useLetterStore()
const dwellingStore = useDwellingStore()
const residentStore = useResidentStore()

// Verificar permisos usando el getter del store
const hasPermission = (module, action) => {
  return authStore.hasPermission(module, action)
}

const userName = computed(() => authStore.user?.fullName || 'Residente')
const userResident = computed(() => {
  return residentStore.residents.find(r => r.userId?._id === authStore.user?.id || r.userId === authStore.user?.id)
})

// Calcular antigüedad
const seniorityInfo = computed(() => {
  if (!userResident.value?.createdAt) return { title: 'Información de residente', description: 'Tu información de residente está siendo procesada' }

  const now = new Date()
  const createdAt = new Date(userResident.value.createdAt)
  const diffMs = now - createdAt
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffYears = Math.floor(diffDays / 365)
  const diffMonths = Math.floor((diffDays % 365) / 30)
  const daysUntilSworn = 365 - (diffDays % 365)

  if (diffYears >= 1) {
    return {
      title: `Llevas ${diffYears} año${diffYears > 1 ? 's' : ''} y ${diffMonths} mese${diffMonths !== 1 ? 's' : ''} como residente`,
      description: 'Ya puedes solicitar una carta juramentada si lo necesitas.',
      canRequestSworn: true
    }
  } else {
    return {
      title: `Llevas ${diffMonths} mese${diffMonths !== 1 ? 's' : ''} y ${diffDays % 30} día${diffDays % 30 !== 1 ? 's' : ''} como residente`,
      description: `Te faltan ${daysUntilSworn} día${daysUntilSworn !== 1 ? 's' : ''} para poder solicitar la carta juramentada.`,
      canRequestSworn: false
    }
  }
})

const seniorityMessage = computed(() => seniorityInfo.value.description)
const seniorityTitle = computed(() => seniorityInfo.value.title)
const seniorityDescription = computed(() => seniorityInfo.value.description)

// Obtener vivienda del usuario desde el dashboard endpoint
const myDwelling = computed(() => {
  return dashboardStore.residentStats?.myDwelling || null
})

const dwellingInfo = computed(() => {
  if (!myDwelling.value) return 'Sin vivienda registrada'
  if (myDwelling.value.houseNomenclature) return myDwelling.value.houseNomenclature
  return 'Vivienda registrada'
})

const isOwner = computed(() => {
  if (!myDwelling.value) return false
  const currentUserId = authStore.user?.id
  return myDwelling.value.ownerUserId === currentUserId
})

const recentAnnouncements = computed(() => {
  return dashboardStore.residentStats?.recentAnnouncements?.slice(0, 5) || []
})

const recentLetters = computed(() => {
  return dashboardStore.residentStats?.recentLetters || []
})

onMounted(async () => {
  await dashboardStore.fetchResidentDashboard()
  // Mantener stores locales cargados para secciones que aún dependen de ellas
  await Promise.all([
    letterStore.fetchMyLetters(),
    dwellingStore.fetchDwellings(),
    residentStore.fetchResidents()
  ])
})

const contactPresident = () => {
  const phone = dashboardStore.residentStats?.presidentContact
  if (!phone) {
    router.push('/resident/profile')
    return
  }
  const cleanPhone = phone.replace(/\D/g, '')
  window.open(`https://wa.me/${cleanPhone}`, '_blank')
}

const isRecent = (date) => {
  if (!date) return false
  const now = new Date()
  const published = new Date(date)
  const diffDays = (now - published) / (1000 * 60 * 60 * 24)
  return diffDays <= 3
}

const truncate = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const viewAnnouncement = (announcement) => {
  router.push(`/resident/announcements/${announcement._id}`)
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    approved: 'positive',
    rejected: 'negative',
    issued: 'info'
  }
  return colors[status] || 'grey'
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: var(--surface-container-lowest);
}

.dashboard-content {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  margin-bottom: 32px;
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
  max-width: 600px;
}

/* My Requests Section */
.my-requests-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.section-header .material-symbols-outlined {
  color: var(--primary);
  font-size: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
}

/* Requests Grid */
.requests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.request-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px !important;
  border-radius: 12px !important;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(25, 28, 30, 0.04) !important;
}

.request-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(30, 64, 175, 0.12) !important;
}

.request-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.request-icon .material-symbols-outlined {
  font-size: 28px;
  color: var(--on-primary);
}

.request-icon.primary { background: var(--primary); }
.request-icon.secondary { background: var(--info); }
.request-icon.tertiary { background: var(--success); }

.request-content {
  flex: 1;
  min-width: 0;
}

.request-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--on-surface-variant);
}

.request-count {
  font-size: 24px;
  font-weight: 800;
  color: var(--on-surface);
  letter-spacing: -0.02em;
}

.request-status {
  margin-top: 4px;
}

.request-status-text {
  font-size: 13px;
  color: var(--success);
  font-weight: 500;
}

.chevron {
  color: var(--outline);
  font-size: 24px;
  flex-shrink: 0;
}

/* Bento Grid */
.bento-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }
}

/* Main Card */
.bento-main {
  background: var(--surface-container-low);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 16px 32px rgba(25, 28, 30, 0.06);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.card-header .material-symbols-outlined {
  color: var(--primary);
  font-size: 24px;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
}

.view-all-btn {
  margin-left: auto;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Announcements Grid */
.announcements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.announcement-card {
  background: var(--surface-container-lowest);
  border: 1px solid var(--surface-container-highest);
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.announcement-card:hover {
  background: var(--primary-50);
  border-color: var(--primary);
  transform: translateY(-2px);
}

.announcement-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--error);
  color: var(--on-error);
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.announcement-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 8px 0;
  padding-right: 50px;
}

.announcement-header {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  margin: 0 0 8px 0;
}

.announcement-body {
  font-size: 14px;
  color: var(--on-surface-variant);
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.announcement-footer {
  display: flex;
  justify-content: flex-end;
}

.announcement-date {
  font-size: 12px;
  color: var(--outline);
}

.no-announcements {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: var(--outline);
  grid-column: 1 / -1;
}

.no-announcements .material-symbols-outlined {
  font-size: 48px;
  margin-bottom: 12px;
  color: var(--success);
}

.no-announcements p {
  font-size: 14px;
  margin: 0;
}

/* Seniority Section */
.seniority-section {
  margin-bottom: 24px;
}

.seniority-card {
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--info-container) 100%);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  box-shadow: 0 4px 12px rgba(25, 28, 30, 0.04);
}

@media (max-width: 599px) {
  .seniority-card {
    padding: 20px;
    gap: 16px;
  }
}

.seniority-icon {
  font-size: 40px;
  color: var(--primary);
  flex-shrink: 0;
}

.seniority-content {
  flex: 1;
}

.seniority-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  margin: 0 0 8px 0;
}

.seniority-description {
  font-size: 14px;
  color: var(--on-primary-container);
  line-height: 1.6;
  margin: 0;
}

/* Dwelling Detail Section */
.dwelling-detail-section {
  margin-bottom: 24px;
}

.dwelling-detail-card {
  background: var(--surface-container-lowest);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 16px 32px rgba(25, 28, 30, 0.06);
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
  align-items: center;
}

@media (max-width: 768px) {
  .dwelling-detail-card {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.dwelling-image {
  width: 200px;
  height: 150px;
  border-radius: 10px;
  overflow: hidden;
  background: var(--surface-container);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dwelling-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image-icon {
  font-size: 64px;
  color: var(--outline);
}

.dwelling-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dwelling-nomenclature {
  font-size: 20px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
}

.dwelling-arrival {
  font-size: 14px;
  color: var(--on-surface-variant);
  line-height: 1.6;
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.dwelling-arrival .material-symbols-outlined {
  font-size: 18px;
  flex-shrink: 0;
}

.dwelling-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

@media (max-width: 599px) {
  .dwelling-image {
    width: 100%;
    height: 180px;
  }

  .dwelling-nomenclature {
    font-size: 18px;
  }

  .dwelling-actions {
    flex-direction: column;
  }
}

/* Contact Section */
.contact-section {
  margin-bottom: 24px;
}

.contact-card {
  background: linear-gradient(135deg, var(--success) 0%, var(--success-container) 100%);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  box-shadow: 0 4px 12px rgba(25, 28, 30, 0.04);
}

@media (max-width: 768px) {
  .contact-card {
    flex-direction: column;
    align-items: flex-start;
  }
}

.contact-content {
  flex: 1;
}

.contact-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--on-success);
  margin: 0 0 8px 0;
}

.contact-description {
  font-size: 14px;
  color: var(--on-success-container);
  line-height: 1.6;
  margin: 0;
}

.contact-btn {
  white-space: nowrap;
}

/* Side Panel */
.bento-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.actions-card {
  background: var(--surface-container-low);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 16px 32px rgba(25, 28, 30, 0.06);
}

.quick-actions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.quick-action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--surface-container-lowest);
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s;
}

.quick-action-item:hover {
  background: var(--primary-50);
}

.action-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon-wrapper.primary { background: var(--primary); }
.action-icon-wrapper.primary .material-symbols-outlined { color: var(--on-primary); }

.action-icon-wrapper.secondary { background: var(--info); }
.action-icon-wrapper.secondary .material-symbols-outlined { color: var(--on-info); }

.action-icon-wrapper.tertiary { background: var(--success); }
.action-icon-wrapper.tertiary .material-symbols-outlined { color: var(--on-success); }

.action-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
}

/* Status Card */
.status-card {
  background: linear-gradient(135deg, var(--success) 0%, var(--success-container) 100%);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon .material-symbols-outlined {
  font-size: 24px;
  color: var(--on-success);
}

.status-content {
  flex: 1;
}

.status-text {
  font-size: 14px;
  font-weight: 700;
  color: var(--on-success);
  margin: 0;
}

.status-subtext {
  font-size: 12px;
  color: var(--on-success-container);
  margin: 2px 0 0 0;
}

/* Recent Letters Section */
.recent-letters-section {
  margin-bottom: 24px;
}

.letters-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.letter-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--surface-container-low);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.letter-item:hover {
  background: var(--primary-50);
}

.letter-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.letter-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--surface-container-lowest);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  font-size: 20px;
}

.letter-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0;
}

.letter-date {
  font-size: 12px;
  color: var(--outline);
  margin: 2px 0 0 0;
}

.status-badge {
  font-size: 11px;
  padding: 4px 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
