<template>
  <div class="page-container">
    <div class="page-header">
      <q-btn
        flat
        icon="arrow_back"
        label="Volver"
        @click="router.back()"
      />
      <h1 class="title">Detalle del Anuncio</h1>
      <div class="header-actions">
        <q-btn
          v-if="canEdit && isCreator"
          color="primary"
          label="Editar"
          icon="edit"
          @click="router.push(`/admin/announcements/${announcement._id}/edit`)"
        />
        <q-btn
          v-if="canEdit && isCreator"
          :color="isPublished ? 'secondary' : 'positive'"
          :label="isPublished ? 'Mover a Borrador' : 'Publicar'"
          :icon="isPublished ? 'archive' : 'publish'"
          @click="handleTogglePublish"
        />
        <q-btn
          v-if="canDelete && isCreator"
          color="negative"
          label="Eliminar"
          icon="delete"
          @click="handleDelete"
        />
      </div>
    </div>

    <div v-if="!announcementStore.loading && announcement" class="content">
      <q-card class="announcement-card">
        <q-card-section class="announcement-header">
          <div class="announcement-icon">
            <span class="material-symbols-outlined">campaign</span>
          </div>
          <div class="announcement-info">
            <h2 class="announcement-title">{{ announcement.title }}</h2>
            <div class="announcement-meta-inline">
              <q-badge :color="getStatusColor(announcementStatus)">
                {{ getStatusLabel(announcementStatus) }}
              </q-badge>
              <span class="author-text">
                Por {{ getAuthorName(announcement.createdBy) }}
              </span>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="announcement-content" v-html="announcement.body"></div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <h3 class="section-title">Información</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Fecha de Creación</span>
              <span class="info-value">{{ formatDate(announcement.createdAt) }}</span>
            </div>
            <div class="info-item" v-if="announcement.publishedAt">
              <span class="info-label">Fecha de Publicación</span>
              <span class="info-value">{{ formatDate(announcement.publishedAt) }}</span>
            </div>
            <div class="info-item" v-if="announcement.updatedAt">
              <span class="info-label">Última Actualización</span>
              <span class="info-value">{{ formatDate(announcement.updatedAt) }}</span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="announcementStore.loading" class="loading">
      <q-spinner color="primary" size="3em" />
      <p>Cargando anuncio...</p>
    </div>

    <div v-else class="no-data">
      <span class="material-symbols-outlined">error</span>
      <p>Anuncio no encontrado</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAnnouncementStore } from '@/stores/announcement.store'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const announcementStore = useAnnouncementStore()
const authStore = useAuthStore()
const userStore = useUserStore()

const announcementId = computed(() => route.params.id)
const announcement = computed(() => announcementStore.currentAnnouncement)

const isPublished = computed(() => {
  return announcement.value?.publishedAt && new Date(announcement.value.publishedAt) <= new Date()
})

const announcementStatus = computed(() => {
  return isPublished.value ? 'published' : 'draft'
})

const canEdit = computed(() => {
  return authStore.hasPermission('announcement', 'update')
})

const canDelete = computed(() => {
  return authStore.hasPermission('announcement', 'delete')
})

const isCreator = computed(() => {
  // President can edit any announcement, creators can edit their own
  if (authStore.isPresident) return true
  return announcement.value?.createdBy === authStore.user?._id
})

