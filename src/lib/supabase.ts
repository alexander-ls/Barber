import { createClient } from '@supabase/supabase-js';

export type Database = {
  public: {
    Tables: {
      barbers: {
        Row: {
          id: string;
          name: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          duration_minutes: number;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          duration_minutes: number;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          duration_minutes?: number;
          price?: number;
          created_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          barber_id: string;
          service_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          start_time: string;
          end_time: string;
          status: 'confirmed' | 'completed' | 'cancelled' | 'blocked';
          created_at: string;
        };
        Insert: {
          id?: string;
          barber_id: string;
          service_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone?: string | null;
          start_time: string;
          end_time: string;
          status?: 'confirmed' | 'completed' | 'cancelled' | 'blocked';
          created_at?: string;
        };
        Update: {
          id?: string;
          barber_id?: string;
          service_id?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string | null;
          start_time?: string;
          end_time?: string;
          status?: 'confirmed' | 'completed' | 'cancelled' | 'blocked';
          created_at?: string;
        };
      };
    };
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
