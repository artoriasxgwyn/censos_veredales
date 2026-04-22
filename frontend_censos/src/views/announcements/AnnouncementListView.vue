<template>
  <div class="page">
    <div class="page-content">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <p class="page-subtitle">Gestión de Comunicación</p>
          <h1 class="page-title">Anuncios</h1>
          <p class="page-description">Publique y gestione los anuncios de la comunidad</p>
        </div>
        <q-btn
          v-if="canCreate"
          color="primary"
          label="Crear Anuncio"
          icon="add"
          @click="router.push('/admin/announcements/create')"
          class="create-btn"
        >
          <template v-slot:append>
            <span class="material-symbols-outlined">arrow_forward</span>
          </template>
        </q-btn>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-chips">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            :class="['filter-chip', { active: statusFilter === option.value }]"
            @click="statusFilter = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Announcements List -->
      <div class="announcements-section" v-if="!announcementStore.loading">
        <div class="announcements-grid">
          <div
            v-for="announcement in filteredAnnouncements"
            :key="announcement._id"
            class="announcement-card"
            @click="router.push(`/admin/announcements/${announcement._id}`)"
          >
            <div class="announcement-badge" :class="announcement.isPublished ? 'published' : 'draft'">
              {{ announcement.isPublished ? 'Publicado' : 'Borrador' }}
            </div>

            <div class="announcement-icon">
              <span class="material-symbols-outlined">campaign</span>
            </div>

            <h3 class="announcement-title">{{ announcement.title }}</h3>
            <p class="announcement-excerpt">{{ getExcerpt(announcement.content) }}</p>

            <div class="announcement-footer">
              <div class="announcement-author">
                <span class="material-symbols-outlined">person</span>
                {{ getAuthorName(announcement.createdBy) }}
              </div>
              <div class="announcement-date">
                <span class="material-symbols-outlined">calendar_today</span>
                {{ formatDate(announcement.createdAt) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredAnnouncements.length === 0" class="empty-state">
          <div class="empty-icon">
            <span class="material-symbols-outlined">campaign</span>
          </div>
          <h3 class="empty-title">No hay anuncios registrados</h3>
          <p class="empty-description">Crea el primer anuncio para comunicar con la comunidad</p>
          <q-btn
            v-if="canCreate"
            color="primary"
            label="Crear primer anuncio"
            @click="router.push('/admin/announcements/create')"
            class="create-btn"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="loading-state">
        <q-spinner color="primary" size="48px" />
        <p>Cargando anuncios...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnnouncementStore } from '@/stores/announcement.store'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'

const router = useRouter()
const announcementStore = useAnnouncementStore()
const authStore = useAuthStore()
const userStore = useUserStore()

const statusFilter = ref('all')
const statusOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Publicados', value: 'published' },
  { label: 'Borradores', value: 'draft' }
]

const canCreate = computed(() => {
  return authStore.isPresident || authStore.isTreasurer || authStore.isSecretary
})

const filteredAnnouncements = computed(() => {
  if (statusFilter.value === 'all') {
    return announcementStore.announcements
  }
  const status = statusFilter.value === 'published' ? true : false
  return announcementStore.announcements.filter(a => a.isPublished === status)
})

onMounted(async () => {
  await Promise.all([
    announcementStore.fetchAnnouncements(),
    userStore.fetchAllUsersPublic()
  ])
})

const getAuthorName = (userId) => {
  if (typeof userId === 'object' && userId !== null) {
    return userId.fullName || 'Administrador'
  }
  const user = userStore.users.find(u => u._id === userId)
  return user?.fullName || 'Administrador'
}

const getExcerpt = (content) => {
  if (!content) return ''
  const plain = content.replace(/<[^>]*>/g, '')
  return plain.length > 120 ? plain.substring(0, 120) + '...' : plain
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--surface);
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

.create-btn {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: var(--on-primary);
  padding: 14px 24px;
  border-radius: 10px;
  font-weight: 700;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(0, 40, 142, 0.3);
  transition: all 0.2s;
  font-size: 14px;
  letter-spacing: -0.01em;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 40, 142, 0.4);
}

.create-btn .material-symbols-outlined {
  font-size: 18px;
  margin-left: 4px;
}

/* Filters */
.filters-section {
  margin-bottom: 24px;
}

.filter-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 8px 16px;
  background: var(--surface-container-lowest);
  border: 1px solid var(--surface-container-highest);
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip:hover {
  background: var(--primary-fixed);
  border-color: var(--primary);
}

.filter-chip.active {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--on-primary);
}

/* Announcements Section */
.announcements-section {
  background: var(--surface-container-lowest);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 16px 32px rgba(25, 28, 30, 0.06);
}

.announcements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.announcement-card {
  background: var(--surface);
  border: 1px solid var(--surface-container-highest);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.announcement-card:hover {
  background: var(--primary-fixed);
  border-color: var(--primary);
  transform: translateY(-2px);
}

.announcement-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.announcement-badge.published {
  background: var(--tertiary);
  color: var(--on-tertiary);
}

.announcement-badge.draft {
  background: var(--outline);
  color: var(--on-primary);
}

.announcement-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--warning) 0%, var(--warning-container) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.announcement-icon .material-symbols-outlined {
  font-size: 24px;
  color: var(--on-primary);
}

.announcement-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 10px 0;
}

.announcement-excerpt {
  font-size: 14px;
  color: var(--on-surface-variant);
  line-height: 1.6;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--surface-container-highest);
}

.announcement-author,
.announcement-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--outline);
}

.announcement-author .material-symbols-outlined,
.announcement-date .material-symbols-outlined {
  font-size: 14px;
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
  background: var(--primary-fixed);
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
</style>
