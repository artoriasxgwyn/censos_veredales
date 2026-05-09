<template>
  <div class="page-container">
    <div class="page-header">
      <q-btn
        flat
        icon="arrow_back"
        label="Volver"
        @click="router.back()"
      />
      <h1 class="title">Nueva Comunidad</h1>
    </div>

    <q-card class="form-card">
      <q-card-section>
        <h2 class="section-title">Información de la Comunidad</h2>
        <p class="section-description">
          Crea una nueva comunidad. Se generará automáticamente un usuario presidente asociado.
        </p>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="form">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.neighborhood"
                label="Nombre del Barrio"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="location_city" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.department"
                :options="departamentos"
                label="Departamento"
                outlined
                emit-value
                map-options
                @update:model-value="onDepartmentChange"
              >
                <template v-slot:prepend>
                  <q-icon name="map" />
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.city"
                :options="municipiosOptions"
                label="Ciudad / Municipio"
                outlined
                emit-value
                map-options
                :disable="!form.department"
              >
                <template v-slot:prepend>
                  <q-icon name="public" />
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model.number="form.estimatedResidentCount"
                label="Número Estimado de Residentes"
                type="number"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="people" />
                </template>
              </q-input>
            </div>

            <div class="col-12">
              <q-input
                v-model="form.communityHallAddress"
                label="Dirección del Salón Comunal"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="location_on" />
                </template>
              </q-input>
            </div>

            <div class="col-12">
              <MapLocationPicker
                v-model="form.mapLocation"
                label="Ubicación del salón comunal"
                hint="Haz clic en el mapa para seleccionar la ubicación exacta"
                :error="false"
              />
            </div>
          </div>

          <q-separator class="my-4" />

          <h2 class="section-title">Información del Presidente</h2>
          <p class="section-description">
            El presidente tendrá acceso administrativo completo a esta comunidad.
          </p>

          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="president.fullName"
                label="Nombre Completo"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="president.documentNumber"
                label="Número de Documento"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="badge" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="president.birthDate"
                label="Fecha de Nacimiento"
                type="date"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_today" />
                </template>
              </q-input>
            </div>

            <div class="col-12">
              <q-input
                v-model="president.phone"
                label="Teléfono"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="phone" />
                </template>
              </q-input>
            </div>

            <div class="col-12">
              <q-input
                v-model="president.email"
                label="Correo Electrónico"
                type="text"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
            </div>

            <div class="col-12">
              <q-input
                v-model="president.password"
                label="Contraseña"
                :type="isPwd ? 'password' : 'text'"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>
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
              label="Crear Comunidad"
              :loading="communityStore.loading"
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
import { useCommunityStore } from '@/stores/community.store'
import { useAuthStore } from '@/stores/auth.store'
import { departamentos, getMunicipios } from '@/data/colombia'
import MapLocationPicker from '@/components/MapLocationPicker.vue'

const router = useRouter()
const $q = useQuasar()
const communityStore = useCommunityStore()
const authStore = useAuthStore()

onMounted(() => {
  if (!authStore.hasPermission('community', 'create')) {
    $q.notify({
      type: 'negative',
      message: 'Acceso denegado. No tienes permisos para crear comunidades.'
    })
    router.push('/admin/dashboard')
  }
})

const isPwd = ref(true)

const form = ref({
  neighborhood: '',
  city: '',
  department: '',
  communityHallAddress: '',
  mapLocation: '',
  estimatedResidentCount: null
})

const municipiosOptions = computed(() => {
  return form.value.department ? getMunicipios(form.value.department) : []
})

const onDepartmentChange = () => {
  form.value.city = ''
}

const president = ref({
  fullName: '',
  documentNumber: '',
  birthDate: '',
  phone: '',
  email: '',
  password: ''
})

const handleSubmit = async () => {
  const communityData = {
    neighborhood: form.value.neighborhood,
    city: form.value.city,
    department: form.value.department,
    communityHallAddress: form.value.communityHallAddress,
    mapLocation: form.value.mapLocation || undefined,
    estimatedResidentCount: form.value.estimatedResidentCount || undefined,
    president: {
      fullName: president.value.fullName,
      documentNumber: president.value.documentNumber,
      birthDate: president.value.birthDate || undefined,
      phone: president.value.phone,
      email: president.value.email,
      password: president.value.password
    }
  }

  const result = await communityStore.createCommunity(communityData)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Comunidad creada exitosamente',
      caption: 'El código de comunidad se ha generado automáticamente',
      timeout: 4000
    })
    router.push('/admin/communities')
  } else {
    const errorMsg = result.message || ''

    if (errorMsg.toLowerCase().includes('correo') || errorMsg.toLowerCase().includes('email')) {
      $q.notify({
        type: 'negative',
        message: 'El correo del presidente ya está registrado',
        caption: 'Usa otro correo o registra al presidente primero',
        timeout: 4000
      })
    } else if (errorMsg.toLowerCase().includes('documento')) {
      $q.notify({
        type: 'negative',
        message: 'El documento del presidente ya está registrado',
        caption: 'Verifica el número de documento',
        timeout: 4000
      })
    } else if (errorMsg.toLowerCase().includes('código') || errorMsg.toLowerCase().includes('codigo') || errorMsg.toLowerCase().includes('duplicado')) {
      $q.notify({
        type: 'negative',
        message: 'Ya existe una comunidad con este código',
        caption: 'Intenta con otro nombre de comunidad',
        timeout: 4000
      })
    } else if (errorMsg.toLowerCase().includes('permiso') || errorMsg.toLowerCase().includes('autorización')) {
      $q.notify({
        type: 'negative',
        message: 'No tienes permisos para crear comunidades',
        caption: 'Se requiere autorización de super administrador',
        timeout: 4000
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Error al crear comunidad',
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

.my-4 {
  margin: 16px 0;
  border-top: 1px solid var(--border);
  padding-top: 16px;
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

:deep(.form-card .q-select .q-field__native) {
  color: #ffffff !important;
}

/* Bordes de inputs manejados globalmente en style.css */

/* Ajustar icono de fecha */
:deep(input[type="date"]::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}
</style>
