<template>
  <div class="qr-scanner">
    <div class="scanner-header">
      <h3 class="scanner-title">
        <span class="material-symbols-outlined">qr_code_scanner</span>
        Escáner QR
      </h3>
    </div>

    <!-- Camera View -->
    <div class="camera-container" v-if="!useManualEntry">
      <div class="camera-wrapper">
        <video ref="videoElement" class="video-element" autoplay playsinline></video>
        <div class="scan-overlay">
          <div class="scan-frame"></div>
        </div>
      </div>

      <div class="camera-actions">
        <q-btn
          color="primary"
          label="Usar Entrada Manual"
          icon="keyboard"
          @click="toggleEntryMode"
          class="full-width"
        />
      </div>

      <div v-if="scanError" class="error-message">
        <span class="material-symbols-outlined">error</span>
        {{ scanError }}
      </div>

      <div v-if="!cameraPermission" class="permission-message">
        <span class="material-symbols-outlined">cameraswitch</span>
        <p>Permiso de cámara requerido</p>
        <q-btn
          color="primary"
          label="Solicitar Permiso"
          @click="startCamera"
          class="full-width"
        />
      </div>
    </div>

    <!-- Manual Entry -->
    <div v-else class="manual-entry">
      <q-input
        v-model="manualCode"
        label="Código QR de la carta"
        placeholder="LETTER-XXXXXXXX"
        outlined
        @keyup.enter="handleManualSubmit"
      >
        <template v-slot:prepend>
          <span class="material-symbols-outlined">qr_code</span>
        </template>
        <template v-slot:append>
          <q-btn
            flat
            round
            dense
            icon="send"
            @click="handleManualSubmit"
            :disabled="!manualCode"
          />
        </template>
      </q-input>

      <div class="manual-actions">
        <q-btn
          color="secondary"
          label="Volver a Cámara"
          icon="qr_code_scanner"
          @click="toggleEntryMode"
          class="full-width"
        />
      </div>

      <div class="format-help">
        <span class="material-symbols-outlined">info</span>
        <p>Formato: LETTER-XXXXXXXX (8 caracteres alfanuméricos)</p>
      </div>
    </div>

    <!-- Scan Result Dialog -->
    <q-dialog v-model="showResult" persistent>
      <q-card class="result-card">
        <q-card-section class="result-header" :class="resultStatus">
          <span class="material-symbols-outlined result-icon">
            {{ resultStatus === 'success' ? 'check_circle' : 'error' }}
          </span>
          <h4 class="result-title">{{ resultTitle }}</h4>
        </q-card-section>

        <q-card-section v-if="scannedData" class="result-body">
          <div class="result-row">
            <span class="result-label">Tipo:</span>
            <span class="result-value">{{ scannedData.type }}</span>
          </div>
          <div class="result-row">
            <span class="result-label">Código:</span>
            <span class="result-value">{{ scannedData.qrCodigo }}</span>
          </div>
          <div class="result-row">
            <span class="result-label">Emitido:</span>
            <span class="result-value">{{ formatDate(scannedData.issuedAt) }}</span>
          </div>
          <div class="result-row" v-if="scannedData.resident">
            <span class="result-label">Residente:</span>
            <span class="result-value">{{ scannedData.resident.fullName || 'N/A' }}</span>
          </div>
          <div class="result-row" v-if="scannedData.community">
            <span class="result-label">Comunidad:</span>
            <span class="result-value">{{ scannedData.community.neighborhood }}</span>
          </div>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn
            color="primary"
            label="Cerrar"
            @click="closeResult"
            class="full-width"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { letterService } from '@/services/letter.service'
import jsQR from 'jsqr/dist/jsQR.js'

const $q = useQuasar()

const videoElement = ref(null)
const useManualEntry = ref(false)
const manualCode = ref('')
const scanError = ref('')
const cameraPermission = ref(true)
const showResult = ref(false)
const resultStatus = ref('success')
const resultTitle = ref('')
const scannedData = ref(null)

let stream = null
let animationFrame = null

const emit = defineEmits(['code-scanned'])

const startCamera = async () => {
  scanError.value = ''
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' } // Use back camera
    })
    cameraPermission.value = true

    if (videoElement.value) {
      videoElement.value.srcObject = stream
      videoElement.value.onloadedmetadata = () => {
        videoElement.value.play()
        requestAnimationFrame(tick)
      }
    }
  } catch (err) {
    console.error('Error accessing camera:', err)
    cameraPermission.value = false
    scanError.value = 'No se pudo acceder a la cámara. Verifique los permisos.'
  }
}

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
}

