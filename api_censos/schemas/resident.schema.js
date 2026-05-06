import { z } from 'zod';

export const createResidentSchema = z.object({
  userId: z.string().min(1, 'El ID del usuario es requerido'),
  dwellingId: z.string().min(1, 'El ID de la vivienda es requerido')
});

export const updateResidentSchema = z.object({
  userId: z.string().min(1).optional(),
  dwellingId: z.string().min(1).optional(),
  status: z.string().optional(),
  isActive: z.boolean().optional()
});

export const approveResidentSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: 'El estado debe ser "approved" o "rejected"' })
  })
});
