export interface ProjectFile {
  id: string;
  project_id: string;
  file_path: string;
  file_name: string;
  file_type: 'html' | 'css' | 'js';
  content: string;
  created_at: string;
  updated_at: string;
}

export interface GeneratedFilesResponse {
  projectName: string;
  files: {
    path: string;
    name: string;
    type: 'html' | 'css' | 'js';
    content: string;
  }[];
}

export interface FileTreeItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  fileType?: 'html' | 'css' | 'js';
  children?: FileTreeItem[];
}
