import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
})

export const uploadService = {
  /**
   * Sube una imagen a Cloudinary
   * @param {File} file - Archivo de imagen a subir
   * @param {string} type - Tipo de imagen: 'signature' o 'facade'
   * @returns {Promise<string>} - URL de la imagen en Cloudinary
   */
  async uploadImage(file, type = 'facade') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    // No pasar headers - axios detecta FormData y pone multipart/form-data automáticamente
    const response = await api.post('/upload', formData)

    return response.data.data.url
  }
}
