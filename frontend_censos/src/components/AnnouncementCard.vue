<template>
  <q-card class="announcement-card" @click="handleClick" :class="{ clickable }">
    <q-card-section class="announcement-header">
      <div class="announcement-icon">
        <span class="material-symbols-outlined">campaign</span>
      </div>
      <div class="announcement-info">
        <h3 class="announcement-title">{{ announcement.title }}</h3>
        <div class="announcement-meta">
          <span class="material-symbols-outlined">person</span>
          <span>{{ getAuthorName(announcement.createdBy) }}</span>
          <span class="separator">•</span>
          <span class="material-symbols-outlined">calendar_today</span>
          <span>{{ formatDate(announcement.createdAt) }}</span>
        </div>
      </div>
      <q-badge :color="getStatusColor(announcement.isPublished)">
        {{ getStatusLabel(announcement.isPublished) }}
      </q-badge>
    </q-card-section>

    <q-separator />

    <q-card-section class="announcement-body">
      <p class="announcement-excerpt" v-html="getExcerpt(announcement.content)"></p>
    </q-card-section>

    <q-card-actions align="right" v-if="showActions">
      <slot name="actions"></slot>
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  announcement: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: true
  },
  users: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['click'])

const router = useRouter()

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.announcement)
  }
}

const getAuthorName = (user) => {
  if (typeof user === 'object' && user !== null) {
    return user.fullName || 'Administrador'
  }
  const foundUser = props.users.find(u => u._id === user)
  return foundUser?.fullName || 'Administrador'
}

const getExcerpt = (content) => {
  if (!content) return ''
  const plain = content.replace(/<[^>]*>/g, '')
  return plain.length > 120 ? plain.substring(0, 120) + '...' : plain
}

const getStatusColor = (isPublished) => {
  return isPublished ? 'positive' : 'grey'
}

const getStatusLabel = (isPublished) => {
  return isPublished ? 'Publicado' : 'Borrador'
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-ES')
}
</script>

<style scoped>
.announcement-card {
  border-radius: 12px;
  transition: all 0.2s;
}

.announcement-card.clickable {
  cursor: pointer;
}

.announcement-card.clickable:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.announcement-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.announcement-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--warning) 0%, var(--warning-container) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.announcement-icon .material-symbols-outlined {
  font-size: 24px;
  color: var(--on-primary);
}

.announcement-info {
  flex: 1;
}

.announcement-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 4px 0;
}

.announcement-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--outline);
}

.announcement-meta .material-symbols-outlined {
  font-size: 14px;
}

.separator {
  color: var(--surface-container-highest);
}

.announcement-body {
  padding-top: 12px !important;
}

.announcement-excerpt {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0;
  line-height: 1.6;
}
</style>
