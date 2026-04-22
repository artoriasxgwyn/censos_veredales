import { z } from 'zod';

export const createCommunitySchema = z.object({
  neighborhood: z.string().min(1, 'El barrio es requerido'),
  city: z.string().min(1, 'La ciudad es requerida'),
  communityHallAddress: z.string().min(1, 'La dirección del salón comunal es requerida'),
  mapLocation: z.string().url('URL inválida').optional(),
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
  communityHallAddress: z.string().min(1).optional(),
  mapLocation: z.string().url().optional(),
  estimatedResidentCount: z.number().positive().optional(),
  isActive: z.boolean().optional()
});
