-- Create a table for free-form publication content per year
CREATE TABLE public.publication_years (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_id UUID NOT NULL REFERENCES public.laboratories(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lab_id, year)
);

-- Enable RLS
ALTER TABLE public.publication_years ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view publication years"
ON public.publication_years
FOR SELECT
USING (true);

-- Lab admins can manage their lab's publication years
CREATE POLICY "Lab admins can manage publication years"
ON public.publication_years
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND (
      user_roles.role = 'super_admin'
      OR (user_roles.role = 'lab_admin' AND user_roles.lab_id = publication_years.lab_id)
    )
  )
);

-- Create index for faster lookups
CREATE INDEX idx_publication_years_lab_year ON public.publication_years(lab_id, year DESC);