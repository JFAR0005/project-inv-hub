
export interface FounderUpdate {
  id: string;
  company_id: string;
  submitted_by: string;
  arr: number | null;
  mrr: number | null;
  burn_rate: number | null;
  runway: number | null;
  headcount: number | null;
  churn: number | null;
  raise_status: RaiseStatus | null;
  raise_target_amount: number | null;
  requested_intros: string | null;
  comments: string | null;
  deck_url: string | null;
  submitted_at: string;
}

export interface Metric {
  id: string;
  company_id: string;
  metric_name: string;
  value: number;
  date: string;
}

export interface CompanyFile {
  id: string;
  company_id: string;
  uploader_id: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

export type RaiseStatus = 'Not Raising' | 'Planning' | 'Raising' | 'Closed';
