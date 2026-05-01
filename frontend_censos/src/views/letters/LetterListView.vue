<template>
  <div class="page">
    <div class="page-content">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <p class="page-subtitle">Gestión Documental</p>
          <h1 class="page-title">Cartas de la Comunidad</h1>
          <p class="page-description">Administre las cartas y certificados emitidos</p>
        </div>
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

      <!-- Letters List -->
      <div class="letters-section" v-if="!letterStore.loading">
        <div class="letters-grid">
          <div
            v-for="letter in filteredLetters"
            :key="letter._id"
            class="letter-card"
            @click="router.push(`/admin/letters/${letter._id}`)"
          >
            <div class="letter-badge" :class="letter.status">
              {{ getStatusLabel(letter.status) }}
            </div>

            <div class="letter-icon">
              <span class="material-symbols-outlined">description</span>
            </div>

            <h3 class="letter-type">Carta {{ letter.type }}</h3>
            <p class="letter-user">{{ getUserName(letter.userId) }}</p>

            <div class="approval-status">
              <div class="approval-item" :class="getApprovalClass(letter.approvedByPresident)">
                <span class="material-symbols-outlined">
                  {{ letter.approvedByPresident ? 'check_circle' : 'pending' }}
                </span>
              </div>
              <div class="approval-item" :class="getApprovalClass(letter.approvedByTreasurer)">
                <span class="material-symbols-outlined">
                  {{ letter.approvedByTreasurer ? 'check_circle' : 'pending' }}
                </span>
              </div>
              <div class="approval-item" :class="getApprovalClass(letter.approvedBySecretary)">
                <span class="material-symbols-outlined">
                  {{ letter.approvedBySecretary ? 'check_circle' : 'pending' }}
                </span>
              </div>
            </div>

            <div class="letter-footer">
              <span class="letter-date">
                <span class="material-symbols-outlined">calendar_today</span>
                {{ formatDate(letter.createdAt) }}
              </span>
              <span class="material-symbols-outlined chevron">chevron_right</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredLetters.length === 0" class="empty-state">
          <div class="empty-icon">
            <span class="material-symbols-outlined">description</span>
          </div>
          <h3 class="empty-title">No hay cartas registradas</h3>
          <p class="empty-description">Las cartas solicitadas por residentes aparecerán aquí</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="loading-state">
        <q-spinner color="primary" size="48px" />
        <p>Cargando cartas...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLetterStore } from '@/stores/letter.store'
import { useUserStore } from '@/stores/user.store'

const router = useRouter()
const letterStore = useLetterStore()
const userStore = useUserStore()

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
  await Promise.all([
    letterStore.fetchCommunityLetters(),
    userStore.fetchAllUsersPublic()
  ])
})

const getUserName = (userId) => {
  if (typeof userId === 'object' && userId !== null) {
    return userId.fullName || 'Usuario'
  }
  const user = userStore.users.find(u => u._id === userId)
  return user?.fullName || 'Usuario'
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

const getApprovalClass = (approved) => {
  if (approved === true) return 'approved'
  if (approved === false) return 'rejected'
  return 'pending'
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
  background: var(--surface-container-lowest);
}

.page-content {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 599px) {
  .page-content {
    padding: 16px;
  }
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

@media (max-width: 599px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;
    gap: 16px;
  }
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

@media (max-width: 599px) {
  .page-subtitle {
    font-size: 10px;
  }

  .page-title {
    font-size: 28px;
  }

  .page-description {
    font-size: 14px;
  }
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
  background: var(--primary-50);
  border-color: var(--primary);
}

.filter-chip.active {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--on-primary);
}

/* Letters Section */
.letters-section {
  background: var(--surface);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 16px 32px rgba(25, 28, 30, 0.06);
}

.letters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

@media (max-width: 599px) {
  .letters-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.letter-card {
  background: var(--surface-container-lowest);
  border: 1px solid var(--surface-container-highest);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

@media (max-width: 599px) {
  .letter-card {
    padding: 16px;
  }

  .letter-card:hover {
    transform: none;
  }
}

.letter-badge {
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

.letter-badge.pending { background: var(--warning); color: var(--on-warning); }
.letter-badge.approved { background: var(--success); color: var(--on-success); }
.letter-badge.issued { background: var(--primary); color: var(--on-primary); }
.letter-badge.rejected { background: var(--error); color: var(--on-error); }

.letter-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

@media (max-width: 599px) {
  .letter-icon {
    width: 40px;
    height: 40px;
    margin-bottom: 12px;
  }

  .letter-icon .material-symbols-outlined {
    font-size: 20px;
  }
}

.letter-icon .material-symbols-outlined {
  font-size: 24px;
  color: var(--on-primary);
}

.letter-type {
  font-size: 18px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 4px 0;
}

@media (max-width: 599px) {
  .letter-type {
    font-size: 16px;
  }
}

.letter-user {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0 0 16px 0;
}

@media (max-width: 599px) {
  .letter-user {
    font-size: 13px;
    margin-bottom: 12px;
  }
}

.approval-status {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.approval-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--outline);
}

.approval-item .material-symbols-outlined {
  font-size: 16px;
}

.approval-item.approved { color: var(--success); }
.approval-item.rejected { color: var(--error); }
.approval-item.pending { color: var(--warning); }

.letter-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--surface-container-highest);
}

.letter-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--on-surface-variant);
}

.letter-date .material-symbols-outlined {
  font-size: 14px;
}

.chevron {
  color: var(--on-surface-variant);
  font-size: 20px;
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
  background: var(--primary-50);
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
