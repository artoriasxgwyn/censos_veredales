import { z } from 'zod'

export const createDwellingSchema = z.object({
  houseNomenclature: z.string().optional().or(z.literal('')),
  arrivalInstructions: z.string().min(1, 'Las indicaciones de llegada son requeridas'),
  mapLocation: z.string().url('URL inválida').optional().or(z.literal('')),
  constructionDate: z.string().optional().or(z.literal('')),
  homePhoto: z.any().optional().nullable(),
  cedulaPropietario: z.string().transform(val => val.replace(/[^0-9]/g, '')).pipe(z.string().min(1, 'La cédula del propietario es requerida').regex(/^\d{6,10}$/, 'La cédula debe contener solo números (6-10 dígitos)')),
  status: z.string().optional()
})

export const updateDwellingSchema = z.object({
  houseNomenclature: z.string().optional().or(z.literal('')),
  arrivalInstructions: z.string().min(1).optional().or(z.literal('')),
  mapLocation: z.string().url().optional().or(z.literal('')),
  constructionDate: z.string().optional().or(z.literal('')),
  homePhoto: z.any().optional().nullable(),
  cedulaPropietario: z.string().transform(val => val ? val.replace(/[^0-9]/g, '') : val).pipe(z.string().regex(/^\d{6,10}$/, 'La cédula debe contener solo números (6-10 dígitos)').optional()),
  status: z.string().optional(),
  isActive: z.boolean().optional()
})
