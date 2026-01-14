import { useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FlaskConical, 
  LayoutDashboard, 
  Users, 
  Building2, 
  Settings, 
  LogOut,
  Key,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChangePasswordModal } from '@/components/admin/ChangePasswordModal';

export default function AdminDashboard() {
  const { user, userRole, isLoading, isSuperAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    // Force password change on first login
    if (userRole?.must_change_password) {
      setShowPasswordModal(true);
    }
  }, [userRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = isSuperAdmin
    ? [
        { icon: LayoutDashboard, label: 'Prezentare', path: '/admin' },
        { icon: Building2, label: 'Laboratoare', path: '/admin/labs' },
        { icon: Users, label: 'Utilizatori', path: '/admin/users' },
        { icon: Settings, label: 'Setări', path: '/admin/settings' },
      ]
    : [
        { icon: LayoutDashboard, label: 'Prezentare', path: '/admin' },
        { icon: Building2, label: 'Laboratorul meu', path: '/admin/my-lab' },
      ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <FlaskConical className="w-6 h-6 text-primary" />
          <span className="font-heading font-semibold">Admin ICMPP</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200
          lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-border hidden lg:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-foreground">Admin ICMPP</h1>
                <p className="text-xs text-muted-foreground">
                  {isSuperAdmin ? 'Super Admin' : 'Admin Laborator'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 mt-16 lg:mt-0">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/admin' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border space-y-2">
            <div className="px-4 py-2">
              <p className="text-sm font-medium text-foreground truncate">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {isSuperAdmin ? 'Super Admin' : 'Admin Laborator'}
              </p>
            </div>

            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3"
              onClick={() => setShowPasswordModal(true)}
            >
              <Key className="w-4 h-4" />
              Schimbă parola
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Deconectare
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        open={showPasswordModal} 
        onOpenChange={setShowPasswordModal}
        forced={userRole?.must_change_password || false}
      />
    </div>
  );
}
