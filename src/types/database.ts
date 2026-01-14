// Database types for ICMPP Laboratories
export type AppRole = 'super_admin' | 'lab_admin';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  lab_id: string | null;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface Laboratory {
  id: string;
  name: string;
  short_name: string | null;
  head_name: string;
  head_email: string | null;
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  explore_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResearchGroup {
  id: string;
  lab_id: string;
  name: string;
  description: string | null;
  leader_name: string | null;
  leader_email: string | null;
  members: string[] | null;
  topics: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  name: string;
  position: string | null;
  email: string | null;
  description: string | null;
  photo_url: string | null;
  cv_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface GroupResult {
  id: string;
  group_id: string;
  title: string | null;
  content: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Old Publication interface (kept for backward compatibility)
export interface Publication {
  id: string;
  lab_id: string;
  title: string;
  authors: string;
  journal: string | null;
  year: number;
  volume: string | null;
  pages: string | null;
  doi: string | null;
  url: string | null;
  abstract: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// New PublicationYear interface for free-form content per year
export interface PublicationYear {
  id: string;
  lab_id: string;
  year: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  lab_id: string;
  title: string;
  description: string | null;
  funding_source: string | null;
  budget: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  project_code: string | null;
  director_name: string | null;
  url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Infrastructure {
  id: string;
  lab_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  specifications: string | null;
  responsible_name: string | null;
  responsible_email: string | null;
  external_link: string | null;
  document_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: string;
  lab_id: string | null;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
}

// Tab types for lab detail page
export type LabTab = 'descriere' | 'grupuri' | 'publicatii' | 'proiecte' | 'infrastructura';

export const LAB_TABS: { id: LabTab; label: string }[] = [
  { id: 'descriere', label: 'Descriere' },
  { id: 'grupuri', label: 'Grupuri cercetare' },
  { id: 'publicatii', label: 'Publicații' },
  { id: 'proiecte', label: 'Proiecte' },
  { id: 'infrastructura', label: 'Infrastructură' },
];
