
export type FileObject = {
  name: string;
  id: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
  url?: string;
  size?: number;
  uploader?: string;
};

export interface CompanyDocumentsProps {
  companyId: string;
}
