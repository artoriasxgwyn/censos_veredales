<template>
  <div class="loading-spinner" :class="{ fullscreen }">
    <q-spinner :color="color" :size="size" />
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  fullscreen: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: 'primary'
  },
  size: {
    type: String,
    default: '3em'
  }
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
}

.loading-spinner.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--surface-container-lowest);
  z-index: 9999;
}

.loading-message {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0;
}
</style>
