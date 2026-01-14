import { useState } from 'react';
import {
  useGroupResults,
  useCreateGroupResult,
  useUpdateGroupResult,
  useDeleteGroupResult,
} from '@/hooks/useResearchGroups';
import { GroupResult } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Save, Image, FileText, Bold, Italic, Underline, Link } from 'lucide-react';
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

interface GroupResultsEditorProps {
  groupId: string;
}

export function GroupResultsEditor({ groupId }: GroupResultsEditorProps) {
  const { data: results, isLoading } = useGroupResults(groupId);
  const createResult = useCreateGroupResult();
  const updateResult = useUpdateGroupResult();
  const deleteResult = useDeleteGroupResult();

  const [editingResult, setEditingResult] = useState<GroupResult | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingResult, setDeletingResult] = useState<GroupResult | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      image_url: '',
      display_order: 0,
    });
  };

  const openEdit = (result: GroupResult) => {
    setFormData({
      title: result.title || '',
      content: result.content || '',
      image_url: result.image_url || '',
      display_order: result.display_order,
    });
    setEditingResult(result);
  };

  const openCreate = () => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      display_order: results?.length || 0,
    }));
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      group_id: groupId,
      title: formData.title || null,
      content: formData.content || null,
      image_url: formData.image_url || null,
      display_order: formData.display_order,
    };

    try {
      if (editingResult) {
        await updateResult.mutateAsync({ id: editingResult.id, groupId, data });
        toast.success('Rezultatul a fost actualizat');
        setEditingResult(null);
      } else {
        await createResult.mutateAsync(data);
        toast.success('Rezultatul a fost adăugat');
        setIsCreating(false);
      }
      resetForm();
    } catch (error) {
      toast.error('Eroare la salvare');
    }
  };

  const handleDelete = async () => {
    if (!deletingResult) return;

    try {
      await deleteResult.mutateAsync({ id: deletingResult.id, groupId });
      toast.success('Rezultatul a fost șters');
      setDeletingResult(null);
    } catch (error) {
      toast.error('Eroare la ștergere');
    }
  };

  const applyFormatting = (format: 'bold' | 'italic' | 'underline' | 'link') => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);

    let newText = '';
    switch (format) {
      case 'bold':
        newText = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        newText = `<em>${selectedText}</em>`;
        break;
      case 'underline':
        newText = `<u>${selectedText}</u>`;
        break;
      case 'link':
        const url = prompt('Introduceți URL-ul:', 'https://');
        if (url) {
          newText = `<a href="${url}" target="_blank">${selectedText || url}</a>`;
        } else {
          return;
        }
        break;
    }

    const newContent = formData.content.substring(0, start) + newText + formData.content.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-foreground">Rezultate Principale</h4>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Adaugă rezultat
        </Button>
      </div>

      {results?.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <FileText className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">Nu există rezultate.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {results?.map((result) => (
            <div key={result.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              {result.image_url ? (
                <img src={result.image_url} alt={result.title || ''} className="w-16 h-16 rounded object-cover" />
              ) : (
                <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                  <Image className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{result.title || '(Fără titlu)'}</p>
                {result.content && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {result.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(result)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeletingResult(result)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isCreating || !!editingResult} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setEditingResult(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingResult ? 'Editează rezultat' : 'Adaugă rezultat nou'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titlu</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conținut</Label>
              <div className="flex gap-1 mb-2">
                <Button type="button" variant="outline" size="sm" onClick={() => applyFormatting('bold')}>
                  <Bold className="w-4 h-4" />
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => applyFormatting('italic')}>
                  <Italic className="w-4 h-4" />
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => applyFormatting('underline')}>
                  <Underline className="w-4 h-4" />
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => applyFormatting('link')}>
                  <Link className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
                placeholder="Descrieți rezultatul cercetării..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL Imagine</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://..."
              />
              {formData.image_url && (
                <img 
                  src={formData.image_url} 
                  alt="Preview" 
                  className="mt-2 max-h-48 rounded border border-border"
                />
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsCreating(false);
                setEditingResult(null);
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
      <AlertDialog open={!!deletingResult} onOpenChange={(open) => !open && setDeletingResult(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge rezultatul?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune este ireversibilă. Rezultatul va fi șters permanent.
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
