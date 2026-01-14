-- Add document_url column for PDF manuals and documents
ALTER TABLE public.infrastructure
ADD COLUMN document_url TEXT;