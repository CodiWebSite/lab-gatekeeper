import { useState } from 'react';
import { Laboratory, AppRole } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Copy, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  labs: Laboratory[];
}

export function CreateUserModal({ open, onOpenChange, onSuccess, labs }: CreateUserModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AppRole>('lab_admin');
  const [labId, setLabId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure at least one of each required type
    password = password.substring(0, 8) + 'Aa1!';
    return password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email domain
    if (!email.endsWith('@icmpp.ro')) {
      setError('Email-ul trebuie să fie de forma @icmpp.ro');
      return;
    }

    // Validate lab selection for lab_admin
    if (role === 'lab_admin' && !labId) {
      setError('Selectează laboratorul pentru admin');
      return;
    }

    setIsLoading(true);
    const tempPassword = generatePassword();

    // Create user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        emailRedirectTo: window.location.origin + '/admin/login',
      }
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    if (!authData.user) {
      setError('Eroare la crearea utilizatorului');
      setIsLoading(false);
      return;
    }

    // Create user role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role,
        lab_id: role === 'lab_admin' ? labId : null,
        must_change_password: true,
      });

    if (roleError) {
      setError('Utilizatorul a fost creat dar nu s-a putut atribui rolul');
      setIsLoading(false);
      return;
    }

    setGeneratedPassword(tempPassword);
    toast.success('Utilizatorul a fost creat cu succes!');
    onSuccess();
    setIsLoading(false);
  };

  const copyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      toast.success('Parola a fost copiată în clipboard');
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('lab_admin');
    setLabId('');
    setError(null);
    setGeneratedPassword(null);
    onOpenChange(false);
  };

  if (generatedPassword) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-icmpp-success">
              <CheckCircle2 className="w-5 h-5" />
              Utilizator creat cu succes!
            </DialogTitle>
            <DialogDescription>
              Parola temporară a fost generată. Comunică aceste date utilizatorului.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="p-4 bg-secondary rounded-lg space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="font-medium">{email}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Parolă temporară</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-background rounded border text-sm font-mono">
                    {generatedPassword}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyPassword}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              ⚠️ Utilizatorul va fi obligat să schimbe parola la prima autentificare.
            </p>

            <Button onClick={handleClose} className="w-full">
              Închide
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Adaugă utilizator nou
          </DialogTitle>
          <DialogDescription>
            Creează un cont pentru un administrator de laborator.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nume.prenume@icmpp.ro"
              required
            />
            <p className="text-xs text-muted-foreground">
              Doar adrese @icmpp.ro sunt acceptate
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol *</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="lab_admin">Admin Laborator</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === 'lab_admin' && (
            <div className="space-y-2">
              <Label htmlFor="lab">Laborator *</Label>
              <Select value={labId} onValueChange={setLabId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează laboratorul" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {labs.map((lab) => (
                    <SelectItem key={lab.id} value={lab.id}>
                      {lab.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Anulează
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creare...
                </span>
              ) : (
                'Creează utilizator'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
