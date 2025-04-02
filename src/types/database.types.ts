export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      paint_records: {
        Row: {
          id: string
          manufacturer: string
          color_name: string
          color_code: string
          room: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          manufacturer: string
          color_name: string
          color_code: string
          room: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          manufacturer?: string
          color_name?: string
          color_code?: string
          room?: string
          created_at?: string
          updated_at?: string
        }
      }
      home_services: {
        Row: {
          id: string
          service_type: string
          provider: string
          date: string
          status: 'scheduled' | 'completed' | 'cancelled'
          recurrence: 'one-time' | 'monthly' | 'quarterly' | 'semi-annual' | 'annual'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_type: string
          provider: string
          date: string
          status: 'scheduled' | 'completed' | 'cancelled'
          recurrence: 'one-time' | 'monthly' | 'quarterly' | 'semi-annual' | 'annual'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_type?: string
          provider?: string
          date?: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          recurrence?: 'one-time' | 'monthly' | 'quarterly' | 'semi-annual' | 'annual'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plants: {
        Row: {
          id: string
          name: string
          location: string
          type: 'indoor' | 'outdoor'
          sun_requirements: 'no sun' | 'partial shade' | 'full sun'
          max_height: number
          max_width: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          type: 'indoor' | 'outdoor'
          sun_requirements: 'no sun' | 'partial shade' | 'full sun'
          max_height: number
          max_width: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          type?: 'indoor' | 'outdoor'
          sun_requirements?: 'no sun' | 'partial shade' | 'full sun'
          max_height?: number
          max_width?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          title: string
          details: string
          due_date: string
          recurrence_id: string | null
          completed: boolean
          house_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          details: string
          due_date: string
          recurrence_id?: string | null
          completed?: boolean
          house_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          details?: string
          due_date?: string
          recurrence_id?: string | null
          completed?: boolean
          house_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 