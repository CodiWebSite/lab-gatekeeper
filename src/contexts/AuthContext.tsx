import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, UserRole } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isLabAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch user role
          setTimeout(async () => {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            
            setUserRole(roleData as UserRole | null);
            setIsLoading(false);
          }, 0);
        } else {
          setUserRole(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data: roleData }) => {
            setUserRole(roleData as UserRole | null);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Validate @icmpp.ro domain
    if (!email.endsWith('@icmpp.ro')) {
      return { error: new Error('Doar adresele de email @icmpp.ro sunt acceptate.') };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (!error && userRole?.must_change_password) {
      // Update must_change_password flag
      await supabase
        .from('user_roles')
        .update({ must_change_password: false })
        .eq('user_id', user?.id);
      
      setUserRole(prev => prev ? { ...prev, must_change_password: false } : null);
    }

    return { error: error as Error | null };
  };

  const isSuperAdmin = userRole?.role === 'super_admin';
  const isLabAdmin = userRole?.role === 'lab_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRole,
        isLoading,
        isSuperAdmin,
        isLabAdmin,
        signIn,
        signOut,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
