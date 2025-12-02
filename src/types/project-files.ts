export type FileType = 'html' | 'css' | 'js' | 'javascript' | 'json' | 'text' | 'xml';

export interface ProjectFile {
  id: string;
  project_id: string;
  file_path: string;
  file_name: string;
  file_type: FileType;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface GeneratedFilesResponse {
  projectName: string;
  files: {
    path: string;
    name: string;
    type: FileType;
    content: string;
  }[];
}

export interface FileTreeItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  fileType?: FileType;
  children?: FileTreeItem[];
}
