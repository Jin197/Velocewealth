import { z } from 'zod';
import { currencySchema } from './vehicle';

export const maintenanceCategorySchema = z.enum([
  'oil',
  'tires',
  'brakes',
  'filter',
  'battery',
  'inspection',
  'other',
]);

export const maintenanceInputSchema = z.object({
  vehicleId: z.string().min(1, 'Véhicule requis'),
  occurredAt: z.string().min(1, 'Date requise'),
  category: maintenanceCategorySchema,
  description: z.string().trim().min(3, 'Description trop courte').max(200),
  cost: z.coerce.number().nonnegative('Coût invalide'),
  currency: currencySchema,
  garageName: z.string().trim().min(1, 'Garage requis').max(80),
  mileageKm: z.coerce.number().int().nonnegative('Kilométrage invalide'),
  nextDueMileage: z.coerce.number().int().nonnegative().optional(),
  nextDueDate: z.string().optional().or(z.literal('')),
});

export type MaintenanceInput = z.infer<typeof maintenanceInputSchema>;
