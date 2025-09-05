import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('Missing VITE_SUPABASE_URL environment variable');
}
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          original_price: number;
          category: string;
          size: string[];
          color: string;
          material: string;
          care_instructions: string;
          images: string[];
          stock_quantity: number;
          is_featured: boolean;
          is_new: boolean;
          is_bestseller: boolean;
          has_delivery_charge: boolean;
          delivery_charge: number;
          free_delivery_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price: number;
          original_price: number;
          category: string;
          size: string[];
          color: string;
          material: string;
          care_instructions: string;
          images: string[];
          stock_quantity: number;
          is_featured?: boolean;
          is_new?: boolean;
          is_bestseller?: boolean;
          has_delivery_charge?: boolean;
          delivery_charge?: number;
          free_delivery_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          original_price?: number;
          category?: string;
          size?: string[];
          color?: string;
          material?: string;
          care_instructions?: string;
          images?: string[];
          stock_quantity?: number;
          is_featured?: boolean;
          is_new?: boolean;
          is_bestseller?: boolean;
          has_delivery_charge?: boolean;
          delivery_charge?: number;
          free_delivery_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          size: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity: number;
          size: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          quantity?: number;
          size?: string;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          total_amount: number;
          status: string;
          shipping_address: any;
          payment_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_amount: number;
          status?: string;
          shipping_address: any;
          payment_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_amount?: number;
          status?: string;
          shipping_address?: any;
          payment_status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          size: string;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          size: string;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          size?: string;
          price?: number;
          created_at?: string;
        };
      };
      wishlist: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
      };
    };
  };
};