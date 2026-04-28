import { z } from 'zod'

// Schema para login
export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida')
})

// Schema para registro público (unirse a comunidad)
export const publicRegisterSchema = z.object({
  fullName: z.string().min(3, 'El nombre completo debe tener al menos 3 caracteres'),
  documentNumber: z.string().regex(/^\d{6,10}$/, 'La cédula debe contener solo números (6-10 dígitos)'),
  phone: z.string().regex(/^3\d{9}$/, 'El teléfono debe ser un número colombiano válido (ej: 3001234567)'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  communityCode: z.string().length(6, 'El código de comunidad debe tener 6 dígitos'),
  digitalSignature: z.string().min(1, 'La firma digital es requerida')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
})

// Schema para forgot password
export const forgotPasswordSchema = z.object({
  email: z.string().email('Correo electrónico inválido')
})

// Schema para reset password
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'El token es requerido'),
  newPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
})

// Schema para actualizar usuario
export const updateUserSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es requerido').optional(),
  documentNumber: z.string().regex(/^\d{6,10}$/, 'La cédula debe contener solo números (6-10 dígitos)').optional(),
  birthDate: z.string().optional().or(z.literal('')),
  phone: z.string().regex(/^3\d{9}$/, 'El teléfono debe ser un número colombiano válido').optional(),
  email: z.string().email('Email inválido').optional(),
  signature: z.string().optional()
})
