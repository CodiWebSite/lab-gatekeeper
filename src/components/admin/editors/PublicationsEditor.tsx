import { useState } from 'react';
import { 
  usePublications, 
  useCreatePublication, 
  useUpdatePublication, 
  useDeletePublication 
} from '@/hooks/useLaboratories';
import { Publication } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Save, BookOpen } from 'lucide-react';
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

interface PublicationsEditorProps {
  labId: string;
}

export function PublicationsEditor({ labId }: PublicationsEditorProps) {
  const { data: publications, isLoading } = usePublications(labId);
  const createPub = useCreatePublication();
  const updatePub = useUpdatePublication();
  const deletePub = useDeletePublication();

  const [editingPub, setEditingPub] = useState<Publication | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingPub, setDeletingPub] = useState<Publication | null>(null);

  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    journal: '',
    year: currentYear,
    volume: '',
    pages: '',
    doi: '',
    url: '',
    abstract: '',
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      authors: '',
      journal: '',
      year: currentYear,
      volume: '',
      pages: '',
      doi: '',
      url: '',
      abstract: '',
      display_order: 0,
    });
  };

  const openEdit = (pub: Publication) => {
    setFormData({
      title: pub.title,
      authors: pub.authors,
      journal: pub.journal || '',
      year: pub.year,
      volume: pub.volume || '',
      pages: pub.pages || '',
      doi: pub.doi || '',
      url: pub.url || '',
      abstract: pub.abstract || '',
      display_order: pub.display_order,
    });
    setEditingPub(pub);
  };

  const openCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      lab_id: labId,
      title: formData.title,
      authors: formData.authors,
      journal: formData.journal || null,
      year: formData.year,
      volume: formData.volume || null,
      pages: formData.pages || null,
      doi: formData.doi || null,
      url: formData.url || null,
      abstract: formData.abstract || null,
      display_order: formData.display_order,
    };

    try {
      if (editingPub) {
        await updatePub.mutateAsync({ id: editingPub.id, labId, data });
        toast.success('Publicația a fost actualizată');
        setEditingPub(null);
      } else {
        await createPub.mutateAsync(data);
        toast.success('Publicația a fost adăugată');
        setIsCreating(false);
      }
      resetForm();
    } catch (error) {
      toast.error('Eroare la salvare');
    }
  };

  const handleDelete = async () => {
    if (!deletingPub) return;

    try {
      await deletePub.mutateAsync({ id: deletingPub.id, labId });
      toast.success('Publicația a fost ștearsă');
      setDeletingPub(null);
    } catch (error) {
      toast.error('Eroare la ștergere');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-heading text-lg font-semibold">Publicații</h3>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Adaugă publicație
        </Button>
      </div>

      {publications?.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Nu există publicații.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {publications?.map((pub) => (
            <div key={pub.id} className="p-4 bg-card rounded-lg border border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground line-clamp-2">{pub.title}</h4>
                  <p className="text-sm text-muted-foreground">{pub.authors}</p>
                  <p className="text-sm text-muted-foreground">
                    {pub.journal && `${pub.journal}, `}{pub.year}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(pub)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeletingPub(pub)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isCreating || !!editingPub} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setEditingPub(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPub ? 'Editează publicația' : 'Adaugă publicație nouă'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titlu *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authors">Autori *</Label>
              <Input
                id="authors"
                value={formData.authors}
                onChange={(e) => setFormData(prev => ({ ...prev, authors: e.target.value }))}
                placeholder="Popescu A., Ionescu B., et al."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="journal">Jurnal</Label>
                <Input
                  id="journal"
                  value={formData.journal}
                  onChange={(e) => setFormData(prev => ({ ...prev, journal: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">An *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || currentYear }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="volume">Volum</Label>
                <Input
                  id="volume"
                  value={formData.volume}
                  onChange={(e) => setFormData(prev => ({ ...prev, volume: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pages">Pagini</Label>
                <Input
                  id="pages"
                  value={formData.pages}
                  onChange={(e) => setFormData(prev => ({ ...prev, pages: e.target.value }))}
                  placeholder="123-145"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doi">DOI</Label>
                <Input
                  id="doi"
                  value={formData.doi}
                  onChange={(e) => setFormData(prev => ({ ...prev, doi: e.target.value }))}
                  placeholder="10.1234/example"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="abstract">Abstract</Label>
              <Textarea
                id="abstract"
                value={formData.abstract}
                onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsCreating(false);
                setEditingPub(null);
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
      <AlertDialog open={!!deletingPub} onOpenChange={(open) => !open && setDeletingPub(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge publicația?</AlertDialogTitle>
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
