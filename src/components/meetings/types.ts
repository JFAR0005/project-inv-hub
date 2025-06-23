
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  company_id?: string;
  company_name?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}
