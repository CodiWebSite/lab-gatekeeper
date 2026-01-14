import { useState } from 'react';
import { 
  usePublicationYearsContent,
  useUpsertPublicationYear, 
  useDeletePublicationYear 
} from '@/hooks/useLaboratories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Save, BookOpen, Calendar } from 'lucide-react';
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
  const { data: publicationYears, isLoading } = usePublicationYearsContent(labId);
  const upsertYear = useUpsertPublicationYear();
  const deleteYear = useDeletePublicationYear();

  const [editingYear, setEditingYear] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingYear, setDeletingYear] = useState<number | null>(null);

  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    year: currentYear,
    content: '',
  });

  const resetForm = () => {
    setFormData({
      year: currentYear,
      content: '',
    });
  };

  const openEdit = (year: number, content: string) => {
    setFormData({
      year,
      content,
    });
    setEditingYear(year);
  };

  const openCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if year already exists when creating
    if (isCreating && publicationYears?.some(p => p.year === formData.year)) {
      toast.error(`Anul ${formData.year} există deja. Editați-l în loc să creați unul nou.`);
      return;
    }

    try {
      await upsertYear.mutateAsync({ 
        labId, 
        year: formData.year, 
        content: formData.content 
      });
      
      toast.success(editingYear !== null ? 'Publicațiile au fost actualizate' : 'Anul a fost adăugat');
      setEditingYear(null);
      setIsCreating(false);
      resetForm();
    } catch (error) {
      toast.error('Eroare la salvare');
    }
  };

  const handleDelete = async () => {
    if (deletingYear === null) return;

    try {
      await deleteYear.mutateAsync({ labId, year: deletingYear });
      toast.success('Anul a fost șters');
      setDeletingYear(null);
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
        <h3 className="font-heading text-lg font-semibold">Publicații pe ani</h3>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Adaugă an
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Adăugați publicațiile pentru fiecare an. Puteți scrie liber textul cu lista de publicații.
      </p>

      {publicationYears?.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Nu există publicații.</p>
          <p className="text-sm text-muted-foreground mt-2">Adăugați un an pentru a începe.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {publicationYears?.map((pubYear) => (
            <div key={pubYear.year} className="p-4 bg-card rounded-lg border border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h4 className="font-heading font-semibold text-lg text-foreground">{pubYear.year}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                    {pubYear.content.substring(0, 200)}{pubYear.content.length > 200 ? '...' : ''}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(pubYear.year, pubYear.content)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeletingYear(pubYear.year)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isCreating || editingYear !== null} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setEditingYear(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingYear !== null ? `Editează publicațiile pentru ${editingYear}` : 'Adaugă an nou'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {isCreating && (
              <div className="space-y-2">
                <Label htmlFor="year">An *</Label>
                <Input
                  id="year"
                  type="number"
                  min="1900"
                  max="2100"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || currentYear }))}
                  required
                  className="w-32"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="content">Lista publicațiilor *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={15}
                placeholder={`Introduceți publicațiile pentru anul ${formData.year}...

Exemplu:
1. Popescu A., Ionescu B., Titlul articolului; Numele Jurnalului, vol. 12, pp. 123-145 (${formData.year}).
2. Georgescu C., Alt titlu de articol; Alt Jurnal, 45(3), 567-589 (${formData.year}).`}
                required
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Puteți formata textul cum doriți. Acesta va fi afișat exact așa cum îl introduceți.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsCreating(false);
                setEditingYear(null);
                resetForm();
              }}>
                Anulează
              </Button>
              <Button type="submit" disabled={upsertYear.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {upsertYear.isPending ? 'Salvare...' : 'Salvează'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deletingYear !== null} onOpenChange={(open) => !open && setDeletingYear(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge anul {deletingYear}?</AlertDialogTitle>
            <AlertDialogDescription>
              Toate publicațiile pentru acest an vor fi șterse. Această acțiune este ireversibilă.
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
