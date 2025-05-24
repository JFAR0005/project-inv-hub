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
      activity_feed: {
        Row: {
          action_data: Json | null
          action_type: string
          company_id: string | null
          created_at: string | null
          id: string
          read_at: string | null
          user_id: string | null
        }
        Insert: {
          action_data?: Json | null
          action_type: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          read_at?: string | null
          user_id?: string | null
        }
        Update: {
          action_data?: Json | null
          action_type?: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          read_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string | null
          company_id: string | null
          content: string
          created_at: string | null
          id: string
          is_edited: boolean | null
          mentions: string[] | null
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          company_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_edited?: boolean | null
          mentions?: string[] | null
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          company_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_edited?: boolean | null
          mentions?: string[] | null
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          arr: number | null
          burn_rate: number | null
          churn_rate: number | null
          created_at: string | null
          description: string | null
          headcount: number | null
          id: string
          location: string | null
          logo_url: string | null
          mrr: number | null
          name: string
          runway: number | null
          sector: string | null
          stage: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          arr?: number | null
          burn_rate?: number | null
          churn_rate?: number | null
          created_at?: string | null
          description?: string | null
          headcount?: number | null
          id?: string
          location?: string | null
          logo_url?: string | null
          mrr?: number | null
          name: string
          runway?: number | null
          sector?: string | null
          stage?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          arr?: number | null
          burn_rate?: number | null
          churn_rate?: number | null
          created_at?: string | null
          description?: string | null
          headcount?: number | null
          id?: string
          location?: string | null
          logo_url?: string | null
          mrr?: number | null
          name?: string
          runway?: number | null
          sector?: string | null
          stage?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      company_files: {
        Row: {
          company_id: string | null
          file_name: string | null
          file_url: string | null
          id: string
          uploaded_at: string | null
          uploader_id: string | null
        }
        Insert: {
          company_id?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          uploaded_at?: string | null
          uploader_id?: string | null
        }
        Update: {
          company_id?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          uploaded_at?: string | null
          uploader_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_files_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_due_diligence: {
        Row: {
          assigned_analyst: string | null
          created_at: string
          deal_id: string
          due_diligence_status: Database["public"]["Enums"]["due_diligence_status"]
          financial_review: string | null
          id: string
          investment_thesis: string | null
          market_analysis: string | null
          risk_assessment: string | null
          target_completion_date: string | null
          team_assessment: string | null
          updated_at: string
        }
        Insert: {
          assigned_analyst?: string | null
          created_at?: string
          deal_id: string
          due_diligence_status?: Database["public"]["Enums"]["due_diligence_status"]
          financial_review?: string | null
          id?: string
          investment_thesis?: string | null
          market_analysis?: string | null
          risk_assessment?: string | null
          target_completion_date?: string | null
          team_assessment?: string | null
          updated_at?: string
        }
        Update: {
          assigned_analyst?: string | null
          created_at?: string
          deal_id?: string
          due_diligence_status?: Database["public"]["Enums"]["due_diligence_status"]
          financial_review?: string | null
          id?: string
          investment_thesis?: string | null
          market_analysis?: string | null
          risk_assessment?: string | null
          target_completion_date?: string | null
          team_assessment?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_due_diligence_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: true
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          lead_partner: string | null
          notes: string | null
          source: string | null
          stage: Database["public"]["Enums"]["deal_stage"]
          status: string | null
          updated_at: string | null
          valuation_expectation: number | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          lead_partner?: string | null
          notes?: string | null
          source?: string | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          status?: string | null
          updated_at?: string | null
          valuation_expectation?: number | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          lead_partner?: string | null
          notes?: string | null
          source?: string | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          status?: string | null
          updated_at?: string | null
          valuation_expectation?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_updates: {
        Row: {
          arr: number | null
          burn_rate: number | null
          churn: number | null
          comments: string | null
          company_id: string | null
          deck_url: string | null
          headcount: number | null
          id: string
          mrr: number | null
          raise_status: string | null
          raise_target_amount: number | null
          requested_intros: string | null
          runway: number | null
          submitted_at: string | null
          submitted_by: string | null
        }
        Insert: {
          arr?: number | null
          burn_rate?: number | null
          churn?: number | null
          comments?: string | null
          company_id?: string | null
          deck_url?: string | null
          headcount?: number | null
          id?: string
          mrr?: number | null
          raise_status?: string | null
          raise_target_amount?: number | null
          requested_intros?: string | null
          runway?: number | null
          submitted_at?: string | null
          submitted_by?: string | null
        }
        Update: {
          arr?: number | null
          burn_rate?: number | null
          churn?: number | null
          comments?: string | null
          company_id?: string | null
          deck_url?: string | null
          headcount?: number | null
          id?: string
          mrr?: number | null
          raise_status?: string | null
          raise_target_amount?: number | null
          requested_intros?: string | null
          runway?: number | null
          submitted_at?: string | null
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "founder_updates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      lp_documents: {
        Row: {
          file_name: string
          file_url: string
          id: string
          lp_lead_id: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          file_name: string
          file_url: string
          id?: string
          lp_lead_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string
          file_url?: string
          id?: string
          lp_lead_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lp_documents_lp_lead_id_fkey"
            columns: ["lp_lead_id"]
            isOneToOne: false
            referencedRelation: "lp_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lp_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lp_leads: {
        Row: {
          confirmed_commitment: number | null
          contact_email: string | null
          contact_name: string | null
          created_at: string | null
          estimated_commitment: number | null
          id: string
          location: string | null
          name: string
          next_followup_date: string | null
          notes: string | null
          referred_by: string | null
          relationship_owner: string | null
          status: Database["public"]["Enums"]["lp_status"]
          type: Database["public"]["Enums"]["lp_type"]
          updated_at: string | null
        }
        Insert: {
          confirmed_commitment?: number | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          estimated_commitment?: number | null
          id?: string
          location?: string | null
          name: string
          next_followup_date?: string | null
          notes?: string | null
          referred_by?: string | null
          relationship_owner?: string | null
          status?: Database["public"]["Enums"]["lp_status"]
          type: Database["public"]["Enums"]["lp_type"]
          updated_at?: string | null
        }
        Update: {
          confirmed_commitment?: number | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          estimated_commitment?: number | null
          id?: string
          location?: string | null
          name?: string
          next_followup_date?: string | null
          notes?: string | null
          referred_by?: string | null
          relationship_owner?: string | null
          status?: Database["public"]["Enums"]["lp_status"]
          type?: Database["public"]["Enums"]["lp_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lp_leads_relationship_owner_fkey"
            columns: ["relationship_owner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_participants: {
        Row: {
          id: string
          meeting_id: string
          user_id: string
        }
        Insert: {
          id?: string
          meeting_id: string
          user_id: string
        }
        Update: {
          id?: string
          meeting_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          company_id: string | null
          created_at: string | null
          created_by: string
          description: string | null
          end_time: string
          id: string
          location: string | null
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      mention_notifications: {
        Row: {
          content: string
          context_id: string
          context_type: string
          created_at: string
          id: string
          is_read: boolean
          mentioned_user_id: string
          mentioning_user_id: string
        }
        Insert: {
          content: string
          context_id: string
          context_type: string
          created_at?: string
          id?: string
          is_read?: boolean
          mentioned_user_id: string
          mentioning_user_id: string
        }
        Update: {
          content?: string
          context_id?: string
          context_type?: string
          created_at?: string
          id?: string
          is_read?: boolean
          mentioned_user_id?: string
          mentioning_user_id?: string
        }
        Relationships: []
      }
      metrics: {
        Row: {
          company_id: string | null
          date: string | null
          id: string
          metric_name: string | null
          value: number | null
        }
        Insert: {
          company_id?: string | null
          date?: string | null
          id?: string
          metric_name?: string | null
          value?: number | null
        }
        Update: {
          company_id?: string | null
          date?: string | null
          id?: string
          metric_name?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          author_id: string
          company_id: string | null
          content: string
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
          visibility: string
        }
        Insert: {
          author_id: string
          company_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
          visibility: string
        }
        Update: {
          author_id?: string
          company_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string | null
          id: string
          last_seen_at: string | null
          name: string | null
          role: string | null
          team: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          last_seen_at?: string | null
          name?: string | null
          role?: string | null
          team?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_seen_at?: string | null
          name?: string | null
          role?: string | null
          team?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      deal_stage: "Discovery" | "DD" | "IC" | "Funded" | "Rejected"
      due_diligence_status: "Pending" | "In Progress" | "Complete"
      lp_status: "Contacted" | "Interested" | "In DD" | "Committed" | "Declined"
      lp_type: "Individual" | "Family Office" | "Institutional"
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
    Enums: {
      deal_stage: ["Discovery", "DD", "IC", "Funded", "Rejected"],
      due_diligence_status: ["Pending", "In Progress", "Complete"],
      lp_status: ["Contacted", "Interested", "In DD", "Committed", "Declined"],
      lp_type: ["Individual", "Family Office", "Institutional"],
    },
  },
} as const
