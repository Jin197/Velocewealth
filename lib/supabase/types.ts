/**
 * Hand-written Database type matching our migrations.
 * Replace with `supabase gen types typescript --linked > lib/supabase/database.types.ts`
 * once the cloud project is wired.
 */

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          avatar_url: string | null;
          locale: 'fr' | 'en' | 'es' | 'ar' | 'pt';
          currency: string;
          country: string;
          plan_tier: 'free' | 'premium';
          stripe_customer_id: string | null;
          ocr_credits_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          avatar_url?: string | null;
          locale?: 'fr' | 'en' | 'es' | 'ar' | 'pt';
          currency?: string;
          country?: string;
          plan_tier?: 'free' | 'premium';
          stripe_customer_id?: string | null;
          ocr_credits_used?: number;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      vehicles: {
        Row: {
          id: string;
          user_id: string;
          make: string;
          model: string;
          year: number;
          vin: string | null;
          plate: string;
          fuel_type: 'thermal' | 'electric' | 'hybrid';
          purchase_date: string;
          purchase_price: number;
          currency: string;
          current_mileage_km: number;
          image_url: string | null;
          color: string | null;
          trim: string | null;
          estimated_resale_value: number;
          resale_trend: 'up' | 'down' | 'stable';
          insurance_provider: string | null;
          insurance_monthly: number | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          make: string;
          model: string;
          year: number;
          vin?: string | null;
          plate: string;
          fuel_type: 'thermal' | 'electric' | 'hybrid';
          purchase_date: string;
          purchase_price?: number;
          currency?: string;
          current_mileage_km?: number;
          image_url?: string | null;
          color?: string | null;
          trim?: string | null;
          estimated_resale_value?: number;
          resale_trend?: 'up' | 'down' | 'stable';
          insurance_provider?: string | null;
          insurance_monthly?: number | null;
          archived_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['vehicles']['Insert']>;
        Relationships: [];
      };
      fuel_entries: {
        Row: {
          id: string;
          vehicle_id: string;
          user_id: string;
          occurred_at: string;
          energy_type: 'gasoline' | 'diesel' | 'electric' | 'e85' | 'gpl';
          quantity: number;
          unit: 'L' | 'kWh';
          unit_price: number;
          total_price: number;
          currency: string;
          station_name: string;
          station_city: string | null;
          mileage_km: number;
          ocr_source: 'manual' | 'ocr';
          ocr_raw: Json | null;
          receipt_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          user_id: string;
          occurred_at: string;
          energy_type: 'gasoline' | 'diesel' | 'electric' | 'e85' | 'gpl';
          quantity: number;
          unit: 'L' | 'kWh';
          unit_price: number;
          total_price: number;
          currency: string;
          station_name: string;
          station_city?: string | null;
          mileage_km: number;
          ocr_source?: 'manual' | 'ocr';
          ocr_raw?: Json | null;
          receipt_url?: string | null;
        };
        Update: Partial<Database['public']['Tables']['fuel_entries']['Insert']>;
        Relationships: [];
      };
      maintenance_entries: {
        Row: {
          id: string;
          vehicle_id: string;
          user_id: string;
          occurred_at: string;
          category: 'oil' | 'tires' | 'brakes' | 'filter' | 'battery' | 'inspection' | 'other';
          description: string;
          cost: number;
          currency: string;
          garage_name: string;
          garage_id: string | null;
          mileage_km: number;
          next_due_mileage: number | null;
          next_due_date: string | null;
          invoice_url: string | null;
          previous_hash: string;
          hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          user_id: string;
          occurred_at: string;
          category: 'oil' | 'tires' | 'brakes' | 'filter' | 'battery' | 'inspection' | 'other';
          description: string;
          cost: number;
          currency: string;
          garage_name: string;
          garage_id?: string | null;
          mileage_km: number;
          next_due_mileage?: number | null;
          next_due_date?: string | null;
          invoice_url?: string | null;
          previous_hash: string;
          hash: string;
        };
        Update: never;
        Relationships: [];
      };
      maintenance_alerts: {
        Row: {
          id: string;
          vehicle_id: string;
          user_id: string;
          category: string;
          severity: 'info' | 'warning' | 'critical';
          predicted_mileage: number;
          predicted_at: string;
          message: string;
          dismissed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          user_id: string;
          category: string;
          severity: 'info' | 'warning' | 'critical';
          predicted_mileage: number;
          predicted_at: string;
          message: string;
          dismissed_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['maintenance_alerts']['Insert']>;
        Relationships: [];
      };
      stations: {
        Row: {
          id: string;
          name: string;
          brand: string;
          type: 'gas' | 'charger';
          lat: number;
          lng: number;
          address: string;
          city: string;
          country: string;
          available: number | null;
          total: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          brand: string;
          type: 'gas' | 'charger';
          lat: number;
          lng: number;
          address: string;
          city: string;
          country: string;
          available?: number | null;
          total?: number | null;
        };
        Update: Partial<Database['public']['Tables']['stations']['Insert']>;
        Relationships: [];
      };
      garages: {
        Row: {
          id: string;
          name: string;
          address: string;
          city: string;
          country: string;
          lat: number;
          lng: number;
          is_partner: boolean;
          rating: number;
          review_count: number;
          services: string[];
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          city: string;
          country: string;
          lat: number;
          lng: number;
          is_partner?: boolean;
          rating?: number;
          review_count?: number;
          services?: string[];
          image_url?: string | null;
        };
        Update: Partial<Database['public']['Tables']['garages']['Insert']>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string;
          tier: 'premium';
          status: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id: string;
          tier?: 'premium';
          status: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          payload?: Json;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
