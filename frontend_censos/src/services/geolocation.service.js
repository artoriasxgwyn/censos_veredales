/**
 * Servicio de geolocalización para obtener coordenadas GPS
 * y generar URLs de Google Maps
 */

export const geolocationService = {
  /**
   * Obtiene la ubicación actual del usuario usando la Geolocation API
   * @returns {Promise<{lat: number, lng: number}>}
   */
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La geolocalización no es soportada por tu navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Permiso denegado. Debes permitir el acceso a la ubicación.'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Información de ubicación no disponible.'));
              break;
            case error.TIMEOUT:
              reject(new Error('Tiempo de espera agotado. Intenta nuevamente.'));
              break;
            default:
              reject(new Error('Error desconocido al obtener ubicación.'));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  },

  /**
   * Genera una URL de Google Maps a partir de coordenadas
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @returns {string} URL de Google Maps
   */
  generateGoogleMapsUrl(lat, lng) {
    return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
  },

  /**
   * Obtiene la ubicación y genera la URL de Google Maps
   * @returns {Promise<string>} URL de Google Maps
   */
  async getLocationUrl() {
    const position = await this.getCurrentPosition();
    return this.generateGoogleMapsUrl(position.lat, position.lng);
  },

  /**
   * Valida que una URL sea de Google Maps con coordenadas válidas
   * @param {string} url - URL a validar
   * @returns {boolean}
   */
  isValidGoogleMapsUrl(url) {
    if (!url) return false;
    const googleMapsPattern = /^https:\/\/(www\.)?google\.com\/maps\?.*q=-?\d+\.?\d*,-?\d+\.?\d*/i;
    return googleMapsPattern.test(url);
  }
};
