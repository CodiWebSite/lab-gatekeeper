-- Add explore_url field to laboratories for custom redirect links
ALTER TABLE public.laboratories 
ADD COLUMN explore_url TEXT NULL;