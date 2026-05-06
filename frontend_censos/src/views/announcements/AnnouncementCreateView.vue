<template>
  <div class="page-container">
    <div class="page-header">
      <q-btn
        flat
        icon="arrow_back"
        label="Volver"
        @click="router.back()"
      />
      <h1 class="title">Crear Anuncio</h1>
    </div>

    <q-card class="form-card">
      <q-card-section>
        <h2 class="section-title">Información del Anuncio</h2>
        <p class="section-description">
          Crea un nuevo anuncio para la comunidad. Puedes guardarlo como borrador o publicarlo inmediatamente.
        </p>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="form">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.title"
                label="Título del Anuncio"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="title" />
                </template>
              </q-input>
            </div>

            <div class="col-12">
              <q-input
                v-model="form.header"
                label="Encabezado"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="article" />
                </template>
              </q-input>
            </div>

            <div class="col-12">
              <q-editor
                v-model="form.body"
                label="Cuerpo del mensaje"
                outlined
                min-height="200px"
              />
            </div>

            <div class="col-12">
              <q-toggle
                v-model="form.isPublished"
                label="Publicar inmediatamente"
              />
              <p class="toggle-help">
                {{ form.isPublished
                  ? 'El anuncio será visible para todos los residentes inmediatamente.'
                  : 'El anuncio se guardará como borrador y podrá publicarse más tarde.'
                }}
              </p>
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
              label="Guardar Anuncio"
              :loading="announcementStore.loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAnnouncementStore } from '@/stores/announcement.store'

const router = useRouter()
const $q = useQuasar()
const announcementStore = useAnnouncementStore()

const form = ref({
  title: '',
  header: '',
  body: '',
  isPublished: false
})

const handleSubmit = async () => {
  const announcementData = {
    title: form.value.title,
    header: form.value.header,
    body: form.value.body,
    publishedAt: form.value.isPublished ? new Date().toISOString() : null
  }

  const result = await announcementStore.createAnnouncement(announcementData)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: form.value.isPublished ? 'Anuncio publicado exitosamente' : 'Borrador guardado exitosamente',
      caption: form.value.isPublished
        ? 'El anuncio ya es visible para todos los residentes'
        : 'Puedes publicarlo más tarde desde la lista de anuncios',
      timeout: 4000
    })
    router.push('/admin/announcements')
  } else {
    const errorMsg = result.message || ''

    if (errorMsg.toLowerCase().includes('permiso') || errorMsg.toLowerCase().includes('autorización')) {
      $q.notify({
        type: 'negative',
        message: 'No tienes permisos para crear anuncios',
        caption: 'Se requiere autorización de administrador',
        timeout: 4000
      })
    } else if (errorMsg.toLowerCase().includes('título') || errorMsg.toLowerCase().includes('encabezado') || errorMsg.toLowerCase().includes('contenido')) {
      $q.notify({
        type: 'negative',
        message: 'Campos incompletos',
        caption: errorMsg,
        timeout: 4000
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Error al crear anuncio',
        caption: errorMsg,
        timeout: 5000
      })
    }
  }
}
</script>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
  background: var(--background-dark);
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
}

.page-header .title {
  color: var(--white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.page-header .q-btn {
  color: var(--white);
}

@media (max-width: 599px) {
  .page-header {
    gap: 8px;
    margin-bottom: 16px;
    padding: 16px;
  }

  .page-header .title {
    font-size: 20px;
  }
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  flex: 1;
}

.form-card {
  border-radius: 12px;
  background: var(--surface-container);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--on-surface-strong);
  margin: 0 0 8px 0;
  border-bottom: 2px solid var(--primary);
  padding-bottom: 8px;
}

.section-description {
  font-size: 14px;
  color: var(--on-surface-variant);
  margin: 0 0 24px 0;
  padding-left: 8px;
  border-left: 3px solid var(--primary-light);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toggle-help {
  font-size: 12px;
  color: #e2e8f0;
  margin: 8px 0 0 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

/* Botón de cancelar con estilo outline */
:deep(.form-actions .q-btn--flat) {
  border: 1px solid var(--outline);
  color: var(--on-surface);
}

:deep(.form-actions .q-btn--flat:hover) {
  background: var(--surface-container-high);
  border-color: var(--on-surface-variant);
}

/* Textos en blanco para inputs y labels */
:deep(.form-card .q-field--outlined .q-field__label) {
  color: #ffffff !important;
}

:deep(.form-card .q-field--outlined .q-field__native::placeholder) {
  color: #ffffff !important;
}

:deep(.form-card .q-field--outlined .q-field__native),
:deep(.form-card .q-field--outlined .q-textarea .q-field__native) {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

:deep(.form-card .q-field__messages div),
:deep(.form-card .q-field__hint) {
  color: #e2e8f0 !important;
}

:deep(.form-card .q-field__prepend .q-icon),
:deep(.form-card .q-field__append .q-icon) {
  color: #ffffff !important;
}

/* Quitar TODO borde azul en hover/focus */
:deep(.form-card .q-field--outlined .q-field__control) {
  border: 1px solid var(--outline) !important;
  border-radius: 4px;
}

:deep(.form-card .q-field--outlined:hover .q-field__control),
:deep(.form-card .q-field--outlined.q-field--focused .q-field__control) {
  border-color: var(--outline) !important;
}

:deep(.form-card .q-field--outlined .q-field__control:before),
:deep(.form-card .q-field--outlined .q-field__control:after) {
  border: none !important;
  display: none !important;
}

:deep(.form-card .q-field--focused .q-field__label) {
  color: #ffffff !important;
}

/* Q-toggle label blanco */
:deep(.form-card .q-toggle__label) {
  color: #ffffff !important;
}

/* Editor styles */
:deep(.q-editor) {
  border-radius: 8px;
  border: 1px solid var(--outline);
}

:deep(.q-editor__toolbar) {
  background: var(--surface-container-high) !important;
  border-bottom: 1px solid var(--border);
}

:deep(.q-editor__toolbar .q-icon) {
  color: #ffffff !important;
}

:deep(.q-editor__content) {
  min-height: 150px;
  background: var(--surface-container-lowest) !important;
  color: #ffffff !important;
}
</style>
