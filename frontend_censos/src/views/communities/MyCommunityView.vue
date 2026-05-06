<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="title">Mi Comunidad</h1>
    </div>

    <div v-if="loading" class="loading-state">
      <q-spinner color="primary" size="48px" />
      <p>Cargando información de la comunidad...</p>
    </div>

    <div v-else-if="community" class="content">
      <q-card class="community-card">
        <q-card-section class="community-header">
          <div class="community-icon">
            <span class="material-symbols-outlined">account_balance</span>
          </div>
          <div class="community-info">
            <h2 class="community-name">{{ community.neighborhood }}</h2>
            <p class="community-city">{{ community.city }}</p>
            <div class="community-code-badge">
              <span class="material-symbols-outlined">badge</span>
              <span>Código: {{ community.code }}</span>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <h3 class="section-title">Información General</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Barrio / Vereda</span>
              <span class="info-value">{{ community.neighborhood || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Ciudad / Municipio</span>
              <span class="info-value">{{ community.city || 'N/A' }}</span>
            </div>
            <div class="info-item" v-if="community.department">
              <span class="info-label">Departamento</span>
              <span class="info-value">{{ community.department }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Código de Comunidad</span>
              <span class="info-value code">{{ community.code || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Dirección Salón Comunal</span>
              <span class="info-value">{{ community.communityHallAddress || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Número estimado de residentes</span>
              <span class="info-value">{{ community.estimatedResidentCount || 0 }}</span>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <h3 class="section-title">Líderes de la Comunidad</h3>
          <div class="leaders-grid">
            <div class="leader-card" v-if="community.presidentId">
              <div class="leader-icon">
                <span class="material-symbols-outlined">person</span>
              </div>
              <div class="leader-info">
                <span class="leader-label">Presidente</span>
                <span class="leader-name">{{ getLeaderName(community.presidentId) }}</span>
                <span class="leader-phone" v-if="getLeaderPhone(community.presidentId, community.presidentWhatsApp)">
                  <span class="material-symbols-outlined">phone</span>
                  {{ getLeaderPhone(community.presidentId, community.presidentWhatsApp) }}
                </span>
              </div>
            </div>
            <div class="leader-card" v-if="community.treasurerId">
              <div class="leader-icon">
                <span class="material-symbols-outlined">account_balance_wallet</span>
              </div>
              <div class="leader-info">
                <span class="leader-label">Tesorero</span>
                <span class="leader-name">{{ getLeaderName(community.treasurerId) }}</span>
                <span class="leader-phone" v-if="getLeaderPhone(community.treasurerId, community.treasurerWhatsApp)">
                  <span class="material-symbols-outlined">phone</span>
                  {{ getLeaderPhone(community.treasurerId, community.treasurerWhatsApp) }}
                </span>
              </div>
            </div>
            <div class="leader-card" v-if="community.secretaryId">
              <div class="leader-icon">
                <span class="material-symbols-outlined">description</span>
              </div>
              <div class="leader-info">
                <span class="leader-label">Secretario</span>
                <span class="leader-name">{{ getLeaderName(community.secretaryId) }}</span>
                <span class="leader-phone" v-if="getLeaderPhone(community.secretaryId, community.secretaryWhatsApp)">
                  <span class="material-symbols-outlined">phone</span>
                  {{ getLeaderPhone(community.secretaryId, community.secretaryWhatsApp) }}
                </span>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-section v-if="canEdit">
          <h3 class="section-title">Acciones</h3>
          <div class="actions">
            <q-btn
              color="primary"
              label="Editar Comunidad"
              icon="edit"
              @click="handleEdit"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div v-else class="no-data">
      <span class="material-symbols-outlined">error</span>
      <p>No se pudo cargar la información de la comunidad</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const community = ref(null)

const canEdit = computed(() => {
  return authStore.isPresident
})

onMounted(async () => {
  await fetchCommunity()
})

const fetchCommunity = async () => {
  loading.value = true
  try {
    const response = await api.get('/communities/my-community')
    community.value = response.data?.data
    console.log('[MyCommunityView] Comunidad cargada:', community.value)
  } catch (error) {
    console.error('Error al cargar comunidad:', error)
    community.value = null
  } finally {
    loading.value = false
  }
}

const handleEdit = () => {
  if (community.value?._id) {
    router.push(`/admin/communities/${community.value._id}/edit`)
  }
}

const getLeaderName = (leader) => {
  if (!leader) return 'N/A'
  if (typeof leader === 'object' && leader.fullName) {
    return leader.fullName
  }
  return 'N/A'
}

const getLeaderPhone = (leader, whatsapp) => {
  if (whatsapp) return whatsapp
  if (typeof leader === 'object' && leader.phone) {
    return leader.phone
  }
  return null
}
</script>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
  background: var(--surface-container-low);
  min-height: 100vh;
}

@media (max-width: 599px) {
  .page-container {
    padding: 16px;
  }
}

.page-header {
  margin-bottom: 24px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
}

@media (max-width: 599px) {
  .title {
    font-size: 20px;
  }
}

.loading-state,
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.loading-state p,
.no-data p {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0;
}

.no-data .material-symbols-outlined {
  font-size: 48px;
  color: var(--error);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.community-card {
  border-radius: 16px;
  background: var(--surface-container-lowest);
  border: 1px solid var(--surface-container-highest);
}

.community-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px !important;
}

@media (max-width: 599px) {
  .community-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
}

.community-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 40, 142, 0.2);
  flex-shrink: 0;
}

@media (max-width: 599px) {
  .community-icon {
    width: 56px;
    height: 56px;
  }
}

.community-icon .material-symbols-outlined {
  font-size: 32px;
  color: var(--white);
}

.community-info {
  flex: 1;
  min-width: 0;
}

.community-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 4px 0;
}

@media (max-width: 599px) {
  .community-name {
    font-size: 18px;
  }
}

.community-city {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0 0 12px 0;
}

.community-code-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--primary-50);
  border-radius: 8px;
  border: 1px solid var(--primary);
}

.community-code-badge .material-symbols-outlined {
  font-size: 16px;
  color: var(--primary);
}

.community-code-badge span:last-child {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--primary);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

@media (max-width: 599px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--outline);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 14px;
  color: var(--on-surface);
}

.info-value.code {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 0.1em;
}

/* Leaders Grid */
.leaders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

@media (max-width: 599px) {
  .leaders-grid {
    grid-template-columns: 1fr;
  }
}

.leader-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--surface-container);
  border-radius: 12px;
  border: 1px solid var(--surface-container-highest);
}

.leader-icon {
  width: 40px;
  height: 40px;
  background: var(--primary-50);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.leader-icon .material-symbols-outlined {
  font-size: 20px;
  color: var(--primary);
}

.leader-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.leader-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--outline);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.leader-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.leader-phone {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--primary);
  font-weight: 500;
  margin-top: 2px;
}

.leader-phone .material-symbols-outlined {
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 12px;
}

/* Card sections */
.community-card :deep(.q-card__section) {
  background: transparent !important;
}

.community-card :deep(.q-separator) {
  background: var(--surface-container-highest) !important;
}
</style>
