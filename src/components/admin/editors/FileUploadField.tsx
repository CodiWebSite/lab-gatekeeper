import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';

interface FileUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  folder?: string;
  type?: 'image' | 'document';
  placeholder?: string;
}

export function FileUploadField({ 
  label, 
  value, 
  onChange, 
  accept = 'image/*',
  folder = 'general',
  type = 'image',
  placeholder = 'https://...'
}: FileUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useUrl, setUseUrl] = useState(!value || value.startsWith('http'));
  
  const { upload, uploading } = useFileUpload({
    bucket: 'research-groups',
    folder,
    maxSizeMB: type === 'image' ? 5 : 10,
    allowedTypes: type === 'image' ? ['image/'] : ['application/pdf', 'application/'],
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await upload(file);
    if (url) {
      onChange(url);
      setUseUrl(true);
    }
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      <div className="space-y-2">
        {/* File upload button */}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-shrink-0"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {uploading ? 'Se încarcă...' : 'Încarcă fișier'}
          </Button>
          
          <span className="text-xs text-muted-foreground self-center">sau</span>
          
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
          
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Preview */}
        {value && (
          <div className="mt-2">
            {type === 'image' ? (
              <div className="relative inline-block">
                <img 
                  src={value} 
                  alt="Preview" 
                  className="max-h-24 rounded border border-border object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <a 
                href={value} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <FileText className="w-4 h-4" />
                Vizualizează fișierul
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
