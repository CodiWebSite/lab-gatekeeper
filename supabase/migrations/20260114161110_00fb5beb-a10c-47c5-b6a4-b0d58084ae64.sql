-- Drop ALL existing policies on group_members and group_results
DROP POLICY IF EXISTS "Group members are viewable by everyone" ON public.group_members;
DROP POLICY IF EXISTS "Admins can insert group members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can update group members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can delete group members" ON public.group_members;

DROP POLICY IF EXISTS "Group results are viewable by everyone" ON public.group_results;
DROP POLICY IF EXISTS "Admins can insert group results" ON public.group_results;
DROP POLICY IF EXISTS "Admins can update group results" ON public.group_results;
DROP POLICY IF EXISTS "Admins can delete group results" ON public.group_results;

-- Create PERMISSIVE policies for group_members with correct parameter order
-- can_access_lab expects (_user_id, _lab_id)
CREATE POLICY "Group members are viewable by everyone" 
ON public.group_members 
AS PERMISSIVE
FOR SELECT 
TO public
USING (true);

CREATE POLICY "Admins can insert group members" 
ON public.group_members 
AS PERMISSIVE
FOR INSERT 
TO authenticated
WITH CHECK (
  can_access_lab(
    auth.uid(),
    (SELECT lab_id FROM research_groups WHERE id = group_id)
  )
);

CREATE POLICY "Admins can update group members" 
ON public.group_members 
AS PERMISSIVE
FOR UPDATE 
TO authenticated
USING (
  can_access_lab(
    auth.uid(),
    (SELECT lab_id FROM research_groups WHERE id = group_id)
  )
);

CREATE POLICY "Admins can delete group members" 
ON public.group_members 
AS PERMISSIVE
FOR DELETE 
TO authenticated
USING (
  can_access_lab(
    auth.uid(),
    (SELECT lab_id FROM research_groups WHERE id = group_id)
  )
);

-- Create PERMISSIVE policies for group_results with correct parameter order
CREATE POLICY "Group results are viewable by everyone" 
ON public.group_results 
AS PERMISSIVE
FOR SELECT 
TO public
USING (true);

CREATE POLICY "Admins can insert group results" 
ON public.group_results 
AS PERMISSIVE
FOR INSERT 
TO authenticated
WITH CHECK (
  can_access_lab(
    auth.uid(),
    (SELECT lab_id FROM research_groups WHERE id = group_id)
  )
);

CREATE POLICY "Admins can update group results" 
ON public.group_results 
AS PERMISSIVE
FOR UPDATE 
TO authenticated
USING (
  can_access_lab(
    auth.uid(),
    (SELECT lab_id FROM research_groups WHERE id = group_id)
  )
);

CREATE POLICY "Admins can delete group results" 
ON public.group_results 
AS PERMISSIVE
FOR DELETE 
TO authenticated
USING (
  can_access_lab(
    auth.uid(),
    (SELECT lab_id FROM research_groups WHERE id = group_id)
  )
);