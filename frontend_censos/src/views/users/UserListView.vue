<template>
  <div class="page">
    <div class="page-content">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <p class="page-subtitle">Administración de Usuarios</p>
          <h1 class="page-title">Usuarios</h1>
          <p class="page-description">Gestione los usuarios del sistema</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="search-box">
          <span class="material-symbols-outlined">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre o email..."
            class="search-input"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="filter-chips">
          <button
            v-for="option in roleOptions"
            :key="option.value"
            :class="['filter-chip', { active: roleFilter === option.value }]"
            @click="roleFilter = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Users List -->
      <div class="users-section" v-if="!userStore.loading">
        <div class="users-grid">
          <div
            v-for="user in filteredUsers"
            :key="user._id"
            class="user-card"
            @click="router.push(`/admin/users/${user._id}`)"
          >
            <div class="user-avatar">
              <span class="material-symbols-outlined">person</span>
            </div>
            <div class="user-info">
              <h3 class="user-name">{{ user.fullName }}</h3>
              <p class="user-email">{{ user.email }}</p>
              <div class="user-roles">
                <span
                  v-if="user.role"
                  class="role-badge"
                  :class="user.role"
                >
                  {{ getRoleLabel(user.role) }}
                </span>
              </div>
            </div>
            <span class="material-symbols-outlined chevron">chevron_right</span>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredUsers.length === 0" class="empty-state">
          <div class="empty-icon">
            <span class="material-symbols-outlined">group</span>
          </div>
          <h3 class="empty-title">No hay usuarios registrados</h3>
          <p class="empty-description">Los usuarios creados aparecerán aquí</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="loading-state">
        <q-spinner color="primary" size="48px" />
        <p>Cargando usuarios...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.store'

const router = useRouter()
const userStore = useUserStore()

const searchQuery = ref('')
const roleFilter = ref('all')
const roleOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Presidente', value: 'president' },
  { label: 'Tesorero', value: 'tesorero' },
  { label: 'Secretario', value: 'secretario' },
  { label: 'Residente', value: 'residente' },
  { label: 'Censista', value: 'censista' }
]

const filteredUsers = computed(() => {
  let result = userStore.users

  if (roleFilter.value !== 'all') {
    result = result.filter(u => u.role === roleFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(u =>
      u.fullName?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query)
    )
  }

  return result
})

onMounted(async () => {
  await userStore.fetchUsers()
})

const getRoleLabel = (role) => {
  const labels = {
    president: 'Presidente',
    treasurer: 'Tesorero',
    secretary: 'Secretario',
    residente: 'Residente',
    censista: 'Censista'
  }
  return labels[role] || role
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
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box .material-symbols-outlined {
  position: absolute;
  left: 16px;
  color: var(--outline);
  font-size: 20px;
}

.search-input {
  width: 100%;
  padding: 14px 44px 14px 48px;
  background: var(--surface);
  border: 1px solid var(--surface-container-highest);
  border-radius: 12px;
  font-size: 14px;
  color: var(--on-surface);
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-50);
}

.search-input::placeholder {
  color: var(--outline);
}

.clear-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn .material-symbols-outlined {
  font-size: 18px;
  color: var(--outline);
}

.filter-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 8px 16px;
  background: var(--surface);
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

/* Users Section */
.users-section {
  background: #1e293b;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid #475569;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

@media (max-width: 599px) {
  .users-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #0f172a;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #475569;
}

@media (max-width: 599px) {
  .user-card {
    padding: 16px;
    gap: 12px;
  }

  .user-card:hover {
    transform: none;
  }
}

.user-card:hover {
  background: #334155;
  border-color: #3b82f6;
  transform: translateX(4px);
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar .material-symbols-outlined {
  font-size: 28px;
  color: var(--on-primary);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 16px;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 13px;
  color: #94a3b8;
  margin: 0 0 10px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.role-badge {
  padding: 4px 10px;
  background: #475569;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-badge.president { background: #3b82f6; color: #ffffff; }
.role-badge.treasurer { background: #60a5fa; color: #0f172a; }
.role-badge.secretary { background: #34d399; color: #064e3b; }
.role-badge.residente { background: #10b981; color: #ffffff; }
.role-badge.censista { background: #f59e0b; color: #78350f; }

.chevron {
  color: #94a3b8;
  font-size: 24px;
  flex-shrink: 0;
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
