export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      expenditures: {
        Row: {
          amount: number
          category: string
          date: string
          date_created: string | null
          description: string
          id: string
          last_updated: string | null
          notes: string | null
          payment_method: string
          receipt_image: string | null
          vehicle_id: string | null
        }
        Insert: {
          amount: number
          category: string
          date: string
          date_created?: string | null
          description: string
          id?: string
          last_updated?: string | null
          notes?: string | null
          payment_method: string
          receipt_image?: string | null
          vehicle_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          date?: string
          date_created?: string | null
          description?: string
          id?: string
          last_updated?: string | null
          notes?: string | null
          payment_method?: string
          receipt_image?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenditures_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance: {
        Row: {
          cost: number
          date_created: string | null
          description: string
          id: string
          last_updated: string | null
          next_service_date: string | null
          notes: string | null
          service_date: string
          service_provider: string
          type: string
          vehicle_id: string
        }
        Insert: {
          cost: number
          date_created?: string | null
          description: string
          id?: string
          last_updated?: string | null
          next_service_date?: string | null
          notes?: string | null
          service_date: string
          service_provider: string
          type: string
          vehicle_id: string
        }
        Update: {
          cost?: number
          date_created?: string | null
          description?: string
          id?: string
          last_updated?: string | null
          next_service_date?: string | null
          notes?: string | null
          service_date?: string
          service_provider?: string
          type?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      rentals: {
        Row: {
          actual_end_date: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          date_created: string | null
          deposit: number
          expected_end_date: string
          id: string
          last_updated: string | null
          notes: string | null
          rental_rate: number
          signature_data: string | null
          signature_type: string | null
          start_date: string
          status: string
          total_amount: number | null
          vehicle_id: string
        }
        Insert: {
          actual_end_date?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          date_created?: string | null
          deposit: number
          expected_end_date: string
          id?: string
          last_updated?: string | null
          notes?: string | null
          rental_rate: number
          signature_data?: string | null
          signature_type?: string | null
          start_date: string
          status: string
          total_amount?: number | null
          vehicle_id: string
        }
        Update: {
          actual_end_date?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          date_created?: string | null
          deposit?: number
          expected_end_date?: string
          id?: string
          last_updated?: string | null
          notes?: string | null
          rental_rate?: number
          signature_data?: string | null
          signature_type?: string | null
          start_date?: string
          status?: string
          total_amount?: number | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rentals_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          date_added: string | null
          fuel_type: string
          id: string
          image_url: string | null
          last_maintenance: string | null
          last_updated: string | null
          license_plate: string
          make: string
          model: string
          notes: string | null
          odometer: number
          status: string
          year: number
        }
        Insert: {
          date_added?: string | null
          fuel_type: string
          id?: string
          image_url?: string | null
          last_maintenance?: string | null
          last_updated?: string | null
          license_plate: string
          make: string
          model: string
          notes?: string | null
          odometer: number
          status: string
          year: number
        }
        Update: {
          date_added?: string | null
          fuel_type?: string
          id?: string
          image_url?: string | null
          last_maintenance?: string | null
          last_updated?: string | null
          license_plate?: string
          make?: string
          model?: string
          notes?: string | null
          odometer?: number
          status?: string
          year?: number
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
