-- Fix RLS policies for group_members - change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Group members are viewable by everyone" ON public.group_members;
DROP POLICY IF EXISTS "Admins can insert group members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can update group members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can delete group members" ON public.group_members;

CREATE POLICY "Group members are viewable by everyone" 
ON public.group_members 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert group members" 
ON public.group_members 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM research_groups rg 
  WHERE rg.id = group_members.group_id 
  AND can_access_lab(rg.lab_id, auth.uid())
));

CREATE POLICY "Admins can update group members" 
ON public.group_members 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM research_groups rg 
  WHERE rg.id = group_members.group_id 
  AND can_access_lab(rg.lab_id, auth.uid())
));

CREATE POLICY "Admins can delete group members" 
ON public.group_members 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM research_groups rg 
  WHERE rg.id = group_members.group_id 
  AND can_access_lab(rg.lab_id, auth.uid())
));

-- Fix RLS policies for group_results - change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Group results are viewable by everyone" ON public.group_results;
DROP POLICY IF EXISTS "Admins can insert group results" ON public.group_results;
DROP POLICY IF EXISTS "Admins can update group results" ON public.group_results;
DROP POLICY IF EXISTS "Admins can delete group results" ON public.group_results;

CREATE POLICY "Group results are viewable by everyone" 
ON public.group_results 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert group results" 
ON public.group_results 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM research_groups rg 
  WHERE rg.id = group_results.group_id 
  AND can_access_lab(rg.lab_id, auth.uid())
));

CREATE POLICY "Admins can update group results" 
ON public.group_results 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM research_groups rg 
  WHERE rg.id = group_results.group_id 
  AND can_access_lab(rg.lab_id, auth.uid())
));

CREATE POLICY "Admins can delete group results" 
ON public.group_results 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM research_groups rg 
  WHERE rg.id = group_results.group_id 
  AND can_access_lab(rg.lab_id, auth.uid())
));