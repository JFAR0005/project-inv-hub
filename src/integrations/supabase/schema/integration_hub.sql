
-- Webhooks Table
CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    events TEXT[] NOT NULL DEFAULT '{}',
    headers JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0
);

-- Service Integrations Table
CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    service TEXT NOT NULL, -- slack, ms-teams, email, etc.
    is_connected BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (service)
);

-- API Usage Logs Table
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    response_time INTEGER,
    user_id UUID,
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhooks_events ON public.webhooks USING gin (events);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_timestamp ON public.api_usage_logs (timestamp);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_endpoint ON public.api_usage_logs (endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_status_code ON public.api_usage_logs (status_code);

-- Add triggers for updated_at fields
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_webhooks_timestamp
BEFORE UPDATE ON public.webhooks
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_integrations_timestamp
BEFORE UPDATE ON public.integrations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
