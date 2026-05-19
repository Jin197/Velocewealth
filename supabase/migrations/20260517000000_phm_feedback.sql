-- Migration: 20260517000000_phm_feedback
-- Description: Creates the phm_feedback table to store user validation of AI anomalies

CREATE TABLE IF NOT EXISTS public.phm_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    component_name TEXT NOT NULL,
    anomaly_reason TEXT,
    is_confirmed BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.phm_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own feedback
CREATE POLICY "Users can view their own vehicle feedback" ON public.phm_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.vehicles v 
            WHERE v.id = phm_feedback.vehicle_id 
            AND v.user_id = auth.uid()
        )
    );

-- Policy: Users can insert feedback for their vehicles
CREATE POLICY "Users can insert feedback for their vehicles" ON public.phm_feedback
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.vehicles v 
            WHERE v.id = phm_feedback.vehicle_id 
            AND v.user_id = auth.uid()
        )
    );

-- Index for fast lookup by vehicle and component
CREATE INDEX IF NOT EXISTS idx_phm_feedback_vehicle_component 
    ON public.phm_feedback(vehicle_id, component_name);
