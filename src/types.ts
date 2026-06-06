export interface Vehicle {
  id: string;
  model: string;
  year: string;
}

export interface UserProfile {
  name: string;
  email: string;
  vehicles: Vehicle[];
  activeVehicleId: string;
}

export interface FuelRecord {
  id: string;
  user_email: string;
  vehicle_id: string;
  odometer_km: number;
  fuel_type: FuelType;
  price_per_liter: number;
  total_paid: number;
  liters: number;
  km_per_liter: number | null;
  distance_km: number | null;
  is_first_record: boolean;
  created_at: string;
}

export type FuelType = 'Gasolina' | 'Etanol' | 'Diesel';

export interface FuelFormData {
  vehicle_id: string;
  odometer_km: string;
  fuel_type: FuelType;
  price_per_liter: string;
  total_paid: string;
}
