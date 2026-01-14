-- Create table for individual publication entries
CREATE TABLE public.publication_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_id UUID NOT NULL REFERENCES public.laboratories(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.publication_entries ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view publication entries"
ON public.publication_entries
FOR SELECT
USING (true);

-- Lab admins can manage their lab's publication entries
CREATE POLICY "Lab admins can manage publication entries"
ON public.publication_entries
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND (
      user_roles.role = 'super_admin'
      OR (user_roles.role = 'lab_admin' AND user_roles.lab_id = publication_entries.lab_id)
    )
  )
);

-- Create index for faster lookups
CREATE INDEX idx_publication_entries_lab_year ON public.publication_entries(lab_id, year DESC, display_order ASC);