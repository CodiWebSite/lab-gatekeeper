-- Drop and recreate policies for group_members with correct syntax
DROP POLICY IF EXISTS "Group members are viewable by everyone" ON public.group_members;
DROP POLICY IF EXISTS "Admins can insert group members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can update group members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can delete group members" ON public.group_members;

-- Create permissive policies
CREATE POLICY "Group members are viewable by everyone" 
ON public.group_members 
FOR SELECT 
USING (true);

-- For INSERT, we need to check the group_id being inserted
CREATE POLICY "Admins can insert group members" 
ON public.group_members 
FOR INSERT 
WITH CHECK (
  can_access_lab(
    (SELECT lab_id FROM research_groups WHERE id = group_id),
    auth.uid()
  )
);

CREATE POLICY "Admins can update group members" 
ON public.group_members 
FOR UPDATE 
USING (
  can_access_lab(
    (SELECT lab_id FROM research_groups WHERE id = group_id),
    auth.uid()
  )
);

CREATE POLICY "Admins can delete group members" 
ON public.group_members 
FOR DELETE 
USING (
  can_access_lab(
    (SELECT lab_id FROM research_groups WHERE id = group_id),
    auth.uid()
  )
);

-- Same fix for group_results
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
WITH CHECK (
  can_access_lab(
    (SELECT lab_id FROM research_groups WHERE id = group_id),
    auth.uid()
  )
);

CREATE POLICY "Admins can update group results" 
ON public.group_results 
FOR UPDATE 
USING (
  can_access_lab(
    (SELECT lab_id FROM research_groups WHERE id = group_id),
    auth.uid()
  )
);

CREATE POLICY "Admins can delete group results" 
ON public.group_results 
FOR DELETE 
USING (
  can_access_lab(
    (SELECT lab_id FROM research_groups WHERE id = group_id),
    auth.uid()
  )
);