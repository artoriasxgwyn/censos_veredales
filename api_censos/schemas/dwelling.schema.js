import { z } from 'zod';

// Validación para URL de Google Maps
const googleMapsUrlSchema = z.string().url('Debe ser una URL válida').refine(
  (url) => {
    const googleMapsPattern = /^https:\/\/(www\.)?google\.com\/maps\?.*q=-?\d+\.?\d*,-?\d+\.?\d*/i;
    return googleMapsPattern.test(url);
  },
  { message: 'Debe ser una URL de Google Maps con coordenadas (ej: https://www.google.com/maps?q=7.123,-73.123)' }
);

export const createDwellingSchema = z.object({
  houseNomenclature: z.string().optional(),
  arrivalInstructions: z.string().min(1, 'Las indicaciones de llegada son requeridas'),
  mapLocation: googleMapsUrlSchema.optional(),
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
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: 'El estado debe ser "approved" o "rejected"' })
  })
});
