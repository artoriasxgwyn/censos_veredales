<template>
  <div class="approval-progress">
    <div class="approval-step" v-for="(step, index) in steps" :key="step.role">
      <div class="step-connector" v-if="index > 0"></div>

      <div class="step" :class="getStepClass(step.status)">
        <div class="step-indicator">
          <span class="material-symbols-outlined">
            {{ getStepIcon(step.status) }}
          </span>
        </div>
        <div class="step-label">
          <span class="step-role">{{ step.label }}</span>
          <span class="step-status">{{ getStepStatusLabel(step.status) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  approvals: {
    type: Object,
    default: () => ({
      approvedByPresident: 'pending',
      approvedByTreasurer: 'pending',
      approvedBySecretary: 'pending'
    })
  },
  customLabels: {
    type: Object,
    default: () => ({
      president: 'Presidente',
      treasurer: 'Tesorero',
      secretary: 'Secretario'
    })
  }
})

const steps = computed(() => [
  {
    role: 'president',
    status: props.approvals.approvedByPresident || 'pending',
    label: props.customLabels.president
  },
  {
    role: 'treasurer',
    status: props.approvals.approvedByTreasurer || 'pending',
    label: props.customLabels.treasurer
  },
  {
    role: 'secretary',
    status: props.approvals.approvedBySecretary || 'pending',
    label: props.customLabels.secretary
  }
])

const getStepClass = (status) => {
  return {
    approved: status === 'approved',
    rejected: status === 'rejected',
    pending: status === 'pending'
  }
}

const getStepIcon = (status) => {
  if (status === 'approved') return 'check_circle'
  if (status === 'rejected') return 'cancel'
  return 'pending'
}

const getStepStatusLabel = (status) => {
  const labels = {
    approved: 'Aprobado',
    rejected: 'Rechazado',
    pending: 'Pendiente'
  }
  return labels[status] || status
}
</script>

<style scoped>
.approval-progress {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
}

.approval-step {
  display: flex;
  align-items: center;
}

.step-connector {
  width: 24px;
  height: 2px;
  background: var(--surface-container-highest);
  margin: 0 4px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.step-indicator {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-container);
  transition: all 0.2s;
}

.step.approved .step-indicator {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
}

.step.rejected .step-indicator {
  background: linear-gradient(135deg, var(--error) 0%, var(--error-container) 100%);
}

.step.pending .step-indicator {
  background: linear-gradient(135deg, var(--warning) 0%, var(--warning-container) 100%);
}

.step.approved .step-indicator .material-symbols-outlined {
  color: var(--on-primary);
}

.step.rejected .step-indicator .material-symbols-outlined {
  color: var(--on-error);
}

.step.pending .step-indicator .material-symbols-outlined {
  color: var(--on-warning);
}

.step-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.step-role {
  font-size: 11px;
  font-weight: 600;
  color: var(--outline);
  text-transform: uppercase;
}

.step-status {
  font-size: 10px;
  color: var(--on-surface-variant);
}

.step.approved .step-status {
  color: var(--primary);
}

.step.rejected .step-status {
  color: var(--error);
}

.step.pending .step-status {
  color: var(--warning);
}
</style>
