import { z } from 'zod';

export const createDwellingSchema = z.object({
  houseNomenclature: z.string().optional(),
  arrivalInstructions: z.string().min(1, 'Las indicaciones de llegada son requeridas'),
  mapLocation: z.string().optional(),
  constructionDate: z.string().optional(),
  homePhoto: z.string().optional(),
  ownerUserId: z.string().optional(),
  cedulaPropietario: z.string().min(1, 'La cédula del propietario es requerida'),
  status: z.string().optional()
});

export const updateDwellingSchema = z.object({
  houseNomenclature: z.string().optional(),
  arrivalInstructions: z.string().optional(),
  mapLocation: z.string().optional(),
  constructionDate: z.string().optional(),
  homePhoto: z.string().optional(),
  ownerUserId: z.string().optional(),
  cedulaPropietario: z.string().optional(),
  status: z.string().optional(),
  isActive: z.boolean().optional()
});

export const approveDwellingSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'])
});
