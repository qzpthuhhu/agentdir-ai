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
      announcements: {
        Row: {
          content: string
          created_at: string
          id: string
          is_published: boolean
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      candidate_agents: {
        Row: {
          agent_type_slugs: string[] | null
          architecture_slugs: string[] | null
          confidence_score: number | null
          country: string | null
          created_at: string
          deployment_type: string | null
          description: string | null
          docs_url: string | null
          domain_slugs: string[] | null
          ecosystem: string | null
          enterprise_focus: string | null
          extraction_notes: string | null
          features: string[] | null
          github_url: string | null
          id: string
          is_open_source: boolean | null
          job_id: string | null
          license: string | null
          logo_url: string | null
          name: string
          pricing: string | null
          primary_language: string | null
          provider: string | null
          service_model: string | null
          slug: string
          source_id: string | null
          status: string
          tagline: string | null
          tags: string[] | null
          target_customer: string | null
          updated_at: string
          use_cases: string[] | null
          website_url: string | null
        }
        Insert: {
          agent_type_slugs?: string[] | null
          architecture_slugs?: string[] | null
          confidence_score?: number | null
          country?: string | null
          created_at?: string
          deployment_type?: string | null
          description?: string | null
          docs_url?: string | null
          domain_slugs?: string[] | null
          ecosystem?: string | null
          enterprise_focus?: string | null
          extraction_notes?: string | null
          features?: string[] | null
          github_url?: string | null
          id?: string
          is_open_source?: boolean | null
          job_id?: string | null
          license?: string | null
          logo_url?: string | null
          name: string
          pricing?: string | null
          primary_language?: string | null
          provider?: string | null
          service_model?: string | null
          slug: string
          source_id?: string | null
          status?: string
          tagline?: string | null
          tags?: string[] | null
          target_customer?: string | null
          updated_at?: string
          use_cases?: string[] | null
          website_url?: string | null
        }
        Update: {
          agent_type_slugs?: string[] | null
          architecture_slugs?: string[] | null
          confidence_score?: number | null
          country?: string | null
          created_at?: string
          deployment_type?: string | null
          description?: string | null
          docs_url?: string | null
          domain_slugs?: string[] | null
          ecosystem?: string | null
          enterprise_focus?: string | null
          extraction_notes?: string | null
          features?: string[] | null
          github_url?: string | null
          id?: string
          is_open_source?: boolean | null
          job_id?: string | null
          license?: string | null
          logo_url?: string | null
          name?: string
          pricing?: string | null
          primary_language?: string | null
          provider?: string | null
          service_model?: string | null
          slug?: string
          source_id?: string | null
          status?: string
          tagline?: string | null
          tags?: string[] | null
          target_customer?: string | null
          updated_at?: string
          use_cases?: string[] | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_agents_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "ingestion_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_agents_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "source_records"
            referencedColumns: ["id"]
          },
        ]
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
      ingestion_jobs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          input_content: string | null
          input_type: string
          source_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          input_content?: string | null
          input_type?: string
          source_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          input_content?: string | null
          input_type?: string
          source_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingestion_jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "source_records"
            referencedColumns: ["id"]
          },
        ]
      }
      publish_logs: {
        Row: {
          action: string
          agent_id: string | null
          candidate_id: string | null
          created_at: string
          id: string
        }
        Insert: {
          action?: string
          agent_id?: string | null
          candidate_id?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          action?: string
          agent_id?: string | null
          candidate_id?: string | null
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "publish_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publish_logs_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      review_actions: {
        Row: {
          action: string
          candidate_id: string
          created_at: string
          id: string
          notes: string | null
        }
        Insert: {
          action: string
          candidate_id: string
          created_at?: string
          id?: string
          notes?: string | null
        }
        Update: {
          action?: string
          candidate_id?: string
          created_at?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_actions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      source_records: {
        Row: {
          created_at: string
          id: string
          raw_content: string | null
          source_type: string
          status: string
          summary: string | null
          title: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          raw_content?: string | null
          source_type?: string
          status?: string
          summary?: string | null
          title?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          raw_content?: string | null
          source_type?: string
          status?: string
          summary?: string | null
          title?: string | null
          updated_at?: string
          url?: string | null
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
