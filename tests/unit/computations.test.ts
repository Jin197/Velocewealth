import { describe, it, expect } from 'vitest';
import {
  computeCostPerKm,
  energyMix,
  monthlySpend,
  tireWearPercent,
} from '@/lib/computations';
import type { Vehicle, FuelEntry, MaintenanceEntry } from '@/lib/types';

const baseVehicle: Vehicle = {
  id: 'v1',
  userId: 'u1',
  make: 'Peugeot',
  model: '3008',
  year: 2023,
  plate: 'AB-123-CD',
  fuelType: 'hybrid',
  purchaseDate: '2023-01-01',
  purchasePrice: 30000,
  currency: 'EUR',
  currentMileageKm: 30000,
  imageUrl: '',
  estimatedResaleValue: 22000,
  resaleTrend: 'stable',
  insuranceMonthly: 50,
};

const today = new Date();
const daysAgo = (n: number) =>
  new Date(today.getTime() - n * 86400000).toISOString();

describe('computeCostPerKm', () => {
  it('returns zeros when no fuel data', () => {
    const res = computeCostPerKm(baseVehicle, [], [], 6);
    expect(res.energy).toBe(0);
    expect(res.maintenance).toBe(0);
    expect(res.distance).toBe(0);
    expect(res.costPerKm).toBe(0);
  });

  it('applies the cahier-des-charges formula: (energy + maintenance + insurance) / distance', () => {
    const fuel: FuelEntry[] = [
      {
        id: 'f1',
        vehicleId: 'v1',
        occurredAt: daysAgo(10),
        energyType: 'gasoline',
        quantity: 40,
        unit: 'L',
        unitPrice: 1.8,
        totalPrice: 72,
        currency: 'EUR',
        stationName: 'Total',
        mileageKm: 25000,
      },
      {
        id: 'f2',
        vehicleId: 'v1',
        occurredAt: daysAgo(5),
        energyType: 'gasoline',
        quantity: 40,
        unit: 'L',
        unitPrice: 1.8,
        totalPrice: 72,
        currency: 'EUR',
        stationName: 'Total',
        mileageKm: 25600,
      },
    ];
    const maintenance: MaintenanceEntry[] = [
      {
        id: 'm1',
        vehicleId: 'v1',
        occurredAt: daysAgo(7),
        category: 'oil',
        description: 'Vidange',
        cost: 100,
        currency: 'EUR',
        garageName: 'X',
        mileageKm: 25500,
        hash: 'abc',
      },
    ];
    const res = computeCostPerKm(baseVehicle, fuel, maintenance, 6);
    expect(res.energy).toBe(144);
    expect(res.maintenance).toBe(100);
    expect(res.insurance).toBe(300); // 50 × 6 months
    expect(res.distance).toBe(600); // 25600 - 25000
    expect(res.total).toBe(544);
    expect(res.costPerKm).toBeCloseTo(544 / 600, 4);
  });

  it('ignores entries from other vehicles', () => {
    const fuel: FuelEntry[] = [
      {
        id: 'f1',
        vehicleId: 'OTHER',
        occurredAt: daysAgo(5),
        energyType: 'gasoline',
        quantity: 40,
        unit: 'L',
        unitPrice: 1.8,
        totalPrice: 72,
        currency: 'EUR',
        stationName: 'Total',
        mileageKm: 25000,
      },
    ];
    const res = computeCostPerKm(baseVehicle, fuel, [], 6);
    expect(res.energy).toBe(0);
  });
});

describe('energyMix', () => {
  it('returns 100/0 for all-thermal', () => {
    const fuel: FuelEntry[] = [
      {
        id: '1',
        vehicleId: 'v1',
        occurredAt: daysAgo(1),
        energyType: 'gasoline',
        quantity: 40,
        unit: 'L',
        unitPrice: 1,
        totalPrice: 40,
        currency: 'EUR',
        stationName: 'X',
        mileageKm: 0,
      },
    ];
    const mix = energyMix(fuel);
    expect(mix.thermal).toBe(1);
    expect(mix.electric).toBe(0);
  });

  it('splits correctly between thermal and electric', () => {
    const fuel: FuelEntry[] = [
      {
        id: '1',
        vehicleId: 'v1',
        occurredAt: daysAgo(1),
        energyType: 'gasoline',
        quantity: 40,
        unit: 'L',
        unitPrice: 1,
        totalPrice: 60,
        currency: 'EUR',
        stationName: 'X',
        mileageKm: 0,
      },
      {
        id: '2',
        vehicleId: 'v1',
        occurredAt: daysAgo(1),
        energyType: 'electric',
        quantity: 40,
        unit: 'kWh',
        unitPrice: 1,
        totalPrice: 40,
        currency: 'EUR',
        stationName: 'X',
        mileageKm: 0,
      },
    ];
    const mix = energyMix(fuel);
    expect(mix.thermal).toBeCloseTo(0.6, 2);
    expect(mix.electric).toBeCloseTo(0.4, 2);
  });

  it('returns zeros on empty input', () => {
    const mix = energyMix([]);
    expect(mix.thermal).toBe(0);
    expect(mix.electric).toBe(0);
  });
});

describe('tireWearPercent', () => {
  it('returns 0 when no nextDueMileage', () => {
    expect(tireWearPercent(50000, 40000, undefined)).toBe(0);
  });
  it('returns 50% halfway through life', () => {
    expect(tireWearPercent(50000, 40000, 60000)).toBe(50);
  });
  it('caps at 100%', () => {
    expect(tireWearPercent(70000, 40000, 60000)).toBe(100);
  });
  it('never goes negative', () => {
    expect(tireWearPercent(30000, 40000, 60000)).toBe(0);
  });
});

describe('monthlySpend', () => {
  it('returns N months in chronological order', () => {
    const months = monthlySpend([], [], 6);
    expect(months).toHaveLength(6);
  });

  it('aggregates fuel and maintenance per month', () => {
    const fuel: FuelEntry[] = [
      {
        id: '1',
        vehicleId: 'v1',
        occurredAt: new Date().toISOString(),
        energyType: 'gasoline',
        quantity: 40,
        unit: 'L',
        unitPrice: 1.8,
        totalPrice: 72,
        currency: 'EUR',
        stationName: 'X',
        mileageKm: 0,
      },
    ];
    const months = monthlySpend(fuel, [], 6);
    const last = months[months.length - 1];
    expect(last.energy).toBe(72);
    expect(last.total).toBe(72);
  });
});