const tick = () => {
  if (!videoElement.value || !stream) return

  const video = videoElement.value
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code) {
        handleScan(code.data)
        return
      }
    } catch (err) {
      console.error('Error scanning QR:', err)
      scanError.value = 'Error al escanear código QR'
    }
  }

  animationFrame = requestAnimationFrame(tick)
}

const handleScan = (code) => {
  // Stop scanning temporarily
  stopCamera()

  // Validate code format
  if (!code || !code.startsWith('LETTER-')) {
    resultStatus.value = 'error'
    resultTitle.value = 'Código QR Inválido'
    scannedData.value = null
    showResult.value = true
    return
  }

  // Fetch letter data
  fetchLetterData(code)
}

const fetchLetterData = async (qrCode) => {
  const loading = $q.loading.show({ message: 'Verificando carta...' })

  try {
    const response = await letterService.verifyByQr(qrCode)
    scannedData.value = response.data
    resultStatus.value = 'success'
    resultTitle.value = 'Carta Válida'
    showResult.value = true

    emit('code-scanned', { code: qrCode, data: response.data })
  } catch (error) {
    resultStatus.value = 'error'
    resultTitle.value = error.response?.data?.message || 'Código no encontrado'
    scannedData.value = null
    showResult.value = true
  } finally {
    loading.hide()
  }
}

const handleManualSubmit = async () => {
  if (!manualCode.value.trim()) return

  const code = manualCode.value.trim().toUpperCase()

  if (!code.startsWith('LETTER-')) {
    $q.notify({
      type: 'negative',
      message: 'Formato inválido. Debe comenzar con LETTER-'
    })
    return
  }

  handleScan(code)
}

const toggleEntryMode = () => {
  useManualEntry.value = !useManualEntry.value
  if (!useManualEntry.value) {
    startCamera()
  }
}

const closeResult = () => {
  showResult.value = false
  scannedData.value = null
  if (!useManualEntry.value) {
    startCamera()
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(() => {
  startCamera()
})

onUnmounted(() => {
  stopCamera()
})
</script>

<style scoped>
.qr-scanner {
  background: var(--surface);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 16px 32px rgba(25, 28, 30, 0.06);
}

.scanner-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.scanner-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.scanner-title .material-symbols-outlined {
  color: var(--primary);
}

/* Camera */
.camera-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.camera-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface-container-lowest);
}

.video-element {
  width: 100%;
  height: auto;
  display: block;
}

.scan-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scan-frame {
  width: 200px;
  height: 200px;
  border: 3px solid var(--primary);
  border-radius: 12px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.camera-actions {
  padding: 0 24px;
}

.full-width {
  width: 100%;
}

/* Manual Entry */
.manual-entry {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 400px;
  margin: 0 auto;
}

.manual-actions {
  padding: 0 24px;
}

.format-help {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--primary-fixed-dim);
  border-radius: 8px;
  font-size: 13px;
  color: var(--on-surface-variant);
}

.format-help .material-symbols-outlined {
  font-size: 18px;
  color: var(--primary);
}

.format-help p {
  margin: 0;
}

/* Error & Permission Messages */
.error-message,
.permission-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: var(--error-container);
  border-radius: 12px;
  text-align: center;
}

.error-message .material-symbols-outlined,
.permission-message .material-symbols-outlined {
  font-size: 48px;
  color: var(--on-error-container);
}

.error-message {
  color: var(--on-error-container);
}

.permission-message {
  background: var(--surface-container);
}

.permission-message p {
  margin: 0;
  font-size: 14px;
  color: var(--on-surface);
}

/* Result Dialog */
.result-card {
  border-radius: 16px !important;
  overflow: hidden;
  min-width: 320px;
}

.result-header {
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.result-header.success {
  background: linear-gradient(135deg, var(--primary-fixed) 0%, var(--primary-fixed-dim) 100%);
}

.result-header.error {
  background: linear-gradient(135deg, var(--error-container) 0%, var(--error-container-light) 100%);
}

.result-icon {
  font-size: 64px;
}

.result-header.success .result-icon {
  color: var(--primary);
}

.result-header.error .result-icon {
  color: var(--on-error-container);
}

.result-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.result-header.success .result-title {
  color: var(--primary);
}

.result-header.error .result-title {
  color: var(--on-error-container);
}

.result-body {
  padding: 24px;
}

.result-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--surface-container-highest);
}

.result-row:last-child {
  border-bottom: none;
}

.result-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.result-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--on-surface);
  text-align: right;
  max-width: 60%;
}
</style>
