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

onMounted(() => {
  if (canvasRef.value) {
    // Esperar a que el DOM esté completamente renderizado
    setTimeout(() => {
      const canvas = canvasRef.value
      // Ajustar el tamaño del canvas
      const parent = canvas.parentElement
      canvas.width = parent.clientWidth
      canvas.height = 200

      signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        penColor: 'rgb(0, 0, 0)',
        minWidth: 2,
        maxWidth: 4
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
</script>

<style scoped>
.signature-pad-container {
  width: 100%;
}

.signature-pad-wrapper {
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  width: 100%;
}

.signature-pad {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  cursor: crosshair;
}

.signature-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
