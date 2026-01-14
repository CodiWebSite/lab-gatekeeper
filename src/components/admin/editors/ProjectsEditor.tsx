import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Save, FolderOpen } from 'lucide-react';
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
    funding_source: '',
    budget: '',
    start_date: '',
    end_date: '',
    status: 'active',
    project_code: '',
    director_name: '',
    url: '',
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      funding_source: '',
      budget: '',
      start_date: '',
      end_date: '',
      status: 'active',
      project_code: '',
      director_name: '',
      url: '',
      display_order: 0,
    });
  };

  const openEdit = (project: Project) => {
    setFormData({
      title: project.title,
      description: project.description || '',
      funding_source: project.funding_source || '',
      budget: project.budget || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      status: project.status,
      project_code: project.project_code || '',
      director_name: project.director_name || '',
      url: project.url || '',
      display_order: project.display_order,
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
      funding_source: formData.funding_source || null,
      budget: formData.budget || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      status: formData.status,
      project_code: formData.project_code || null,
      director_name: formData.director_name || null,
      url: formData.url || null,
      display_order: formData.display_order,
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
                  {project.project_code && (
                    <p className="text-sm text-primary">Cod: {project.project_code}</p>
                  )}
                  {project.director_name && (
                    <p className="text-sm text-muted-foreground">Director: {project.director_name}</p>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_code">Cod proiect</Label>
                <Input
                  id="project_code"
                  value={formData.project_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_code: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="active">Activ</SelectItem>
                    <SelectItem value="completed">Finalizat</SelectItem>
                    <SelectItem value="pending">În așteptare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="director_name">Director proiect</Label>
                <Input
                  id="director_name"
                  value={formData.director_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, director_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="funding_source">Sursă finanțare</Label>
                <Input
                  id="funding_source"
                  value={formData.funding_source}
                  onChange={(e) => setFormData(prev => ({ ...prev, funding_source: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Data start</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Data finalizare</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL detalii</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://..."
              />
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
