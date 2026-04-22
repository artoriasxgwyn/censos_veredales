<template>
  <q-badge :color="computedColor" class="status-badge">
    <span class="material-symbols-outlined badge-icon" v-if="showIcon">
      {{ statusIcon }}
    </span>
    {{ label }}
  </q-badge>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  showIcon: {
    type: Boolean,
    default: false
  },
  customLabels: {
    type: Object,
    default: () => ({})
  }
})

const defaultLabels = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  issued: 'Emitido',
  published: 'Publicado',
  draft: 'Borrador',
  active: 'Activo',
  inactive: 'Inactivo'
}

const defaultColors = {
  pending: 'warning',
  approved: 'positive',
  rejected: 'negative',
  issued: 'info',
  published: 'positive',
  draft: 'grey',
  active: 'positive',
  inactive: 'grey'
}

const defaultIcons = {
  pending: 'schedule',
  approved: 'check_circle',
  rejected: 'cancel',
  issued: 'send',
  published: 'campaign',
  draft: 'edit',
  active: 'check_circle',
  inactive: 'block'
}

const computedColor = computed(() => {
  return defaultColors[props.status] || 'grey'
})

const label = computed(() => {
  return props.customLabels[props.status] || defaultLabels[props.status] || props.status
})

const statusIcon = computed(() => {
  return defaultIcons[props.status] || 'circle'
})
</script>

<style scoped>
.status-badge {
  font-size: 12px;
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.badge-icon {
  font-size: 14px;
}
</style>
