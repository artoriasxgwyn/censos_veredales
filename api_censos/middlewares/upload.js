import dotenv from 'dotenv';
dotenv.config();

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary - verificar que las variables estén cargadas
console.log('=== CLOUDINARY CONFIG ===');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || 'NO DEFINIDA');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '***' : 'NO DEFINIDA');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '***' : 'NO DEFINIDA');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar multer para guardar en memoria
const storage = multer.memoryStorage();

// Filtro para validar que solo se suban imagenes
const fileFilter = (req, file, cb) => {
  console.log('=== MULTER FILE FILTER ===');
  console.log('Fieldname:', file.fieldname);
  console.log('Original name:', file.originalname);
  console.log('Mimetype:', file.mimetype);
  console.log('Size:', file.size);

  if (!file.mimetype) {
    console.log('REJECTED: No mimetype');
    cb(new Error('No se detectó el tipo de archivo'), false);
    return;
  }

  if (!file.mimetype.startsWith('image/')) {
    console.log('REJECTED: Not an image:', file.mimetype);
    cb(new Error('Solo se permiten archivos de imagen: ' + file.mimetype), false);
    return;
  }

  console.log('ACCEPTED');
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Manejador de errores de multer
export const handleMulterError = (err, req, res, next) => {
  console.error('=== MULTER ERROR ===');
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'El archivo excede el tamaño máximo de 5MB'
    });
  }
  next(err);
};

/**
 * Sube un archivo a Cloudinary
 * @param {Buffer} fileBuffer - Buffer del archivo
 * @param {string} folder - Carpeta en Cloudinary
 * @param {string} mimetype - Tipo MIME del archivo
 * @returns {Promise<string>} - URL segura de la imagen
 */
export const uploadToCloudinary = async (fileBuffer, folder = 'censos', mimetype = 'image/jpeg') => {
  return new Promise((resolve, reject) => {
    // Cloudinary acepta buffers directamente - no necesita dataURI
    cloudinary.uploader.upload_stream({
      folder,
      resource_type: 'image',
      use_filename: true,
      unique_filename: true
    }, (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        reject(error);
      } else {
        resolve(result.secure_url);
      }
    }).end(fileBuffer);
  });
};
