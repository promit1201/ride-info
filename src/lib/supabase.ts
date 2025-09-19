import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      vehicles: {
        Row: {
          id: string
          type: 'bus' | 'auto' | 'cab'
          name: string
          route: string
          current_location: { lat: number; lng: number }
          stands: string[]
          price: number
          duration: string
          next_available: string
          created_at: string
        }
        Insert: {
          id?: string
          type: 'bus' | 'auto' | 'cab'
          name: string
          route: string
          current_location: { lat: number; lng: number }
          stands: string[]
          price: number
          duration: string
          next_available: string
        }
        Update: {
          id?: string
          type?: 'bus' | 'auto' | 'cab'
          name?: string
          route?: string
          current_location?: { lat: number; lng: number }
          stands?: string[]
          price?: number
          duration?: string
          next_available?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
        }
        Update: {
          id?: string
          email?: string
        }
      }
    }
  }
}