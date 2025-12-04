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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_agents: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          model: string | null
          name: string
          slug: string
          system_prompt: string | null
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          model?: string | null
          name: string
          slug: string
          system_prompt?: string | null
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          model?: string | null
          name?: string
          slug?: string
          system_prompt?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_memories: {
        Row: {
          agent: string | null
          category: string | null
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          is_system: boolean | null
          priority: number | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          agent?: string | null
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          priority?: number | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          agent?: string | null
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          priority?: number | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          project_id: string
          role: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          project_id: string
          role: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          project_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      layout_versions: {
        Row: {
          commit_message: string | null
          created_at: string
          created_by: string | null
          id: string
          is_current: boolean
          layout_tree: Json
          project_id: string
          version_number: number
        }
        Insert: {
          commit_message?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_current?: boolean
          layout_tree: Json
          project_id: string
          version_number?: number
        }
        Update: {
          commit_message?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_current?: boolean
          layout_tree?: Json
          project_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "layout_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      page_templates: {
        Row: {
          created_at: string | null
          id: string
          name: string
          output_folder: string | null
          output_pattern: string
          project_id: string
          source_file_path: string
          tags: string[]
          updated_at: string | null
          variations: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          output_folder?: string | null
          output_pattern?: string
          project_id: string
          source_file_path: string
          tags?: string[]
          updated_at?: string | null
          variations?: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          output_folder?: string | null
          output_pattern?: string
          project_id?: string
          source_file_path?: string
          tags?: string[]
          updated_at?: string | null
          variations?: Json
        }
        Relationships: [
          {
            foreignKeyName: "page_templates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          content: string
          created_at: string
          file_name: string
          file_path: string
          file_type: string
          id: string
          project_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          file_name: string
          file_path: string
          file_type: string
          id?: string
          project_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_settings: {
        Row: {
          address: string | null
          business_hours: Json | null
          city: string | null
          company_name: string | null
          created_at: string
          custom_fields: Json | null
          email: string | null
          favicon_url: string | null
          gallery_images: string[] | null
          id: string
          logo_url: string | null
          phone: string | null
          project_id: string
          slogan: string | null
          social_links: Json | null
          state: string | null
          updated_at: string
          whatsapp: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          business_hours?: Json | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          custom_fields?: Json | null
          email?: string | null
          favicon_url?: string | null
          gallery_images?: string[] | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          project_id: string
          slogan?: string | null
          social_links?: Json | null
          state?: string | null
          updated_at?: string
          whatsapp?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          business_hours?: Json | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          custom_fields?: Json | null
          email?: string | null
          favicon_url?: string | null
          gallery_images?: string[] | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          project_id?: string
          slogan?: string | null
          social_links?: Json | null
          state?: string | null
          updated_at?: string
          whatsapp?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_settings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          layout_tree: Json | null
          name: string
          status: string
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          layout_tree?: Json | null
          name: string
          status?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          layout_tree?: Json | null
          name?: string
          status?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      theme_files: {
        Row: {
          content: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_type: string
          id: string
          size_bytes: number | null
          storage_url: string | null
          theme_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_type: string
          id?: string
          size_bytes?: number | null
          storage_url?: string | null
          theme_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          size_bytes?: number | null
          storage_url?: string | null
          theme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "theme_files_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          file_count: number | null
          id: string
          is_active: boolean | null
          name: string
          preview_image_url: string | null
          tags: string[] | null
          total_size_bytes: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          file_count?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          preview_image_url?: string | null
          tags?: string[] | null
          total_size_bytes?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          file_count?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          preview_image_url?: string | null
          tags?: string[] | null
          total_size_bytes?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
