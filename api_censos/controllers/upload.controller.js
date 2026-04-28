import { uploadToCloudinary } from '../middlewares/upload.js';

export const uploadImage = async (req, res) => {
  try {
    // Verificar que se recibio un archivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se recibio ningun archivo'
      });
    }

    // Determinar la carpeta segun el tipo de imagen
    // Si viene de un campo llamado 'signature', va a la carpeta 'firmas'
    const folder = req.body.type === 'signature' ? 'censos/firmas' : 'censos/fachadas';

    // Subir a Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer, folder, req.file.mimetype);

    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir la imagen'
    });
  }
};
