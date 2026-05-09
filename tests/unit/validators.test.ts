import { describe, it, expect } from 'vitest';
import { vehicleInputSchema } from '@/lib/validators/vehicle';
import { fuelEntryInputSchema } from '@/lib/validators/fuel';
import { maintenanceInputSchema } from '@/lib/validators/maintenance';
import { profileInputSchema } from '@/lib/validators/profile';

describe('vehicleInputSchema', () => {
  const valid = {
    make: 'Peugeot',
    model: '3008',
    year: 2023,
    plate: 'AB-123-CD',
    fuelType: 'hybrid',
    purchaseDate: '2023-01-01',
    purchasePrice: 30000,
    currency: 'EUR',
    currentMileageKm: 30000,
  };

  it('accepts a minimal valid vehicle', () => {
    const res = vehicleInputSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects invalid year (1949)', () => {
    const res = vehicleInputSchema.safeParse({ ...valid, year: 1949 });
    expect(res.success).toBe(false);
  });

  it('rejects negative purchase price', () => {
    const res = vehicleInputSchema.safeParse({ ...valid, purchasePrice: -1 });
    expect(res.success).toBe(false);
  });

  it('uppercases plate', () => {
    const res = vehicleInputSchema.safeParse({ ...valid, plate: 'ab-123-cd' });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.plate).toBe('AB-123-CD');
  });

  it('rejects unknown fuelType', () => {
    const res = vehicleInputSchema.safeParse({ ...valid, fuelType: 'plasma' });
    expect(res.success).toBe(false);
  });

  it('rejects unknown currency', () => {
    const res = vehicleInputSchema.safeParse({ ...valid, currency: 'BTC' });
    expect(res.success).toBe(false);
  });
});

describe('fuelEntryInputSchema', () => {
  const valid = {
    vehicleId: 'v1',
    occurredAt: '2026-05-09',
    energyType: 'gasoline',
    quantity: 40,
    unitPrice: 1.8,
    totalPrice: 72,
    currency: 'EUR',
    stationName: 'Total',
    mileageKm: 30000,
    ocrSource: 'manual',
  };

  it('accepts a coherent entry', () => {
    expect(fuelEntryInputSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects when total != quantity × unitPrice (>5% drift)', () => {
    const res = fuelEntryInputSchema.safeParse({
      ...valid,
      totalPrice: 100, // way off
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.errors.some((e) => e.path.includes('totalPrice'))).toBe(true);
    }
  });

  it('accepts within 5% rounding tolerance', () => {
    const res = fuelEntryInputSchema.safeParse({
      ...valid,
      totalPrice: 72.5, // 0.7% drift
    });
    expect(res.success).toBe(true);
  });

  it('rejects negative quantity', () => {
    expect(
      fuelEntryInputSchema.safeParse({ ...valid, quantity: -1 }).success,
    ).toBe(false);
  });
});

describe('maintenanceInputSchema', () => {
  const valid = {
    vehicleId: 'v1',
    occurredAt: '2026-05-09',
    category: 'oil',
    description: 'Vidange annuelle',
    cost: 100,
    currency: 'EUR',
    garageName: 'X',
    mileageKm: 30000,
  };

  it('accepts valid', () => {
    expect(maintenanceInputSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects too-short description', () => {
    expect(
      maintenanceInputSchema.safeParse({ ...valid, description: 'ok' }).success,
    ).toBe(false);
  });

  it('rejects invalid category', () => {
    expect(
      maintenanceInputSchema.safeParse({ ...valid, category: 'tuning' }).success,
    ).toBe(false);
  });
});

describe('profileInputSchema', () => {
  const valid = {
    fullName: 'Aïcha Diallo',
    email: 'aicha@example.com',
    locale: 'fr',
    currency: 'EUR',
    country: 'FR',
  };

  it('accepts valid profile', () => {
    expect(profileInputSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects malformed email', () => {
    expect(
      profileInputSchema.safeParse({ ...valid, email: 'nope' }).success,
    ).toBe(false);
  });

  it('uppercases country code', () => {
    const res = profileInputSchema.safeParse({ ...valid, country: 'fr' });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.country).toBe('FR');
  });

  it('rejects unknown locale', () => {
    expect(
      profileInputSchema.safeParse({ ...valid, locale: 'de' }).success,
    ).toBe(false);
  });
});
