import { useState } from 'react';
import { 
  useResearchGroups, 
  useCreateResearchGroup, 
  useUpdateResearchGroup, 
  useDeleteResearchGroup 
} from '@/hooks/useLaboratories';
import { ResearchGroup } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Save, Users, ChevronDown, ChevronUp, Bold, Italic, Underline, Link } from 'lucide-react';
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
import { GroupMembersEditor } from './GroupMembersEditor';
import { GroupResultsEditor } from './GroupResultsEditor';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ResearchGroupsEditorProps {
  labId: string;
}

export function ResearchGroupsEditor({ labId }: ResearchGroupsEditorProps) {
  const { data: groups, isLoading } = useResearchGroups(labId);
  const createGroup = useCreateResearchGroup();
  const updateGroup = useUpdateResearchGroup();
  const deleteGroup = useDeleteResearchGroup();

  const [editingGroup, setEditingGroup] = useState<ResearchGroup | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<ResearchGroup | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topics: '',
    leader_name: '',
    leader_email: '',
    members: '',
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      topics: '',
      leader_name: '',
      leader_email: '',
      members: '',
      display_order: 0,
    });
  };

  const openEdit = (group: ResearchGroup) => {
    setFormData({
      name: group.name,
      description: group.description || '',
      topics: group.topics || '',
      leader_name: group.leader_name || '',
      leader_email: group.leader_email || '',
      members: group.members?.join(', ') || '',
      display_order: group.display_order,
    });
    setEditingGroup(group);
  };

  const openCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const applyFormatting = (format: 'bold' | 'italic' | 'underline' | 'link') => {
    const textarea = document.getElementById('topics') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.topics.substring(start, end);

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

    const newContent = formData.topics.substring(0, start) + newText + formData.topics.substring(end);
    setFormData(prev => ({ ...prev, topics: newContent }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      lab_id: labId,
      name: formData.name,
      description: formData.description || null,
      topics: formData.topics || null,
      leader_name: formData.leader_name || null,
      leader_email: formData.leader_email || null,
      members: formData.members ? formData.members.split(',').map(m => m.trim()) : null,
      display_order: formData.display_order,
    };

    try {
      if (editingGroup) {
        await updateGroup.mutateAsync({ id: editingGroup.id, labId, data });
        toast.success('Grupul a fost actualizat');
        setEditingGroup(null);
      } else {
        await createGroup.mutateAsync(data);
        toast.success('Grupul a fost creat');
        setIsCreating(false);
      }
      resetForm();
    } catch (error) {
      toast.error('Eroare la salvare');
    }
  };

  const handleDelete = async () => {
    if (!deletingGroup) return;

    try {
      await deleteGroup.mutateAsync({ id: deletingGroup.id, labId });
      toast.success('Grupul a fost șters');
      setDeletingGroup(null);
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
        <h3 className="font-heading text-lg font-semibold">Grupuri de cercetare</h3>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Adaugă grup
        </Button>
      </div>

      {groups?.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Nu există grupuri de cercetare.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups?.map((group) => (
            <Collapsible 
              key={group.id} 
              open={expandedGroup === group.id}
              onOpenChange={(open) => setExpandedGroup(open ? group.id : null)}
            >
              <div className="p-4 bg-card rounded-lg border border-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{group.name}</h4>
                    {group.leader_name && (
                      <p className="text-sm text-muted-foreground">Lider: {group.leader_name}</p>
                    )}
                    {group.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{group.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon">
                        {expandedGroup === group.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(group)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletingGroup(group)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                
                <CollapsibleContent className="mt-4 pt-4 border-t border-border space-y-6">
                  <GroupMembersEditor groupId={group.id} />
                  <GroupResultsEditor groupId={group.id} />
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isCreating || !!editingGroup} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setEditingGroup(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? 'Editează grupul' : 'Adaugă grup nou'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nume grup *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leader_name">Nume coordonator</Label>
                <Input
                  id="leader_name"
                  value={formData.leader_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, leader_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leader_email">Email coordonator</Label>
                <Input
                  id="leader_email"
                  type="email"
                  value={formData.leader_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, leader_email: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descriere scurtă</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topics">Tematici (conținut formatat)</Label>
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
                id="topics"
                value={formData.topics}
                onChange={(e) => setFormData(prev => ({ ...prev, topics: e.target.value }))}
                rows={5}
                placeholder="Descrieți tematicile de cercetare ale grupului..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="members">Membri (separați prin virgulă) - opțional</Label>
              <Textarea
                id="members"
                value={formData.members}
                onChange={(e) => setFormData(prev => ({ ...prev, members: e.target.value }))}
                placeholder="Nume1, Nume2, Nume3..."
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Notă: Pentru echipă detaliată cu poze și CV-uri, folosiți secțiunea "Echipă" după salvare.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsCreating(false);
                setEditingGroup(null);
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
      <AlertDialog open={!!deletingGroup} onOpenChange={(open) => !open && setDeletingGroup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge grupul?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune este ireversibilă. Grupul "{deletingGroup?.name}" și toți membrii/rezultatele vor fi șterse permanent.
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
