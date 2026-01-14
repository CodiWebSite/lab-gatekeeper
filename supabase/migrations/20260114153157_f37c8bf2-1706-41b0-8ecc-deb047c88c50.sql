
-- Create storage bucket for research group files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('research-groups', 'research-groups', true);

-- Allow public read access
CREATE POLICY "Research group files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'research-groups');

-- Allow authenticated users to upload to research-groups bucket
CREATE POLICY "Authenticated users can upload research group files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'research-groups' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their uploaded files
CREATE POLICY "Authenticated users can update research group files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'research-groups' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete research group files"
ON storage.objects FOR DELETE
USING (bucket_id = 'research-groups' AND auth.role() = 'authenticated');
