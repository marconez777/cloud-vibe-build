export interface LayoutTree {
  id: string;
  name: string;
  pages: Page[];
  globalStyles: GlobalStyles;
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  isHomepage: boolean;
  sections: Section[];
}

export interface Section {
  id: string;
  type: SectionType;
  content: Record<string, unknown>;
  styles?: SectionStyles;
}

export type SectionType =
  | 'hero'
  | 'services'
  | 'features'
  | 'about'
  | 'stats'
  | 'testimonials'
  | 'team'
  | 'pricing'
  | 'faq'
  | 'gallery'
  | 'blog'
  | 'contact'
  | 'cta'
  | 'footer';

export interface GlobalStyles {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headingFont: string;
}

export interface SectionStyles {
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'generating' | 'ready' | 'error';
  layout_tree: LayoutTree | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface LayoutVersion {
  id: string;
  project_id: string;
  layout_tree: LayoutTree;
  version_number: number;
  commit_message: string | null;
  created_by: string;
  is_current: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
