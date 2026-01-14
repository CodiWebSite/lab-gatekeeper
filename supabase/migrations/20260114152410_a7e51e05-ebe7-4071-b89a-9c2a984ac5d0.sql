
-- Create table for team members within research groups
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.research_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT,
  email TEXT,
  description TEXT,
  photo_url TEXT,
  cv_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for main results/achievements of research groups
CREATE TABLE public.group_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.research_groups(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add topics field to research_groups
ALTER TABLE public.research_groups 
ADD COLUMN topics TEXT;

-- Enable RLS
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_results ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Group members are viewable by everyone" 
ON public.group_members 
FOR SELECT 
USING (true);

CREATE POLICY "Group results are viewable by everyone" 
ON public.group_results 
FOR SELECT 
USING (true);

-- Admin write policies for group_members
CREATE POLICY "Admins can insert group members" 
ON public.group_members 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.research_groups rg
    WHERE rg.id = group_id
    AND public.can_access_lab(rg.lab_id, auth.uid())
  )
);

CREATE POLICY "Admins can update group members" 
ON public.group_members 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.research_groups rg
    WHERE rg.id = group_id
    AND public.can_access_lab(rg.lab_id, auth.uid())
  )
);

CREATE POLICY "Admins can delete group members" 
ON public.group_members 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.research_groups rg
    WHERE rg.id = group_id
    AND public.can_access_lab(rg.lab_id, auth.uid())
  )
);

-- Admin write policies for group_results
CREATE POLICY "Admins can insert group results" 
ON public.group_results 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.research_groups rg
    WHERE rg.id = group_id
    AND public.can_access_lab(rg.lab_id, auth.uid())
  )
);

CREATE POLICY "Admins can update group results" 
ON public.group_results 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.research_groups rg
    WHERE rg.id = group_id
    AND public.can_access_lab(rg.lab_id, auth.uid())
  )
);

CREATE POLICY "Admins can delete group results" 
ON public.group_results 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.research_groups rg
    WHERE rg.id = group_id
    AND public.can_access_lab(rg.lab_id, auth.uid())
  )
);

-- Create updated_at triggers
CREATE TRIGGER update_group_members_updated_at
BEFORE UPDATE ON public.group_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_results_updated_at
BEFORE UPDATE ON public.group_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
