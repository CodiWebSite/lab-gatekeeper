import { useState } from 'react';
import { Laboratory } from '@/types/database';
import { useUpdateLaboratory } from '@/hooks/useLaboratories';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface LabInfoEditorProps {
  lab: Laboratory;
}

export function LabInfoEditor({ lab }: LabInfoEditorProps) {
  const { isSuperAdmin } = useAuth();
  const updateLab = useUpdateLaboratory();
  
  const [formData, setFormData] = useState({
    name: lab.name,
    short_name: lab.short_name || '',
    head_name: lab.head_name,
    head_email: lab.head_email || '',
    description: lab.description || '',
    contact_email: lab.contact_email || '',
    contact_phone: lab.contact_phone || '',
    address: lab.address || '',
    explore_url: lab.explore_url || '',
    logo_url: lab.logo_url || '',
    banner_url: lab.banner_url || '',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File, field: 'logo_url' | 'banner_url') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `labs/${lab.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('lab-uploads')
      .upload(filePath, file);

    if (uploadError) {
      toast.error('Eroare la încărcarea imaginii');
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('lab-uploads')
      .getPublicUrl(filePath);

    handleChange(field, publicUrl);
    toast.success('Imaginea a fost încărcată');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateLab.mutateAsync({ id: lab.id, data: formData });
      toast.success('Informațiile au fost salvate');
    } catch (error) {
      toast.error('Eroare la salvarea informațiilor');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="form-section">
        <h3 className="font-heading text-lg font-semibold mb-4">Informații generale</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nume laborator</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_name">Nume scurt</Label>
            <Input
              id="short_name"
              value={formData.short_name}
              onChange={(e) => handleChange('short_name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="head_name">Șef laborator</Label>
            <Input
              id="head_name"
              value={formData.head_name}
              onChange={(e) => handleChange('head_name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="head_email">Email șef laborator</Label>
            <Input
              id="head_email"
              type="email"
              value={formData.head_email}
              onChange={(e) => handleChange('head_email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Email contact</Label>
            <Input
              id="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => handleChange('contact_email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Telefon contact</Label>
            <Input
              id="contact_phone"
              value={formData.contact_phone}
              onChange={(e) => handleChange('contact_phone', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label htmlFor="address">Adresă</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>

        {isSuperAdmin && (
          <div className="space-y-2 mt-4">
            <Label htmlFor="explore_url">Link personalizat "Explorează"</Label>
            <Input
              id="explore_url"
              type="url"
              value={formData.explore_url}
              onChange={(e) => handleChange('explore_url', e.target.value)}
              placeholder="https://... (lasă gol pentru pagina internă)"
            />
            <p className="text-xs text-muted-foreground">
              Dacă este completat, butonul "Explorează" va redirecționa către acest link extern.
            </p>
          </div>
        )}

        <div className="space-y-2 mt-4">
          <Label htmlFor="description">Descriere</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={6}
            placeholder="Descrierea laboratorului..."
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="font-heading text-lg font-semibold mb-4">Imagini</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo laborator</Label>
            {formData.logo_url ? (
              <div className="relative inline-block">
                <img 
                  src={formData.logo_url} 
                  alt="Logo" 
                  className="w-32 h-32 object-cover rounded-lg border border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6"
                  onClick={() => handleChange('logo_url', '')}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <label className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">Încarcă logo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'logo_url');
                  }}
                />
              </label>
            )}
          </div>

          {/* Banner */}
          <div className="space-y-2">
            <Label>Banner</Label>
            {formData.banner_url ? (
              <div className="relative">
                <img 
                  src={formData.banner_url} 
                  alt="Banner" 
                  className="w-full h-32 object-cover rounded-lg border border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 w-6 h-6"
                  onClick={() => handleChange('banner_url', '')}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <label className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Încarcă banner</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'banner_url');
                  }}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvare...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Salvează modificările
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
