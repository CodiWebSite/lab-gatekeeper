import { useState, useRef } from 'react';
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
import { Plus, Pencil, Trash2, Save, Image, FileText, Bold, Italic, Underline, Link, List, ImagePlus, Upload } from 'lucide-react';
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
import { useFileUpload } from '@/hooks/useFileUpload';

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

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { upload, uploading: imageUploading } = useFileUpload({
    bucket: 'research-groups',
    folder: 'results-inline',
    maxSizeMB: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
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

  const insertImageAtCursor = async (file: File) => {
    const url = await upload(file);
    if (!url) return;

    const textarea = textareaRef.current;
    if (!textarea) {
      // If no textarea ref, just append to content
      const imageTag = `\n<div class="my-4"><img src="${url}" alt="Imagine" class="max-w-full rounded-lg" /></div>\n`;
      setFormData(prev => ({ ...prev, content: prev.content + imageTag }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const imageTag = `\n<div class="my-4"><img src="${url}" alt="Imagine" class="max-w-full rounded-lg" /></div>\n`;
    
    const newContent = formData.content.substring(0, start) + imageTag + formData.content.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Set cursor position after the inserted image
    setTimeout(() => {
      if (textarea) {
        const newPosition = start + imageTag.length;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
      }
    }, 0);
  };

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    await insertImageAtCursor(file);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const applyFormatting = (format: 'bold' | 'italic' | 'underline' | 'link' | 'list') => {
    const textarea = textareaRef.current;
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
      case 'list':
        const lines = selectedText.split('\n').filter(l => l.trim());
        if (lines.length > 0) {
          newText = '<ul>\n' + lines.map(l => `  <li>${l.trim()}</li>`).join('\n') + '\n</ul>';
        } else {
          newText = '<ul>\n  <li>Element 1</li>\n  <li>Element 2</li>\n</ul>';
        }
        break;
    }

    const newContent = formData.content.substring(0, start) + newText + formData.content.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));

    // Set cursor position after the inserted text
    setTimeout(() => {
      if (textarea) {
        const newPosition = start + newText.length;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
      }
    }, 0);
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
              <Label htmlFor="content">Conținut (text și imagini)</Label>
              <p className="text-xs text-muted-foreground">
                Puteți intercala text și imagini. Folosiți butonul "Inserează imagine" pentru a adăuga imagini în conținut.
              </p>
              
              {/* Toolbar */}
              <div className="flex flex-wrap gap-1 p-2 bg-muted/30 rounded-t-lg border border-b-0">
                <Button type="button" variant="outline" size="sm" onClick={() => applyFormatting('bold')} title="Bold">
                  <Bold className="w-4 h-4" />
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => applyFormatting('italic')} title="Italic">
                  <Italic className="w-4 h-4" />
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => applyFormatting('underline')} title="Subliniat">
                  <Underline className="w-4 h-4" />
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => applyFormatting('link')} title="Link">
                  <Link className="w-4 h-4" />
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => applyFormatting('list')} title="Listă">
                  <List className="w-4 h-4" />
                </Button>
                
                <div className="w-px h-6 bg-border mx-1 self-center" />
                
                {/* Inline Image Upload Button */}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageUploading}
                  className="bg-primary/10 hover:bg-primary/20"
                  title="Inserează imagine în text"
                >
                  <ImagePlus className="w-4 h-4 mr-1" />
                  {imageUploading ? 'Se încarcă...' : 'Inserează imagine'}
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleInlineImageUpload}
                  className="hidden"
                />
              </div>
              
              <Textarea
                ref={textareaRef}
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={12}
                placeholder="Scrieți textul aici... Folosiți butonul 'Inserează imagine' pentru a adăuga imagini oriunde în conținut."
                className="rounded-t-none font-mono text-sm"
              />
              
              {/* Content Preview */}
              {formData.content && (
                <div className="mt-4 space-y-2">
                  <Label className="text-xs text-muted-foreground">Previzualizare:</Label>
                  <div 
                    className="p-4 border rounded-lg bg-background prose prose-sm max-w-none
                      prose-headings:font-bold prose-headings:text-foreground
                      prose-p:text-foreground prose-p:leading-relaxed
                      prose-ul:list-disc prose-ul:pl-6
                      prose-li:text-foreground
                      prose-strong:font-bold
                      prose-img:rounded-lg prose-img:my-4
                      prose-a:text-primary prose-a:hover:underline"
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                  />
                </div>
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
              <Button type="submit" disabled={imageUploading}>
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
