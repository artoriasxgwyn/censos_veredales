<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="title">Mis Cartas</h1>
      <q-btn
        color="primary"
        label="Solicitar Carta"
        icon="add"
        @click="router.push('/resident/letters/request')"
      />
    </div>

    <!-- Filtros -->
    <div class="filters">
      <q-btn-toggle
        v-model="statusFilter"
        toggle-color="primary"
        :options="statusOptions"
        outline
      />
    </div>

    <div class="letters-list" v-if="!letterStore.loading">
      <q-card
        v-for="letter in filteredLetters"
        :key="letter._id"
        class="letter-card"
        @click="router.push(`/resident/letters/${letter._id}`)"
      >
        <q-card-section class="letter-header">
          <div class="letter-icon">
            <span class="material-symbols-outlined">description</span>
          </div>
          <div class="letter-info">
            <h3 class="letter-name">Carta {{ letter.type }}</h3>
            <p class="letter-status">
              <q-badge :color="getStatusColor(letter.status)">
                {{ getStatusLabel(letter.status) }}
              </q-badge>
            </p>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="letter-body">
          <div class="approval-progress">
            <div class="approval-item" :class="letter.approvedByPresident">
              <span class="material-symbols-outlined">verified</span>
              <span>Presidente</span>
            </div>
            <div class="approval-item" :class="letter.approvedByTreasurer">
              <span class="material-symbols-outlined">verified</span>
              <span>Tesorero</span>
            </div>
            <div class="approval-item" :class="letter.approvedBySecretary">
              <span class="material-symbols-outlined">verified</span>
              <span>Secretario</span>
            </div>
          </div>

          <div class="letter-footer">
            <span class="letter-date">{{ formatDate(letter.createdAt) }}</span>
            <q-badge v-if="letter.qrCodigo" outline color="primary">
              QR: {{ letter.qrCodigo }}
            </q-badge>
          </div>
        </q-card-section>
      </q-card>

      <div v-if="filteredLetters.length === 0" class="no-data">
        <span class="material-symbols-outlined">description</span>
        <p>No has solicitado cartas</p>
        <q-btn
          color="primary"
          label="Solicitar primera carta"
          @click="router.push('/resident/letters/request')"
        />
      </div>
    </div>

    <div v-else class="loading">
      <q-spinner color="primary" size="3em" />
      <p>Cargando cartas...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLetterStore } from '@/stores/letter.store'

const router = useRouter()
const letterStore = useLetterStore()

const statusFilter = ref('all')
const statusOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'Aprobadas', value: 'approved' },
  { label: 'Emitidas', value: 'issued' },
  { label: 'Rechazadas', value: 'rejected' }
]

const filteredLetters = computed(() => {
  if (statusFilter.value === 'all') {
    return letterStore.letters
  }
  return letterStore.letters.filter(l => l.status === statusFilter.value)
})

onMounted(async () => {
  await letterStore.fetchMyLetters()
})

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    approved: 'positive',
    issued: 'info',
    rejected: 'negative'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    issued: 'Emitida',
    rejected: 'Rechazada'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-ES')
}
</script>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
}

.filters {
  margin-bottom: 20px;
}

.letters-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.letter-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.letter-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.letter-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.letter-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.letter-icon .material-symbols-outlined {
  font-size: 24px;
  color: var(--on-primary);
}

.letter-info {
  flex: 1;
}

.letter-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 4px 0;
}

.letter-body {
  padding-top: 12px !important;
}

.approval-progress {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.approval-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--on-surface-variant);
}

.approval-item .material-symbols-outlined {
  font-size: 16px;
}

.approval-item.approved {
  color: var(--primary);
}

.approval-item.rejected {
  color: var(--error);
}

.approval-item.pending {
  color: var(--warning);
}

.letter-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.letter-date {
  font-size: 12px;
  color: var(--on-surface-variant);
}

.no-data, .loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--on-surface-variant);
  grid-column: 1 / -1;
}

.loading {
  color: var(--outline);
}
</style>
