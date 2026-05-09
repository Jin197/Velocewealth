export type FuelType = 'thermal' | 'electric' | 'hybrid';
export type EnergyType = 'gasoline' | 'diesel' | 'electric' | 'e85' | 'gpl';
export type Currency = 'EUR' | 'USD' | 'XOF' | 'XAF' | 'MAD' | 'CAD' | 'CHF';
export type Locale = 'fr' | 'en' | 'es' | 'ar' | 'pt';

export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  plate: string;
  fuelType: FuelType;
  purchaseDate: string;
  purchasePrice: number;
  currency: Currency;
  currentMileageKm: number;
  imageUrl: string;
  color?: string;
  trim?: string;
  // Resale snapshot
  estimatedResaleValue: number;
  resaleTrend: 'up' | 'down' | 'stable';
  // Insurance
  insuranceProvider?: string;
  insuranceMonthly?: number;
}

export interface FuelEntry {
  id: string;
  vehicleId: string;
  occurredAt: string;
  energyType: EnergyType;
  quantity: number; // litres or kWh
  unit: 'L' | 'kWh';
  unitPrice: number;
  totalPrice: number;
  currency: Currency;
  stationName: string;
  stationCity?: string;
  mileageKm: number;
  ocrSource?: 'manual' | 'ocr';
}

export interface MaintenanceEntry {
  id: string;
  vehicleId: string;
  occurredAt: string;
  category: 'oil' | 'tires' | 'brakes' | 'filter' | 'battery' | 'inspection' | 'other';
  description: string;
  cost: number;
  currency: Currency;
  garageName: string;
  garageId?: string;
  mileageKm: number;
  nextDueMileage?: number;
  nextDueDate?: string;
  hash: string;
}

export interface MaintenanceAlert {
  id: string;
  vehicleId: string;
  category: 'tires' | 'brakes' | 'oil' | 'filter' | 'battery' | 'inspection';
  severity: 'info' | 'warning' | 'critical';
  predictedMileage: number;
  predictedDate: string;
  message: string;
  remainingKm?: number;
}

export interface Station {
  id: string;
  name: string;
  brand: string;
  type: 'gas' | 'charger';
  lat: number;
  lng: number;
  address: string;
  city: string;
  country: string;
  prices?: { fuelType: EnergyType; price: number; currency: Currency }[];
  available?: number;
  total?: number;
}

export interface Garage {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  isPartner: boolean;
  rating: number;
  reviewCount: number;
  services: string[];
  imageUrl?: string;
}

export interface EcoScore {
  current: number;
  trend: 'up' | 'down' | 'stable';
  delta: number;
  badges: { id: string; label: string; description: string; earned: boolean }[];
  monthly: { month: string; score: number }[];
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  locale: Locale;
  currency: Currency;
  country: string;
  planTier: 'free' | 'premium';
}
