import { useState, useRef, useCallback } from 'react';
import { 
  useProjects, 
  useCreateProject, 
  useUpdateProject, 
  useDeleteProject 
} from '@/hooks/useLaboratories';
import { Project } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Save, FolderOpen, Bold, Italic, Underline, Link } from 'lucide-react';
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

interface ProjectsEditorProps {
  labId: string;
}

// Simple rich text editor component
function RichTextEditor({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertLink = useCallback(() => {
    const url = prompt('Introdu URL-ul:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="flex gap-1 p-2 bg-muted border-b border-border">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          onClick={() => execCommand('bold')}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          onClick={() => execCommand('italic')}
          className="h-8 w-8 p-0"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          onClick={() => execCommand('underline')}
          className="h-8 w-8 p-0"
          title="Subliniat"
        >
          <Underline className="w-4 h-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          onClick={insertLink}
          className="h-8 w-8 p-0"
          title="Link"
        >
          <Link className="w-4 h-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-3 bg-background focus:outline-none prose prose-sm max-w-none"
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}

export function ProjectsEditor({ labId }: ProjectsEditorProps) {
  const { data: projects, isLoading } = useProjects(labId);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
    });
  };

  const openEdit = (project: Project) => {
    setFormData({
      title: project.title,
      description: project.description || '',
    });
    setEditingProject(project);
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
      description: formData.description || null,
      funding_source: null,
      budget: null,
      start_date: null,
      end_date: null,
      status: 'active',
      project_code: null,
      director_name: null,
      url: null,
      display_order: 0,
    };

    try {
      if (editingProject) {
        await updateProject.mutateAsync({ id: editingProject.id, labId, data });
        toast.success('Proiectul a fost actualizat');
        setEditingProject(null);
      } else {
        await createProject.mutateAsync(data);
        toast.success('Proiectul a fost adăugat');
        setIsCreating(false);
      }
      resetForm();
    } catch (error) {
      toast.error('Eroare la salvare');
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;

    try {
      await deleteProject.mutateAsync({ id: deletingProject.id, labId });
      toast.success('Proiectul a fost șters');
      setDeletingProject(null);
    } catch (error) {
      toast.error('Eroare la ștergere');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-heading text-lg font-semibold">Proiecte</h3>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Adaugă proiect
        </Button>
      </div>

      {projects?.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Nu există proiecte.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects?.map((project) => (
            <div key={project.id} className="p-4 bg-card rounded-lg border border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{project.title}</h4>
                  {project.description && (
                    <div 
                      className="text-sm text-muted-foreground mt-1 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: project.description }}
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(project)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeletingProject(project)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isCreating || !!editingProject} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setEditingProject(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'Editează proiectul' : 'Adaugă proiect nou'}
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
              <Label>Conținut</Label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              />
              <p className="text-xs text-muted-foreground">
                Poți folosi butoanele pentru Bold, Italic, Subliniat și Link.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsCreating(false);
                setEditingProject(null);
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
      <AlertDialog open={!!deletingProject} onOpenChange={(open) => !open && setDeletingProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge proiectul?</AlertDialogTitle>
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
