export interface Theme {
  id: string;
  name: string;
  description: string | null;
  category: string;
  preview_image_url: string | null;
  file_count: number;
  total_size_bytes: number;
  is_active: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ThemeFile {
  id: string;
  theme_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  content: string | null;
  storage_url: string | null;
  size_bytes: number;
  created_at: string;
}

export type ThemeCategory = 
  | 'general' 
  | 'clinic' 
  | 'restaurant' 
  | 'service' 
  | 'ecommerce' 
  | 'portfolio' 
  | 'landing';

export const THEME_CATEGORIES: { value: ThemeCategory; label: string }[] = [
  { value: 'general', label: 'Geral' },
  { value: 'clinic', label: 'Clínica' },
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'service', label: 'Serviços' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'portfolio', label: 'Portfólio' },
  { value: 'landing', label: 'Landing Page' },
];
