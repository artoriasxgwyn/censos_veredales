import api from './api'

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

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data.data.url
  }
}
