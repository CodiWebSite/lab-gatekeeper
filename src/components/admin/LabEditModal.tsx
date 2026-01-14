import { useState } from 'react';
import { Laboratory } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface LabEditModalProps {
  lab: Laboratory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LabEditModal({ lab, open, onOpenChange }: LabEditModalProps) {
  const isNew = !lab;
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: lab?.name || '',
    short_name: lab?.short_name || '',
    head_name: lab?.head_name || '',
    head_email: lab?.head_email || '',
    description: lab?.description || '',
    contact_email: lab?.contact_email || '',
    contact_phone: lab?.contact_phone || '',
    address: lab?.address || '',
    logo_url: lab?.logo_url || '',
    banner_url: lab?.banner_url || '',
    display_order: lab?.display_order || 0,
    is_active: lab?.is_active ?? true,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File, field: 'logo_url' | 'banner_url') => {
    const setUploading = field === 'logo_url' ? setUploadingLogo : setUploadingLogo;
    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `labs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('lab-uploads')
      .upload(filePath, file);

    if (uploadError) {
      toast.error('Eroare la încărcarea imaginii');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('lab-uploads')
      .getPublicUrl(filePath);

    handleChange(field, publicUrl);
    setUploading(false);
    toast.success('Imaginea a fost încărcată');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.name || !formData.head_name) {
      toast.error('Numele laboratorului și șeful sunt obligatorii');
      setIsLoading(false);
      return;
    }

    if (isNew) {
      const { error } = await supabase
        .from('laboratories')
        .insert(formData);

      if (error) {
        toast.error('Eroare la crearea laboratorului');
        setIsLoading(false);
        return;
      }

      toast.success('Laboratorul a fost creat');
    } else {
      const { error } = await supabase
        .from('laboratories')
        .update(formData)
        .eq('id', lab.id);

      if (error) {
        toast.error('Eroare la actualizarea laboratorului');
        setIsLoading(false);
        return;
      }

      toast.success('Laboratorul a fost actualizat');
    }

    queryClient.invalidateQueries({ queryKey: ['laboratories'] });
    queryClient.invalidateQueries({ queryKey: ['laboratory', lab?.id] });
    onOpenChange(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isNew ? 'Adaugă laborator nou' : 'Editează laboratorul'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">Informații generale</TabsTrigger>
              <TabsTrigger value="media">Imagini</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nume laborator *</Label>
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
                  <Label htmlFor="head_name">Șef laborator *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="address">Adresă</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descriere</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Ordine afișare</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 0)}
                />
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-6 mt-4">
              {/* Logo upload */}
              <div className="space-y-2">
                <Label>Logo laborator</Label>
                <div className="flex items-start gap-4">
                  {formData.logo_url ? (
                    <div className="relative">
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
                        disabled={uploadingLogo}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Banner upload */}
              <div className="space-y-2">
                <Label>Banner</Label>
                <div className="space-y-2">
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
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anulează
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvare...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {isNew ? 'Creează' : 'Salvează'}
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
