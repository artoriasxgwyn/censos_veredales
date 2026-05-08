<template>
  <div class="map-location-picker">
    <!-- Input con URL -->
    <q-input
      v-model="urlModel"
      :label="label"
      outlined
      type="url"
      :hint="hint"
      :error="error"
      :error-message="errorMessage"
      readonly
    >
      <template v-slot:prepend>
        <q-icon name="map" />
      </template>
      <template v-slot:append>
        <q-btn
          v-if="urlModel"
          flat
          dense
          round
          icon="clear"
          @click="clearLocation"
          color="grey"
        >
          <q-tooltip>Limpiar ubicación</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          round
          icon="my_location"
          @click="useCurrentLocation"
          :loading="gettingLocation"
          color="primary"
        >
          <q-tooltip>Usar mi ubicación actual</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          round
          icon="place"
          @click="openMapDialog"
          color="secondary"
        >
          <q-tooltip>Seleccionar en el mapa</q-tooltip>
        </q-btn>
      </template>
    </q-input>

    <!-- Diálogo del mapa -->
    <q-dialog v-model="showMapDialog" maximized>
      <q-card class="map-dialog-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Seleccionar Ubicación</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="map-container">
          <!-- Mapa Leaflet -->
          <div ref="mapContainer" class="leaflet-map"></div>
        </q-card-section>

        <q-card-actions align="center" class="map-actions">
          <div class="coordinates-display">
            <q-badge color="primary">
              Lat: {{ selectedLat.toFixed(6) }} | Lng: {{ selectedLng.toFixed(6) }}
            </q-badge>
          </div>
          <q-btn
            color="primary"
            label="Confirmar Ubicación"
            icon="check"
            @click="confirmLocation"
            :disable="!hasSelectedLocation"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { geolocationService } from '@/services/geolocation.service'

const props = defineProps({
  modelValue: String,
  label: {
    type: String,
    default: 'URL de Ubicación en Mapa (Google Maps)'
  },
  hint: {
    type: String,
    default: 'Haz clic en el botón "Seleccionar en el mapa" para elegir la ubicación'
  },
  error: Boolean,
  errorMessage: String
})

const emit = defineEmits(['update:modelValue'])

const $q = useQuasar()

// Estados
const urlModel = computed({
  get: () => props.modelValue || '',
  set: (value) => emit('update:modelValue', value)
})

const showMapDialog = ref(false)
const gettingLocation = ref(false)
const selectedLat = ref(4.7110) // Bogotá por defecto
const selectedLng = ref(-74.0721)
const mapContainer = ref(null)
let map = null
let marker = null

const hasSelectedLocation = computed(() => {
  return selectedLat.value !== 4.7110 || selectedLng.value !== -74.0721
})

// Cargar Leaflet dinámicamente
const loadLeaflet = () => {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve(window.L)
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    link.onload = () => {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => resolve(window.L)
      script.onerror = reject
      document.head.appendChild(script)
    }
    link.onerror = reject
    document.head.appendChild(link)
  })
}

// Inicializar mapa
const initMap = async () => {
  try {
    const L = await loadLeaflet()

    if (!mapContainer.value) return

    // Crear mapa
    map = L.map(mapContainer.value).setView([selectedLat.value, selectedLng.value], 13)

    // Capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    // Marker arrastrable
    marker = L.marker([selectedLat.value, selectedLng.value], {
      draggable: true
    }).addTo(map)

    // Actualizar coordenadas al arrastrar
    marker.on('dragend', (e) => {
      const position = e.target.getLatLng()
      selectedLat.value = position.lat
      selectedLng.value = position.lng
    })

    // Click en el mapa para mover el marker
    map.on('click', (e) => {
      selectedLat.value = e.latlng.lat
      selectedLng.value = e.latlng.lng
      marker.setLatLng(e.latlng)
    })
  } catch (error) {
    console.error('Error cargando Leaflet:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el mapa'
    })
  }
}

// Abrir diálogo del mapa
const openMapDialog = async () => {
  showMapDialog.value = true

  // Si hay una URL guardada, extraer coordenadas
  if (props.modelValue) {
    const coords = extractCoordinates(props.modelValue)
    if (coords) {
      selectedLat.value = coords.lat
      selectedLng.value = coords.lng
    }
  }

  await nextTick()
  await initMap()

  // Invalidar tamaño del mapa después de renderizar
  setTimeout(() => {
    if (map) {
      map.invalidateSize()
    }
  }, 100)
}

// Extraer coordenadas de URL de Google Maps
const extractCoordinates = (url) => {
  const pattern = /q=(-?\d+\.?\d*),(-?\d+\.?\d*)/i
  const match = url.match(pattern)
  if (match) {
    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2])
    }
  }
  return null
}

// Confirmar ubicación seleccionada
const confirmLocation = () => {
  urlModel.value = geolocationService.generateGoogleMapsUrl(selectedLat.value, selectedLng.value)
  showMapDialog.value = false

  $q.notify({
    type: 'positive',
    message: 'Ubicación seleccionada exitosamente',
    timeout: 2000
  })
}

// Usar ubicación actual
const useCurrentLocation = async () => {
  gettingLocation.value = true
  try {
    const url = await geolocationService.getLocationUrl()
    urlModel.value = url

    $q.notify({
      type: 'positive',
      message: 'Ubicación actual obtenida exitosamente',
      timeout: 2000
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al obtener ubicación',
      timeout: 4000
    })
  } finally {
    gettingLocation.value = false
  }
}

// Limpiar ubicación
const clearLocation = () => {
  urlModel.value = ''
}

// Limpiar mapa al cerrar diálogo
watch(showMapDialog, (newVal) => {
  if (!newVal && map) {
    map.remove()
    map = null
    marker = null
  }
})
</script>

<style scoped>
.map-location-picker {
  width: 100%;
}

.map-location-picker :deep(.q-field__label) {
  color: #ffffff !important;
}

.map-location-picker :deep(.q-field__native) {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

.map-location-picker :deep(.q-field__native::placeholder) {
  color: #ffffff !important;
}

.map-location-picker :deep(.q-field__messages div),
.map-location-picker :deep(.q-field__hint) {
  color: #e2e8f0 !important;
}

.map-location-picker :deep(.q-field__prepend .q-icon),
.map-location-picker :deep(.q-field__append .q-icon) {
  color: #ffffff !important;
}

/* Bordes de inputs manejados globalmente en style.css */

.map-dialog-card {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
}

.map-container {
  flex: 1;
  min-height: 400px;
  padding: 0;
}

.leaflet-map {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.map-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid var(--border);
}

.coordinates-display {
  font-family: monospace;
  font-size: 14px;
}
</style>
