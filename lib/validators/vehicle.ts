import { z } from 'zod';

export const fuelTypeSchema = z.enum(['thermal', 'electric', 'hybrid']);
export const currencySchema = z.enum([
  'EUR',
  'USD',
  'XOF',
  'XAF',
  'MAD',
  'CAD',
  'CHF',
]);

export const vehicleInputSchema = z.object({
  make: z.string().trim().min(1, 'Marque requise').max(50),
  model: z.string().trim().min(1, 'Modèle requis').max(80),
  year: z
    .coerce.number()
    .int()
    .min(1950, 'Année trop ancienne')
    .max(new Date().getFullYear() + 1, 'Année invalide'),
  trim: z.string().trim().max(50).optional().or(z.literal('')),
  color: z.string().trim().max(40).optional().or(z.literal('')),
  plate: z
    .string()
    .trim()
    .min(2, 'Immatriculation requise')
    .max(20)
    .toUpperCase(),
  vin: z
    .string()
    .trim()
    .max(17, 'VIN max 17 caractères')
    .optional()
    .or(z.literal('')),
  fuelType: fuelTypeSchema,
  purchaseDate: z.string().min(1, 'Date d\'achat requise'),
  purchasePrice: z.coerce.number().nonnegative('Prix doit être positif'),
  currency: currencySchema,
  currentMileageKm: z.coerce.number().int().nonnegative('Kilométrage invalide'),
  imageUrl: z
    .string()
    .url('URL invalide')
    .optional()
    .or(z.literal('')),
  insuranceProvider: z.string().trim().max(50).optional().or(z.literal('')),
  insuranceMonthly: z
    .coerce.number()
    .nonnegative()
    .optional(),
});

export type VehicleInput = z.infer<typeof vehicleInputSchema>;
