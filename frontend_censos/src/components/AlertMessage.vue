<template>
  <div class="alert-message" :class="[type, { 'with-icon': showIcon }]">
    <span class="material-symbols-outlined alert-icon" v-if="showIcon">
      {{ icon }}
    </span>
    <div class="alert-content">
      <h4 class="alert-title" v-if="title">{{ title }}</h4>
      <p class="alert-text"><slot /></p>
      <q-btn
        v-if="showClose"
        flat
        dense
        icon="close"
        @click="$emit('close')"
        class="alert-close"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  showClose: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])

const icon = computed(() => {
  const icons = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    error: 'error'
  }
  return icons[props.type] || 'info'
})
</script>

<style scoped>
.alert-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.alert-message.with-icon {
  padding-left: 12px;
}

.alert-message.info {
  background: var(--primary-50);
  border: 1px solid var(--primary);
  color: var(--on-surface);
}

.alert-message.success {
  background: var(--success-container);
  border: 1px solid var(--success);
  color: var(--on-surface);
}

.alert-message.warning {
  background: var(--warning-container);
  border: 1px solid var(--warning);
  color: var(--on-surface);
}

.alert-message.error {
  background: var(--error-container);
  border: 1px solid var(--error);
  color: var(--on-surface);
}

.alert-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.alert-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.alert-text {
  font-size: 13px;
  margin: 0;
  line-height: 1.5;
}

.alert-close {
  align-self: flex-start;
  margin: -4px -4px 0 0;
}
</style>
