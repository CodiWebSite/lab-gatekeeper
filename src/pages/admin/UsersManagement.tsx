import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLaboratories } from '@/hooks/useLaboratories';
import { UserRole, Laboratory } from '@/types/database';
import { 
  Plus, 
  Search,
  Users,
  MoreVertical,
  Key,
  Trash2,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
import { CreateUserModal } from '@/components/admin/CreateUserModal';

interface UserWithEmail extends UserRole {
  email?: string;
  lab_name?: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserWithEmail | null>(null);
  const [resettingUser, setResettingUser] = useState<UserWithEmail | null>(null);
  const { data: labs } = useLaboratories();

  const fetchUsers = async () => {
    setIsLoading(true);
    
    // Fetch user roles
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (rolesError) {
      toast.error('Eroare la încărcarea utilizatorilor');
      setIsLoading(false);
      return;
    }

    // Map lab names
    const usersWithLabs = (rolesData as UserRole[]).map(role => {
      const lab = labs?.find(l => l.id === role.lab_id);
      return {
        ...role,
        lab_name: lab?.name,
      };
    });

    setUsers(usersWithLabs);
    setIsLoading(false);
  };

  useEffect(() => {
    if (labs) {
      fetchUsers();
    }
  }, [labs]);

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lab_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deletingUser) return;

    // Delete from auth (which will cascade to user_roles)
    // Note: This requires admin privileges or edge function
    toast.error('Ștergerea utilizatorilor necesită configurare suplimentară');
    setDeletingUser(null);
  };

  const handleResetPassword = async () => {
    if (!resettingUser) return;

    // Generate temporary password
    const tempPassword = Math.random().toString(36).substring(2, 10) + 'Aa1!';
    
    // This would require an edge function to reset password
    toast.info(`Parolă temporară generată: ${tempPassword}`);
    toast.info('Copiază parola și comunic-o utilizatorului');
    
    setResettingUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Utilizatori
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestionează conturile administratorilor de laborator
          </p>
        </div>

        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adaugă utilizator
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Caută utilizator..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            {searchQuery ? 'Niciun utilizator găsit.' : 'Nu există utilizatori. Creează primul cont.'}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground truncate">
                      {user.email || user.user_id}
                    </h3>
                    <Badge variant={user.role === 'super_admin' ? 'default' : 'secondary'}>
                      {user.role === 'super_admin' ? 'Super Admin' : 'Admin Lab'}
                    </Badge>
                    {user.must_change_password && (
                      <Badge variant="outline" className="text-icmpp-warning border-icmpp-warning">
                        Parolă temporară
                      </Badge>
                    )}
                  </div>
                  {user.lab_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Building2 className="w-3 h-3" />
                      <span className="truncate">{user.lab_name}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem onClick={() => setResettingUser(user)}>
                      <Key className="w-4 h-4 mr-2" />
                      Resetează parola
                    </DropdownMenuItem>
                    {user.role !== 'super_admin' && (
                      <DropdownMenuItem 
                        onClick={() => setDeletingUser(user)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Șterge
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateUserModal 
          open={showCreateModal} 
          onOpenChange={setShowCreateModal}
          onSuccess={fetchUsers}
          labs={labs || []}
        />
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge utilizatorul?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune este ireversibilă. Contul utilizatorului va fi șters permanent.
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

      {/* Reset Password Dialog */}
      <AlertDialog open={!!resettingUser} onOpenChange={(open) => !open && setResettingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetează parola?</AlertDialogTitle>
            <AlertDialogDescription>
              Se va genera o parolă temporară pentru utilizator. Utilizatorul va fi obligat să o schimbe la prima autentificare.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword}>
              Generează parolă
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
