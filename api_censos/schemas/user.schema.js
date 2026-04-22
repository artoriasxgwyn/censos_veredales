import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es requerido'),
  documentNumber: z.string().regex(/^\d{6,10}$/, 'La cédula debe contener solo números (6-10 dígitos)'),
  birthDate: z.string().optional(),
  phone: z.string().regex(/^3\d{9}$/, 'El teléfono debe ser un número colombiano válido (ej: 3001234567)'),
  email: z.string().email('Email inválido'),
  signature: z.string().optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  communityId: z.string().min(1, 'El ID de la comunidad es requerido')
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida')
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'El refresh token es requerido')
});

export const updateUserSchema = z.object({
  fullName: z.string().min(1).optional(),
  documentNumber: z.string().regex(/^\d{6,10}$/, 'La cédula debe contener solo números (6-10 dígitos)').optional(),
  birthDate: z.string().optional(),
  phone: z.string().regex(/^3\d{9}$/, 'El teléfono debe ser un número colombiano válido').optional(),
  email: z.string().email().optional(),
  signature: z.string().optional(),
  password: z.string().min(6).optional(),
  communityId: z.string().optional(),
  isActive: z.boolean().optional()
});

export const assignRoleSchema = z.object({
  role: z.enum(['president', 'tesorero', 'secretario', 'residente', 'censista'], {
    errorMap: () => ({ message: 'El rol debe ser: president, tesorero, secretario, residente o censista' })
  })
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'El token es requerido'),
  newPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});
