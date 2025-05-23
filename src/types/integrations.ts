
export interface Integration {
  id: string;
  service: string;
  is_connected: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  description: string;
  events: string[];
  headers: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  last_triggered_at: string | null;
  success_count: number;
  failure_count: number;
}

export interface ApiLog {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time?: number;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}
