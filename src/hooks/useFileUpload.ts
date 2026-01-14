import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadOptions {
  bucket: string;
  folder?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export function useFileUpload(options: UploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File): Promise<string | null> => {
    const { bucket, folder = '', maxSizeMB = 5, allowedTypes } = options;

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Fișierul este prea mare. Maxim ${maxSizeMB}MB.`);
      return null;
    }

    // Validate file type
    if (allowedTypes && !allowedTypes.some(type => file.type.startsWith(type))) {
      toast.error('Tip de fișier neacceptat.');
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Generate unique filename
      const ext = file.name.split('.').pop();
      const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setProgress(100);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Eroare la încărcarea fișierului.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (url: string): Promise<boolean> => {
    try {
      // Extract path from URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.findIndex(p => p === options.bucket);
      if (bucketIndex === -1) return false;
      
      const filePath = pathParts.slice(bucketIndex + 1).join('/');
      
      const { error } = await supabase.storage
        .from(options.bucket)
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  };

  return { upload, deleteFile, uploading, progress };
}
