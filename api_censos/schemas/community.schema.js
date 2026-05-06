import { z } from 'zod';

// Validación para URL de Google Maps con coordenadas
const googleMapsUrlSchema = z.string().url('Debe ser una URL válida').refine(
  (url) => {
    const googleMapsPattern = /^https:\/\/(www\.)?google\.com\/maps\?.*q=-?\d+\.?\d*,-?\d+\.?\d*/i;
    return googleMapsPattern.test(url);
  },
  { message: 'Debe ser una URL de Google Maps con coordenadas (ej: https://www.google.com/maps?q=7.123,-73.123)' }
);

export const createCommunitySchema = z.object({
  neighborhood: z.string().min(1, 'El barrio es requerido'),
  city: z.string().min(1, 'La ciudad es requerida'),
  department: z.string().min(1, 'El departamento es requerido'),
  communityHallAddress: z.string().min(1, 'La dirección del salón comunal es requerida'),
  mapLocation: googleMapsUrlSchema.optional(),
  estimatedResidentCount: z.number().positive('Debe ser un número positivo').optional(),
  president: z.object({
    fullName: z.string().min(1, 'El nombre completo es requerido'),
    documentNumber: z.string().regex(/^\d{6,10}$/, 'La cédula debe contener solo números (6-10 dígitos)'),
    birthDate: z.string().optional(),
    phone: z.string().regex(/^3\d{9}$/, 'El teléfono debe ser un número colombiano válido (ej: 3001234567)'),
    email: z.string().email('Email inválido'),
    signature: z.string().optional(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
  })
});

export const updateCommunitySchema = z.object({
  neighborhood: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  communityHallAddress: z.string().min(1).optional(),
  mapLocation: googleMapsUrlSchema.optional(),
  estimatedResidentCount: z.number().positive().optional(),
  isActive: z.boolean().optional()
});
