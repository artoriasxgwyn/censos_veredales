<template>
  <div class="page-container">
    <div class="page-header">
      <q-btn
        flat
        icon="arrow_back"
        label="Volver"
        @click="router.back()"
      />
      <h1 class="title">Solicitar Carta</h1>
    </div>

    <q-card class="form-card">
      <q-card-section>
        <h2 class="section-title">Tipo de Carta</h2>
        <p class="section-description">
          Selecciona el tipo de carta que necesitas. La carta normal requiere aprobación triple.
          La carta juramentada requiere al menos 1 año de antigüedad como residente.
        </p>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="form">
          <div class="type-selection">
            <q-card
              class="type-card"
              :class="{ selected: form.type === 'normal' }"
              @click="form.type = 'normal'"
            >
              <q-card-section>
                <div class="type-icon">
                  <span class="material-symbols-outlined">description</span>
                </div>
                <h3 class="type-title">Carta Normal</h3>
                <p class="type-description">
                  Carta de residencia estándar. Requiere aprobación del presidente, tesorero y secretario.
                </p>
              </q-card-section>
            </q-card>

            <q-card
              class="type-card"
              :class="{ selected: form.type === 'juramentada' }"
              @click="form.type = 'juramentada'"
            >
              <q-card-section>
                <div class="type-icon">
                  <span class="material-symbols-outlined">verified</span>
                </div>
                <h3 class="type-title">Carta Juramentada</h3>
                <p class="type-description">
                  Carta juramentada para residentes con más de 1 año de antigüedad.
                </p>
              </q-card-section>
            </q-card>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="form.residentId"
                :options="residentOptions"
                option-value="_id"
                option-label="userId"
                label="Residente"
                outlined
                emit-value
                map-options
                :rules="[val => !!val || 'El residente es requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-select>
            </div>
          </div>

          <div class="form-actions">
            <q-btn
              color="grey"
              label="Cancelar"
              flat
              @click="router.back()"
            />
            <q-btn
              type="submit"
              color="primary"
              label="Solicitar Carta"
              :loading="letterStore.loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useLetterStore } from '@/stores/letter.store'
import { useResidentStore } from '@/stores/resident.store'

const router = useRouter()
const $q = useQuasar()
const letterStore = useLetterStore()
const residentStore = useResidentStore()

const form = ref({
  type: 'normal',
  residentId: ''
})

const residentOptions = computed(() => {
  return residentStore.approvedResidents.map(r => ({
    _id: r._id,
    userId: typeof r.userId === 'object' ? r.userId.fullName : 'Residente'
  }))
})

onMounted(async () => {
  await residentStore.fetchResidents()
})

const handleSubmit = async () => {
  const letterData = {
    type: form.value.type,
    residentId: form.value.residentId
  }

  const result = await letterStore.requestLetter(letterData)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Carta solicitada exitosamente. Pendiente de aprobación.'
    })
    router.push('/resident/letters')
  } else {
    $q.notify({
      type: 'negative',
      message: result.message || 'Error al solicitar carta'
    })
  }
}
</script>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
  flex: 1;
}

.form-card {
  border-radius: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 8px 0;
}

.section-description {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0 0 24px 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.type-selection {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.type-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid var(--surface-container-highest);
}

.type-card:hover {
  border-color: var(--tertiary);
}

.type-card.selected {
  border-color: var(--tertiary);
  background: var(--tertiary-fixed);
}

.type-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.type-icon .material-symbols-outlined {
  font-size: 28px;
  color: var(--on-primary);
}

.type-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 8px 0;
}

.type-description {
  font-size: 13px;
  color: var(--outline);
  margin: 0;
  line-height: 1.5;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>
