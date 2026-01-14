import { useState } from 'react';
import { useLaboratories, useUpdateLaboratory } from '@/hooks/useLaboratories';
import { Laboratory } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search,
  Building2,
  User,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { LabEditModal } from '@/components/admin/LabEditModal';

export default function LabsManagement() {
  const { data: labs, isLoading } = useLaboratories();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLab, setEditingLab] = useState<Laboratory | null>(null);
  const [deletingLab, setDeletingLab] = useState<Laboratory | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const filteredLabs = labs?.filter(
    (lab) =>
      lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.head_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDelete = async () => {
    if (!deletingLab) return;

    const { error } = await supabase
      .from('laboratories')
      .delete()
      .eq('id', deletingLab.id);

    if (error) {
      toast.error('Eroare la ștergerea laboratorului');
      return;
    }

    toast.success('Laboratorul a fost șters');
    queryClient.invalidateQueries({ queryKey: ['laboratories'] });
    setDeletingLab(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Laboratoare
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestionează toate laboratoarele institutului
          </p>
        </div>

        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adaugă laborator
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Caută laborator..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Labs list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filteredLabs.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            {searchQuery ? 'Niciun laborator găsit.' : 'Nu există laboratoare. Creează primul laborator.'}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {filteredLabs.map((lab) => (
              <div key={lab.id} className="p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors">
                {/* Logo */}
                <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                  {lab.logo_url ? (
                    <img src={lab.logo_url} alt={lab.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{lab.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span className="truncate">{lab.head_name}</span>
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem onClick={() => setEditingLab(lab)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Editează
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href={`/labs?lab=${lab.id}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Vezi pagina
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setDeletingLab(lab)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Șterge
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingLab && (
        <LabEditModal 
          lab={editingLab} 
          open={!!editingLab} 
          onOpenChange={(open) => !open && setEditingLab(null)} 
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <LabEditModal 
          lab={null} 
          open={showCreateModal} 
          onOpenChange={setShowCreateModal} 
        />
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingLab} onOpenChange={(open) => !open && setDeletingLab(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge laboratorul?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune este ireversibilă. Toate datele asociate laboratorului 
              "{deletingLab?.name}" vor fi șterse permanent.
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