onMounted(async () => {
  await Promise.all([
    announcementStore.fetchAnnouncementById(announcementId.value),
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

const getStatusColor = (status) => {
  return status === 'published' ? 'positive' : 'grey'
}

const getStatusLabel = (status) => {
  return status === 'published' ? 'Publicado' : 'Borrador'
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-ES')
}

const handleTogglePublish = async () => {
  const action = isPublished.value ? 'no publicado' : 'publicado'

  $q.dialog({
    title: isPublished.value ? 'Mover a Borrador' : 'Publicar Anuncio',
    message: `¿Estás seguro de que quieres ${action} este anuncio?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const result = await announcementStore.togglePublish(announcementId.value)

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: `Anuncio ${action} exitosamente`
      })
      await announcementStore.fetchAnnouncementById(announcementId.value)
    } else {
      $q.notify({
        type: 'negative',
        message: result.message || 'Error en la operación'
      })
    }
  })
}

const handleDelete = async () => {
  $q.dialog({
    title: 'Eliminar Anuncio',
    message: '¿Estás seguro de que quieres eliminar este anuncio? Esta acción no se puede deshacer.',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const result = await announcementStore.deleteAnnouncement(announcementId.value)

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Anuncio eliminado exitosamente'
      })
      router.push('/admin/announcements')
    } else {
      $q.notify({
        type: 'negative',
        message: result.message || 'Error al eliminar'
      })
    }
  })
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

.header-actions :deep(.q-btn--secondary .q-btn__content) {
  color: #0f172a;
}

body.body--dark .header-actions :deep(.q-btn--secondary .q-btn__content),
body.body--dark .header-actions :deep(.q-btn--secondary .q-btn__content .q-icon) {
  color: #e2e8f0;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.announcement-card {
  border-radius: 12px;
  background: var(--surface-container) !important;
  border: 1px solid var(--surface-container-highest);
}

.announcement-card :deep(.q-card__section) {
  background: transparent !important;
}

.announcement-card :deep(.q-separator) {
  background: var(--surface-container-highest) !important;
}

.announcement-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.announcement-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

body.dark .announcement-icon {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.announcement-icon .material-symbols-outlined {
  font-size: 28px;
  color: var(--white);
}

.announcement-info {
  flex: 1;
}

.announcement-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 8px 0;
}

.announcement-meta-inline {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-text {
  font-size: 13px;
  color: var(--outline);
}

.announcement-content {
  font-size: 15px;
  line-height: 1.8;
  color: var(--on-surface);
}

/* Estilos para contenido HTML renderizado (v-html) */
.announcement-content :deep(h1),
.announcement-content :deep(h2),
.announcement-content :deep(h3),
.announcement-content :deep(h4) {
  color: var(--on-surface);
  font-weight: 700;
  margin: 24px 0 12px 0;
  line-height: 1.3;
}

.announcement-content :deep(h1) { font-size: 28px; }
.announcement-content :deep(h2) { font-size: 24px; }
.announcement-content :deep(h3) { font-size: 20px; }
.announcement-content :deep(h4) { font-size: 18px; }

.announcement-content :deep(p) {
  margin: 0 0 16px 0;
  color: var(--on-surface-variant);
}

.announcement-content :deep(p:last-child) {
  margin-bottom: 0;
}

.announcement-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 16px 0;
  display: block;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.announcement-content :deep(ul),
.announcement-content :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
  color: var(--on-surface-variant);
}

.announcement-content :deep(li) {
  margin-bottom: 8px;
}

.announcement-content :deep(blockquote) {
  margin: 20px 0;
  padding: 16px 20px;
  border-left: 4px solid var(--primary);
  background: var(--surface-container);
  border-radius: 0 12px 12px 0;
  font-style: italic;
  color: var(--on-surface-variant);
}

.announcement-content :deep(a) {
  color: var(--primary);
  text-decoration: underline;
  font-weight: 600;
}

.announcement-content :deep(a:hover) {
  color: var(--on-primary-container);
}

.announcement-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  border-radius: 12px;
  overflow: hidden;
}

.announcement-content :deep(th),
.announcement-content :deep(td) {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--surface-container-highest);
}

.announcement-content :deep(th) {
  background: var(--surface-container);
  font-weight: 700;
  color: var(--on-surface);
}

.announcement-content :deep(td) {
  color: var(--on-surface-variant);
}

.announcement-content :deep(pre) {
  background: var(--surface-container);
  padding: 16px;
  border-radius: 12px;
  overflow-x: auto;
  margin: 16px 0;
}

.announcement-content :deep(code) {
  background: var(--surface-container);
  padding: 2px 8px;
  border-radius: 6px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  color: var(--primary);
}

.announcement-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--surface-container-highest);
  margin: 24px 0;
}

.announcement-content :deep(strong) {
  color: var(--on-surface);
  font-weight: 700;
}

.announcement-content :deep(em) {
  font-style: italic;
}

.announcement-card :deep(.q-separator) {
  background: var(--surface-container-highest);
}

.announcement-card :deep(.q-card__section) {
  background: transparent;
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
