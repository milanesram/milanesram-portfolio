/**
 * Temporary typed boundary for the planned public schema.
 *
 * After the migration is applied to the hosted project, replace this file
 * with generated types:
 *
 *   npx supabase gen types typescript --project-id <project-ref> > src/lib/supabase/database.types.ts
 *
 * Do not commit project IDs or secrets alongside that command.
 */

export type ContentStatus = "draft" | "published" | "archived";
export type TrackTag = "all" | "cybersecurity_grc" | "privacy_ai";
export type ExperienceKind =
  | "employment"
  | "consulting"
  | "additional"
  | "leadership";
export type ExperienceDatePrecision = "month" | "year";
export type CredentialKind = "degree" | "certification" | "training" | "license";
export type EngagementKind =
  | "speaking"
  | "advisory"
  | "award"
  | "leadership"
  | "teaching"
  | "category";
export type InquiryContext = "recruiter" | "hiring_manager" | "other";
export type InquiryTrack = "cybersecurity_grc" | "privacy_ai" | "either";
export type MediaKind = "resume_pdf" | "image" | "document";
export type MediaPurpose =
  | "portrait"
  | "journey"
  | "project"
  | "publication"
  | "resume";
export type DocumentKind =
  | "publication"
  | "white_paper"
  | "editorial"
  | "feature"
  | "four_minute_read"
  | "other";
export type PublicationRightsStatus =
  | "host_pdf"
  | "link_only"
  | "review_required";
