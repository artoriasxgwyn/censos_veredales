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
              <q-input
                v-model="form.city"
                label="Ciudad"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="public" />
                </template>
              </q-input>
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
              <q-input
                v-model="form.mapLocation"
                label="URL de Ubicación en Mapa (Google Maps, etc.)"
                outlined
                type="url"
              >
                <template v-slot:prepend>
                  <q-icon name="map" />
                </template>
              </q-input>
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
                type="email"
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCommunityStore } from '@/stores/community.store'

const router = useRouter()
const $q = useQuasar()
const communityStore = useCommunityStore()

const isPwd = ref(true)

const form = ref({
  neighborhood: '',
  city: '',
  communityHallAddress: '',
  mapLocation: '',
  estimatedResidentCount: null
})

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
  gap: 8px;
}

.my-4 {
  margin: 16px 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>
