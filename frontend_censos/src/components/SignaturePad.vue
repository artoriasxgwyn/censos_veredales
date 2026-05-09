<template>
  <div class="signature-pad-container">
    <div class="signature-pad-wrapper">
      <canvas
        ref="canvasRef"
        class="signature-pad"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart.prevent="startDrawing"
        @touchmove="draw"
        @touchend="stopDrawing"
      ></canvas>
    </div>

    <div class="signature-actions">
      <q-btn
        flat
        color="negative"
        label="Limpiar"
        icon="delete"
        @click="clearSignature"
        size="sm"
      />
      <q-btn
        flat
        color="primary"
        label="Deshacer"
        icon="undo"
        @click="undoLastStroke"
        size="sm"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import SignaturePad from 'signature_pad'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const canvasRef = ref(null)
let signaturePad = null
let resizeTimeout = null

onMounted(() => {
  if (canvasRef.value) {
    // Esperar a que el DOM esté completamente renderizado
    setTimeout(() => {
      const canvas = canvasRef.value
      // Ajustar el tamaño del canvas
      const parent = canvas.parentElement
      const rect = parent.getBoundingClientRect()

      // Establecer dimensiones CSS
      canvas.style.width = rect.width + 'px'
      canvas.style.height = Math.max(200, rect.width * 0.4) + 'px'

      // Establecer resolución real del canvas (accounting for DPI)
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(Math.max(200, rect.width * 0.4) * dpr)

      // Escalar el contexto para coordenadas correctas
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)

      // Obtener colores del tema CSS
      const style = getComputedStyle(document.documentElement)
      const onSurfaceColor = style.getPropertyValue('--on-surface').trim() || '#000000'

      signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'transparent',
        penColor: onSurfaceColor || 'rgb(0, 0, 0)',
        minWidth: 2,
        maxWidth: 4,
        velocityFilterWeight: 0.7,
        throttle: 0
      })

      // Escuchar cambios en la firma
      signaturePad.addEventListener('endStroke', () => {
        emit('update:modelValue', signaturePad.toDataURL('image/png'))
      })
    }, 100)
  }
})

const startDrawing = () => {
  // SignaturePad maneja esto automáticamente
}

const draw = () => {
  // SignaturePad maneja esto automáticamente
}

const stopDrawing = () => {
  // SignaturePad maneja esto automáticamente
}

const clearSignature = () => {
  if (signaturePad) {
    signaturePad.clear()
    emit('update:modelValue', '')
  }
}

const undoLastStroke = () => {
  if (signaturePad) {
    const data = signaturePad.toData()
    if (data.length > 0) {
      data.pop()
      signaturePad.fromData(data)
      emit('update:modelValue', signaturePad.isEmpty() ? '' : signaturePad.toDataURL('image/png'))
    }
  }
}

watch(() => props.modelValue, (newValue) => {
  if (!newValue && signaturePad) {
    signaturePad.clear()
  }
})

// Manejar resize de ventana
const handleResize = () => {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    if (canvasRef.value && signaturePad) {
      const canvas = canvasRef.value
      const parent = canvas.parentElement
      const rect = parent.getBoundingClientRect()

      // Guardar datos actuales
      const data = signaturePad.toData()

      // Establecer dimensiones CSS
      canvas.style.width = rect.width + 'px'
      canvas.style.height = Math.max(200, rect.width * 0.4) + 'px'

      // Establecer resolución real del canvas
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(Math.max(200, rect.width * 0.4) * dpr)

      // Escalar el contexto
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)

      // Restaurar datos
      signaturePad.fromData(data)
    }
  }, 250)
}

if (typeof window !== 'undefined') {
  window.addEventListener('resize', handleResize)
}
</script>

<style scoped>
.signature-pad-container {
  width: 100%;
}

.signature-pad-wrapper {
  border: 2px solid var(--surface-container-highest);
  border-radius: var(--radius-md);
  background: var(--surface-container-lowest);
  width: 100%;
}

.signature-pad {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-md);
  cursor: crosshair;
}

.signature-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  margin-top: var(--spacing-sm);
}
</style>
