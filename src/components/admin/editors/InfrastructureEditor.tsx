import { useState } from 'react';
import { 
  useInfrastructure, 
  useCreateInfrastructure, 
  useUpdateInfrastructure, 
  useDeleteInfrastructure 
} from '@/hooks/useLaboratories';
import { Infrastructure } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Save, Wrench, Upload, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface InfrastructureEditorProps {
  labId: string;
}

export function InfrastructureEditor({ labId }: InfrastructureEditorProps) {
  const { data: infrastructure, isLoading } = useInfrastructure(labId);
  const createItem = useCreateInfrastructure();
  const updateItem = useUpdateInfrastructure();
  const deleteItem = useDeleteInfrastructure();

  const [editingItem, setEditingItem] = useState<Infrastructure | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Infrastructure | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    specifications: '',
    responsible_name: '',
    responsible_email: '',
    external_link: '',
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image_url: '',
      specifications: '',
      responsible_name: '',
      responsible_email: '',
      external_link: '',
      display_order: 0,
    });
  };

  const openEdit = (item: Infrastructure) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      image_url: item.image_url || '',
      specifications: item.specifications || '',
      responsible_name: item.responsible_name || '',
      responsible_email: item.responsible_email || '',
      external_link: item.external_link || '',
      display_order: item.display_order,
    });
    setEditingItem(item);
  };

  const openCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleImageUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `infrastructure/${labId}/${fileName}`;

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

    setFormData(prev => ({ ...prev, image_url: publicUrl }));
    toast.success('Imaginea a fost încărcată');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      lab_id: labId,
      name: formData.name,
      description: formData.description || null,
      image_url: formData.image_url || null,
      specifications: formData.specifications || null,
      responsible_name: formData.responsible_name || null,
      responsible_email: formData.responsible_email || null,
      external_link: formData.external_link || null,
      display_order: formData.display_order,
    };

    try {
      if (editingItem) {
        await updateItem.mutateAsync({ id: editingItem.id, labId, data });
        toast.success('Echipamentul a fost actualizat');
        setEditingItem(null);
      } else {
        await createItem.mutateAsync(data);
        toast.success('Echipamentul a fost adăugat');
        setIsCreating(false);
      }
      resetForm();
    } catch (error) {
      toast.error('Eroare la salvare');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      await deleteItem.mutateAsync({ id: deletingItem.id, labId });
      toast.success('Echipamentul a fost șters');
      setDeletingItem(null);
    } catch (error) {
      toast.error('Eroare la ștergere');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-heading text-lg font-semibold">Infrastructură</h3>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Adaugă echipament
        </Button>
      </div>

      {infrastructure?.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Wrench className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Nu există echipamente.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {infrastructure?.map((item) => (
            <div key={item.id} className="p-4 bg-card rounded-lg border border-border flex gap-4">
              {/* Thumbnail */}
              <div className="w-24 h-24 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Wrench className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground">{item.name}</h4>
                {item.responsible_name && (
                  <p className="text-sm text-muted-foreground">Responsabil: {item.responsible_name}</p>
                )}
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeletingItem(item)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isCreating || !!editingItem} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setEditingItem(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editează echipamentul' : 'Adaugă echipament nou'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nume echipament *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            {/* Image upload */}
            <div className="space-y-2">
              <Label>Imagine</Label>
              {formData.image_url ? (
                <div className="relative inline-block">
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="w-40 h-32 object-cover rounded-lg border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 w-6 h-6"
                    onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <label className="w-40 h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Încarcă imagine</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descriere</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specifications">Specificații tehnice</Label>
              <Textarea
                id="specifications"
                value={formData.specifications}
                onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responsible_name">Responsabil</Label>
                <Input
                  id="responsible_name"
                  value={formData.responsible_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsible_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsible_email">Email responsabil</Label>
                <Input
                  id="responsible_email"
                  type="email"
                  value={formData.responsible_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsible_email: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="external_link">Link extern</Label>
              <Input
                id="external_link"
                value={formData.external_link}
                onChange={(e) => setFormData(prev => ({ ...prev, external_link: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsCreating(false);
                setEditingItem(null);
                resetForm();
              }}>
                Anulează
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Salvează
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge echipamentul?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune este ireversibilă.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
