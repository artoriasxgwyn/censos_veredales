<template>
  <div class="announcement-card" @click="handleClick" :class="{ clickable }">
    <div class="announcement-badge" :class="isPublished(announcement) ? 'published' : 'draft'">
      {{ getStatusLabel(isPublished(announcement)) }}
    </div>

    <div class="announcement-icon">
      <span class="material-symbols-outlined">campaign</span>
    </div>

    <h3 class="announcement-title">{{ announcement.title }}</h3>
    <p class="announcement-community">{{ getAuthorName(announcement.createdBy) }}</p>

    <div class="announcement-body">
      <p class="announcement-excerpt">{{ getExcerpt(announcement.body) }}</p>
    </div>

    <div class="announcement-footer">
      <span class="announcement-date">
        <span class="material-symbols-outlined">calendar_today</span>
        {{ formatDate(announcement.createdAt) }}
      </span>
      <span class="material-symbols-outlined chevron">chevron_right</span>
    </div>

    <div class="announcement-actions" v-if="showActions">
      <slot name="actions"></slot>
    </div>
  </div>
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

const isPublished = (announcement) => {
  return announcement.publishedAt && new Date(announcement.publishedAt) <= new Date()
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
  background: var(--surface-container-lowest);
  border: 1px solid var(--surface-container-highest);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

@media (max-width: 599px) {
  .announcement-card {
    padding: 16px;
  }

  .announcement-card:hover {
    transform: none;
  }
}

.announcement-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
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

.announcement-badge.published { background: var(--success); color: var(--on-success); }
.announcement-badge.draft { background: var(--info); color: var(--on-info); }

.announcement-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

body.dark .announcement-icon {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

@media (max-width: 599px) {
  .announcement-icon {
    width: 40px;
    height: 40px;
    margin-bottom: 12px;
  }

  .announcement-icon .material-symbols-outlined {
    font-size: 20px;
  }
}

.announcement-icon .material-symbols-outlined {
  font-size: 24px;
  color: var(--white);
}

.announcement-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 4px 0;
}

@media (max-width: 599px) {
  .announcement-title {
    font-size: 16px;
  }
}

.announcement-community {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0 0 16px 0;
}

@media (max-width: 599px) {
  .announcement-community {
    font-size: 13px;
    margin-bottom: 12px;
  }
}

.announcement-body {
  padding-top: 12px !important;
  border-top: 1px solid var(--surface-container-highest);
  margin-bottom: 16px;
}

.announcement-excerpt {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0;
  line-height: 1.6;
}

@media (max-width: 599px) {
  .announcement-excerpt {
    font-size: 13px;
  }
}

.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--surface-container-highest);
}

.announcement-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--on-surface-variant);
}

.announcement-date .material-symbols-outlined {
  font-size: 14px;
}

.chevron {
  color: var(--on-surface-variant);
  font-size: 20px;
}

.announcement-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
</style>