export type AdminRole = "owner" | "admin";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Row = {
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      user_roles: {
        Row: Row & {
          user_id: string;
          role: AdminRole;
        };
        Insert: {
          user_id: string;
          role: AdminRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Insert"]>;
        Relationships: [];
      };
      site_profile: {
        Row: Row & {
          id: string;
          singleton_key: "default";
          display_name: string;
          headline: string;
          summary: string;
          work_authorization: string;
          location_display: string | null;
          linkedin_url: string;
          public_email: string;
          hero_cta_primary_label: string | null;
          status: ContentStatus;
        };
        Insert: Partial<Database["public"]["Tables"]["site_profile"]["Row"]> & {
          display_name: string;
          headline: string;
          summary: string;
          work_authorization: string;
          linkedin_url: string;
          public_email: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_profile"]["Insert"]>;
        Relationships: [];
      };
      site_settings: {
        Row: Row & {
          id: string;
          singleton_key: "default";
          contact_form_enabled: boolean;
          site_indexable: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Insert"]>;
        Relationships: [];
      };
      focus_pages: {
        Row: Row & {
          id: string;
          slug: string;
          nav_label: string;
          headline: string;
          summary: string;
          competencies: string[];
          resume_media_id: string | null;
          featured_project_id: string | null;
          featured_publication_id: string | null;
          featured_project_lede: string | null;
          card_summary: string | null;
          card_chips: string[];
          status: ContentStatus;
          sort_order: number;
        };
        Insert: {
          id?: string;
          slug: string;
          nav_label: string;
          headline: string;
          summary: string;
          competencies?: string[];
          resume_media_id?: string | null;
          featured_project_id?: string | null;
          featured_publication_id?: string | null;
          featured_project_lede?: string | null;
          card_summary?: string | null;
          card_chips?: string[];
          status?: ContentStatus;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["focus_pages"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "focus_pages_resume_media_id_fkey";
            columns: ["resume_media_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "focus_pages_featured_project_id_fkey";
            columns: ["featured_project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "focus_pages_featured_publication_id_fkey";
            columns: ["featured_publication_id"];
            isOneToOne: false;
            referencedRelation: "publications";
            referencedColumns: ["id"];
          },
        ];
      };
      focus_experience_items: {
        Row: Row & {
          id: string;
          focus_page_id: string;
          experience_item_id: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          focus_page_id: string;
          experience_item_id: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["focus_experience_items"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "focus_experience_items_focus_page_id_fkey";
            columns: ["focus_page_id"];
            isOneToOne: false;
            referencedRelation: "focus_pages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "focus_experience_items_experience_item_id_fkey";
            columns: ["experience_item_id"];
            isOneToOne: false;
            referencedRelation: "experience_items";
            referencedColumns: ["id"];
          },
        ];
      };
      focus_credentials: {
        Row: Row & {
          id: string;
          focus_page_id: string;
          credential_id: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          focus_page_id: string;
          credential_id: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["focus_credentials"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "focus_credentials_focus_page_id_fkey";
            columns: ["focus_page_id"];
            isOneToOne: false;
            referencedRelation: "focus_pages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "focus_credentials_credential_id_fkey";
            columns: ["credential_id"];
            isOneToOne: false;
            referencedRelation: "credentials";
            referencedColumns: ["id"];
          },
        ];
      };
      experiences: {
        Row: Row & {
          id: string;
          organization: string;
          title: string;
          title_secondary: string | null;
          location_display: string;
          kind: ExperienceKind;
          start_date: string | null;
          end_date: string | null;
          date_precision: ExperienceDatePrecision;
          start_year: number | null;
          end_year: number | null;
          is_current: boolean;
          is_featured: boolean;
          summary: string | null;
          status: ContentStatus;
          sort_order: number;
        };
        Insert: {
          id?: string;
          organization: string;
          title: string;
          title_secondary?: string | null;
          location_display: string;
          kind: ExperienceKind;
          start_date?: string | null;
          end_date?: string | null;
          date_precision?: ExperienceDatePrecision;
          start_year?: number | null;
          end_year?: number | null;
          is_current?: boolean;
          is_featured?: boolean;
          summary?: string | null;
          status?: ContentStatus;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["experiences"]["Insert"]>;
        Relationships: [];
      };
      experience_items: {
        Row: Row & {
          id: string;
          experience_id: string;
          body: string;
          track: TrackTag;
          is_metric: boolean;
          metric_context: string | null;
          show_on_home: boolean;
          status: ContentStatus;
          sort_order: number;
        };
        Insert: {
          id?: string;
          experience_id: string;
          body: string;
          track?: TrackTag;
          is_metric?: boolean;
          metric_context?: string | null;
          show_on_home?: boolean;
          status?: ContentStatus;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["experience_items"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "experience_items_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: Row & {
          id: string;
          slug: string;
          name: string;
          tagline: string;
          year_label: string;
          role: string;
          summary: string;
          stack: string[];
          limits: string;
          is_featured: boolean;
          status: ContentStatus;
          sort_order: number;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          tagline: string;
          year_label: string;
          role: string;
          summary: string;
          stack?: string[];
          limits: string;
          is_featured?: boolean;
          status?: ContentStatus;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
        Relationships: [];
      };
      project_sections: {
        Row: Row & {
          id: string;
          project_id: string;
          heading: string;
          body: string;
          track: TrackTag;
          status: ContentStatus;
          sort_order: number;
        };
        Insert: {
          id?: string;
          project_id: string;
          heading: string;
          body: string;
          track?: TrackTag;
          status?: ContentStatus;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["project_sections"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "project_sections_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      publications: {
        Row: Row & {
          id: string;
          slug: string;
          title: string;
          document_kind: DocumentKind;
          rights_status: PublicationRightsStatus;
          author: string | null;
          publisher: string;
          published_on: string | null;
          year_label: string;
          abstract: string;
          external_url: string | null;
          track: TrackTag;
          status: ContentStatus;
          sort_order: number;
          media_id: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          document_kind: DocumentKind;
          rights_status?: PublicationRightsStatus;
          author?: string | null;
          publisher: string;
          published_on?: string | null;
          year_label: string;
          abstract: string;
          external_url?: string | null;
          track?: TrackTag;
          status?: ContentStatus;
          sort_order?: number;
          media_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["publications"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "publications_media_id_fkey";
            columns: ["media_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
        ];
      };
      credentials: {
        Row: Row & {
          id: string;
          kind: CredentialKind;
          name: string;
          issuer: string;
          year_label: string | null;
          details: string | null;
          needs_verification: boolean;
          track: TrackTag;
          highlight: boolean;
          status: ContentStatus;
          sort_order: number;
        };
        Insert: {
          id?: string;
          kind: CredentialKind;
          name: string;
          issuer: string;
          year_label?: string | null;
          details?: string | null;
          needs_verification?: boolean;
          track?: TrackTag;
          highlight?: boolean;
          status?: ContentStatus;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["credentials"]["Insert"]>;
        Relationships: [];
      };
      home_page: {
        Row: Row & {
          id: string;
          singleton_key: "default";
          status: ContentStatus;
          featured_project_id: string | null;
          headline: string;
          lede: string;
          primary_cta_label: string;
          primary_cta_href: string;
          secondary_cta_label: string;
          secondary_cta_href: string;
          project_kicker: string;
          project_heading: string;
          project_problem: string;
          project_body: string;
          project_cta_label: string;
          project_cta_href: string;
          project_proof_points: string[];
          experience_kicker: string;
          experience_heading: string;
          experience_lede: string;
          experience_cta_label: string;
          experience_cta_href: string;
          credentials_kicker: string;
          credentials_heading: string;
          credentials_lede: string;
          credentials_cta_label: string;
          credentials_cta_href: string;
          focus_kicker: string;
          focus_heading: string;
          focus_lede: string;
          closing_heading: string;
          closing_body: string;
          closing_primary_cta_label: string;
          closing_primary_cta_href: string;
          closing_secondary_cta_label: string;
          closing_secondary_cta_href: string;
          seo_title: string;
          seo_description: string;
        };
        Insert: Partial<Database["public"]["Tables"]["home_page"]["Row"]> & {
          headline: string;
          lede: string;
          primary_cta_label: string;
          primary_cta_href: string;
          secondary_cta_label: string;
          secondary_cta_href: string;
          project_kicker: string;
          project_heading: string;
          project_problem: string;
          project_body: string;
          project_cta_label: string;
          project_cta_href: string;
          experience_kicker: string;
          experience_heading: string;
          experience_lede: string;
          experience_cta_label: string;
          experience_cta_href: string;
          credentials_kicker: string;
          credentials_heading: string;
          credentials_lede: string;
          credentials_cta_label: string;
          credentials_cta_href: string;
          focus_kicker: string;
          focus_heading: string;
          focus_lede: string;
          closing_heading: string;
          closing_body: string;
          closing_primary_cta_label: string;
          closing_primary_cta_href: string;
          closing_secondary_cta_label: string;
          closing_secondary_cta_href: string;
          seo_title: string;
          seo_description: string;
        };
        Update: Partial<Database["public"]["Tables"]["home_page"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "home_page_featured_project_id_fkey";
            columns: ["featured_project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      home_page_chips: {
        Row: Row & {
          id: string;
          home_page_id: string;
          label: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          home_page_id: string;
          label: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["home_page_chips"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "home_page_chips_home_page_id_fkey";
            columns: ["home_page_id"];
            isOneToOne: false;
            referencedRelation: "home_page";
            referencedColumns: ["id"];
          },
        ];
      };
      home_proof_items: {
        Row: Row & {
          id: string;
          home_page_id: string;
          label: string;
          supporting: string;
          href: string | null;
          credential_id: string | null;
          project_id: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          home_page_id: string;
          label: string;
          supporting: string;
          href?: string | null;
          credential_id?: string | null;
          project_id?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["home_proof_items"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "home_proof_items_home_page_id_fkey";
            columns: ["home_page_id"];
            isOneToOne: false;
            referencedRelation: "home_page";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "home_proof_items_credential_id_fkey";
            columns: ["credential_id"];
            isOneToOne: false;
            referencedRelation: "credentials";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "home_proof_items_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      home_experience_items: {
        Row: Row & {
          id: string;
          home_page_id: string;
          experience_item_id: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          home_page_id: string;
          experience_item_id: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["home_experience_items"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "home_experience_items_home_page_id_fkey";
            columns: ["home_page_id"];
            isOneToOne: false;
            referencedRelation: "home_page";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "home_experience_items_experience_item_id_fkey";
            columns: ["experience_item_id"];
            isOneToOne: false;
            referencedRelation: "experience_items";
            referencedColumns: ["id"];
          },
        ];
      };
      home_credentials: {
        Row: Row & {
          id: string;
          home_page_id: string;
          credential_id: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          home_page_id: string;
          credential_id: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["home_credentials"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "home_credentials_home_page_id_fkey";
            columns: ["home_page_id"];
            isOneToOne: false;
            referencedRelation: "home_page";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "home_credentials_credential_id_fkey";
            columns: ["credential_id"];
            isOneToOne: false;
            referencedRelation: "credentials";
            referencedColumns: ["id"];
          },
        ];
      };
      about_page: {
        Row: Row & {
          id: string;
          singleton_key: "default";
          status: ContentStatus;
          kicker: string;
          headline: string;
          lede: string;
          journey_heading: string;
          education_heading: string;
          speaking_heading: string;
          speaking_body: string;
          boundaries_heading: string;
          seo_title: string;
          seo_description: string;
        };
        Insert: Partial<Database["public"]["Tables"]["about_page"]["Row"]> & {
          kicker: string;
          headline: string;
          lede: string;
          journey_heading: string;
          education_heading: string;
          speaking_heading: string;
          speaking_body: string;
          boundaries_heading: string;
          seo_title: string;
          seo_description: string;
        };
        Update: Partial<Database["public"]["Tables"]["about_page"]["Insert"]>;
        Relationships: [];
      };
      about_page_paragraphs: {
        Row: Row & {
          id: string;
          about_page_id: string;
          body: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          about_page_id: string;
          body: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["about_page_paragraphs"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "about_page_paragraphs_about_page_id_fkey";
            columns: ["about_page_id"];
            isOneToOne: false;
            referencedRelation: "about_page";
            referencedColumns: ["id"];
          },
        ];
      };
      about_page_list_items: {
        Row: Row & {
          id: string;
          about_page_id: string;
          kind: "speaking" | "boundary";
          body: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          about_page_id: string;
          kind: "speaking" | "boundary";
          body: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["about_page_list_items"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "about_page_list_items_about_page_id_fkey";
            columns: ["about_page_id"];
            isOneToOne: false;
            referencedRelation: "about_page";
            referencedColumns: ["id"];
          },
        ];
      };
      journey_milestones: {
        Row: Row & {
          id: string;
          title: string;
          year: number | null;
          caption: string;
          media_asset_id: string | null;
          sort_order: number;
          status: ContentStatus;
        };
        Insert: {
          id?: string;
          title: string;
          year?: number | null;
          caption: string;
          media_asset_id?: string | null;
          sort_order?: number;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["journey_milestones"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "journey_milestones_media_asset_id_fkey";
            columns: ["media_asset_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
        ];
      };
      engagements: {
        Row: Row & {
          id: string;
          kind: EngagementKind;
          title: string;
          host: string | null;
          role_label: string | null;
          year_label: string | null;
          body: string | null;
          track: TrackTag;
          status: ContentStatus;
          sort_order: number;
        };
        Insert: {
          id?: string;
          kind: EngagementKind;
          title: string;
          host?: string | null;
          role_label?: string | null;
          year_label?: string | null;
          body?: string | null;
          track?: TrackTag;
          status?: ContentStatus;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["engagements"]["Insert"]>;
        Relationships: [];
      };
      media_assets: {
        Row: Row & {
          id: string;
          bucket_path: string;
          kind: MediaKind;
          purpose: MediaPurpose | null;
          title: string;
          alt_text: string | null;
          caption: string | null;
          credit: string | null;
          year_label: string | null;
          mime_type: string | null;
          byte_size: number | null;
          sort_order: number;
          is_public: boolean;
          status: ContentStatus;
        };
        Insert: {
          id?: string;
          bucket_path: string;
          kind: MediaKind;
          purpose?: MediaPurpose | null;
          title: string;
          alt_text?: string | null;
          caption?: string | null;
          credit?: string | null;
          year_label?: string | null;
          mime_type?: string | null;
          byte_size?: number | null;
          sort_order?: number;
          is_public?: boolean;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["media_assets"]["Insert"]>;
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          name: string;
          email: string;
          organization: string | null;
          context: InquiryContext;
          track: InquiryTrack;
          message: string;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          organization?: string | null;
          context: InquiryContext;
          track?: InquiryTrack;
          message: string;
          created_at?: string;
          read_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["inquiries"]["Insert"]>;
        Relationships: [];
      };
      inquiry_submission_events: {
        Row: {
          id: string;
          fingerprint_hash: string;
          email_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          fingerprint_hash: string;
          email_hash: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["inquiry_submission_events"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      submit_public_inquiry: {
        Args: {
          p_name: string;
          p_email: string;
          p_organization: string | null;
          p_context: InquiryContext;
          p_track: InquiryTrack;
          p_message: string;
          p_fingerprint_hash: string;
          p_email_hash: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      content_status: ContentStatus;
      track_tag: TrackTag;
      experience_kind: ExperienceKind;
      experience_date_precision: ExperienceDatePrecision;
      credential_kind: CredentialKind;
      engagement_kind: EngagementKind;
      inquiry_context: InquiryContext;
      inquiry_track: InquiryTrack;
      media_kind: MediaKind;
      media_purpose: MediaPurpose;
      document_kind: DocumentKind;
      publication_rights_status: PublicationRightsStatus;
      admin_role: AdminRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
