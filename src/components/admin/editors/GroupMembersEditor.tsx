import { useState } from 'react';
import {
  useGroupMembers,
  useCreateGroupMember,
  useUpdateGroupMember,
  useDeleteGroupMember,
} from '@/hooks/useResearchGroups';
import { GroupMember } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Save, User } from 'lucide-react';
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
import { FileUploadField } from './FileUploadField';

interface GroupMembersEditorProps {
  groupId: string;
}

export function GroupMembersEditor({ groupId }: GroupMembersEditorProps) {
  const { data: members, isLoading } = useGroupMembers(groupId);
  const createMember = useCreateGroupMember();
  const updateMember = useUpdateGroupMember();
  const deleteMember = useDeleteGroupMember();

  const [editingMember, setEditingMember] = useState<GroupMember | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingMember, setDeletingMember] = useState<GroupMember | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    description: '',
    photo_url: '',
    cv_url: '',
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      email: '',
      description: '',
      photo_url: '',
      cv_url: '',
      display_order: 0,
    });
  };

  const openEdit = (member: GroupMember) => {
    setFormData({
      name: member.name,
      position: member.position || '',
      email: member.email || '',
      description: member.description || '',
      photo_url: member.photo_url || '',
      cv_url: member.cv_url || '',
      display_order: member.display_order,
    });
    setEditingMember(member);
  };

  const openCreate = () => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      display_order: members?.length || 0,
    }));
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      group_id: groupId,
      name: formData.name,
      position: formData.position || null,
      email: formData.email || null,
      description: formData.description || null,
      photo_url: formData.photo_url || null,
      cv_url: formData.cv_url || null,
      display_order: formData.display_order,
    };

    try {
      if (editingMember) {
        await updateMember.mutateAsync({ id: editingMember.id, groupId, data });
        toast.success('Membrul a fost actualizat');
        setEditingMember(null);
      } else {
        await createMember.mutateAsync(data);
        toast.success('Membrul a fost adăugat');
        setIsCreating(false);
      }
      resetForm();
    } catch (error) {
      toast.error('Eroare la salvare');
    }
  };

  const handleDelete = async () => {
    if (!deletingMember) return;

    try {
      await deleteMember.mutateAsync({ id: deletingMember.id, groupId });
      toast.success('Membrul a fost șters');
      setDeletingMember(null);
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-foreground">Echipă</h4>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Adaugă membru
        </Button>
      </div>

      {members?.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <User className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">Nu există membri.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {members?.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              {member.photo_url ? (
                <img src={member.photo_url} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{member.name}</p>
                {member.position && (
                  <p className="text-xs text-muted-foreground truncate">{member.position}</p>
                )}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(member)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeletingMember(member)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isCreating || !!editingMember} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setEditingMember(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? 'Editează membru' : 'Adaugă membru nou'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nume *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Poziție / Funcție</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="ex: Cercetător științific III"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descriere / Domenii de cercetare</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <FileUploadField
              label="Poză profil"
              value={formData.photo_url}
              onChange={(url) => setFormData(prev => ({ ...prev, photo_url: url }))}
              accept="image/*"
              folder="members"
              type="image"
            />

            <FileUploadField
              label="CV (PDF)"
              value={formData.cv_url}
              onChange={(url) => setFormData(prev => ({ ...prev, cv_url: url }))}
              accept=".pdf,application/pdf"
              folder="cvs"
              type="document"
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsCreating(false);
                setEditingMember(null);
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
      <AlertDialog open={!!deletingMember} onOpenChange={(open) => !open && setDeletingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge membrul?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune este ireversibilă. Membrul "{deletingMember?.name}" va fi șters permanent.
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
