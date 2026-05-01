<template>
  <q-card class="community-card" @click="handleClick" :class="{ clickable }">
    <q-card-section class="community-header">
      <div class="community-icon">
        <span class="material-symbols-outlined">apartment</span>
      </div>
      <div class="community-info">
        <h3 class="community-name">{{ community.name }}</h3>
        <p class="community-location">
          <span class="material-symbols-outlined">location_on</span>
          {{ community.department }}, {{ community.municipality }}
        </p>
      </div>
      <q-badge :color="getStatusColor(community.approvalStatus)">
        {{ getStatusLabel(community.approvalStatus) }}
      </q-badge>
    </q-card-section>

    <q-separator />

    <q-card-section class="community-body">
      <div class="stats-grid">
        <div class="stat-item">
          <span class="material-symbols-outlined">home</span>
          <span class="stat-value">{{ community.dwellingsCount || 0 }}</span>
          <span class="stat-label">Viviendas</span>
        </div>
        <div class="stat-item">
          <span class="material-symbols-outlined">people</span>
          <span class="stat-value">{{ community.residentsCount || 0 }}</span>
          <span class="stat-label">Residentes</span>
        </div>
      </div>

      <div class="community-leadership" v-if="showLeadership">
        <h4 class="leadership-title">Liderazgo</h4>
        <div class="leaders-list">
          <div class="leader-item" v-if="community.president">
            <span class="material-symbols-outlined">verified</span>
            <span>{{ getUserName(community.president) }}</span>
            <span class="leader-role">Presidente</span>
          </div>
          <div class="leader-item" v-if="community.treasurer">
            <span class="material-symbols-outlined">account_balance</span>
            <span>{{ getUserName(community.treasurer) }}</span>
            <span class="leader-role">Tesorero</span>
          </div>
          <div class="leader-item" v-if="community.secretary">
            <span class="material-symbols-outlined">description</span>
            <span>{{ getUserName(community.secretary) }}</span>
            <span class="leader-role">Secretario</span>
          </div>
        </div>
      </div>
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
  community: {
    type: Object,
    required: true
  },
  showLeadership: {
    type: Boolean,
    default: false
  },
  showActions: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click'])

const router = useRouter()

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.community)
  }
}

const getUserName = (user) => {
  if (typeof user === 'object' && user !== null) {
    return user.fullName || 'Usuario'
  }
  return 'Usuario'
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    approved: 'positive',
    rejected: 'negative'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado'
  }
  return labels[status] || status
}
</script>

<style scoped>
.community-card {
  border-radius: 12px;
  transition: all 0.2s;
}

.community-card.clickable {
  cursor: pointer;
}

.community-card.clickable:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.community-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.community-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.community-icon .material-symbols-outlined {
  font-size: 28px;
  color: var(--on-primary);
}

.community-info {
  flex: 1;
}

.community-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 4px 0;
}

.community-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--on-surface-variant);
  margin: 0;
}

.community-location .material-symbols-outlined {
  font-size: 14px;
}

.community-body {
  padding-top: 12px !important;
}

.stats-grid {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-item .material-symbols-outlined {
  font-size: 20px;
  color: var(--outline);
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--black);
}

.stat-label {
  font-size: 12px;
  color: var(--on-surface-variant);
}

.leadership-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  margin: 0 0 12px 0;
}

.leaders-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leader-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--on-surface);
}

.leader-item .material-symbols-outlined {
  font-size: 16px;
  color: var(--outline);
}

.leader-role {
  margin-left: auto;
  font-size: 11px;
  color: var(--outline);
  text-transform: uppercase;
}
</style>
