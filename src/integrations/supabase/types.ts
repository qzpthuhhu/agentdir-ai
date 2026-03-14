export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agent_architectures: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      agent_domains: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      agent_to_architectures: {
        Row: {
          agent_id: string
          architecture_id: string
        }
        Insert: {
          agent_id: string
          architecture_id: string
        }
        Update: {
          agent_id?: string
          architecture_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_to_architectures_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_to_architectures_architecture_id_fkey"
            columns: ["architecture_id"]
            isOneToOne: false
            referencedRelation: "agent_architectures"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_to_domains: {
        Row: {
          agent_id: string
          domain_id: string
        }
        Insert: {
          agent_id: string
          domain_id: string
        }
        Update: {
          agent_id?: string
          domain_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_to_domains_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_to_domains_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "agent_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_to_types: {
        Row: {
          agent_id: string
          is_primary: boolean | null
          type_id: string
        }
        Insert: {
          agent_id: string
          is_primary?: boolean | null
          type_id: string
        }
        Update: {
          agent_id?: string
          is_primary?: boolean | null
          type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_to_types_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_to_types_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "agent_types"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          country: string | null
          created_at: string
          description: string | null
          docs_url: string | null
          ecosystem: Database["public"]["Enums"]["ecosystem_type"]
          features: string[] | null
          github_url: string | null
          id: string
          is_open_source: boolean
          license: string | null
          logo_url: string | null
          name: string
          pricing: Database["public"]["Enums"]["pricing_model"]
          primary_language: string | null
          provider: string | null
          rating: number | null
          review_count: number | null
          slug: string
          tagline: string | null
          tags: string[] | null
          updated_at: string
          use_cases: string[] | null
          website_url: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          description?: string | null
          docs_url?: string | null
          ecosystem?: Database["public"]["Enums"]["ecosystem_type"]
          features?: string[] | null
          github_url?: string | null
          id?: string
          is_open_source?: boolean
          license?: string | null
          logo_url?: string | null
          name: string
          pricing?: Database["public"]["Enums"]["pricing_model"]
          primary_language?: string | null
          provider?: string | null
          rating?: number | null
          review_count?: number | null
          slug: string
          tagline?: string | null
          tags?: string[] | null
          updated_at?: string
          use_cases?: string[] | null
          website_url?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          description?: string | null
          docs_url?: string | null
          ecosystem?: Database["public"]["Enums"]["ecosystem_type"]
          features?: string[] | null
          github_url?: string | null
          id?: string
          is_open_source?: boolean
          license?: string | null
          logo_url?: string | null
          name?: string
          pricing?: Database["public"]["Enums"]["pricing_model"]
          primary_language?: string | null
          provider?: string | null
          rating?: number | null
          review_count?: number | null
          slug?: string
          tagline?: string | null
          tags?: string[] | null
          updated_at?: string
          use_cases?: string[] | null
          website_url?: string | null
        }
        Relationships: []
      }
      github_repos: {
        Row: {
          agent_id: string
          created_at: string
          forks: number | null
          id: string
          language: string | null
          last_commit: string | null
          license: string | null
          open_issues: number | null
          repo_url: string
          stars: number | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          forks?: number | null
          id?: string
          language?: string | null
          last_commit?: string | null
          license?: string | null
          open_issues?: number | null
          repo_url: string
          stars?: number | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          forks?: number | null
          id?: string
          language?: string | null
          last_commit?: string | null
          license?: string | null
          open_issues?: number | null
          repo_url?: string
          stars?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "github_repos_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "agents"
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
      ecosystem_type: "open_source" | "startups" | "big_tech" | "china_ai"
      pricing_model: "free" | "freemium" | "paid" | "enterprise"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ecosystem_type: ["open_source", "startups", "big_tech", "china_ai"],
      pricing_model: ["free", "freemium", "paid", "enterprise"],
    },
  },
} as const
