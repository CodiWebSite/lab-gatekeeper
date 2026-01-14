import { useAuth } from '@/contexts/AuthContext';
import { useLaboratories } from '@/hooks/useLaboratories';
import { Building2, Users, BookOpen, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminOverview() {
  const { isSuperAdmin, userRole } = useAuth();
  const { data: labs } = useLaboratories();

  const stats = [
    { 
      label: 'Laboratoare', 
      value: labs?.length || 0, 
      icon: Building2,
      href: isSuperAdmin ? '/admin/labs' : null,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Bine ai venit!
        </h1>
        <p className="text-muted-foreground mt-1">
          {isSuperAdmin 
            ? 'Gestionează toate laboratoarele și utilizatorii din panoul de administrare.'
            : 'Gestionează informațiile laboratorului tău.'
          }
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const content = (
            <div className="p-6 bg-card rounded-lg border border-border hover:shadow-card transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          );

          return stat.href ? (
            <Link key={stat.label} to={stat.href}>
              {content}
            </Link>
          ) : (
            <div key={stat.label}>{content}</div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Acțiuni rapide
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isSuperAdmin ? (
            <>
              <Link to="/admin/labs" className="p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors">
                <Building2 className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-medium text-foreground">Gestionează laboratoare</h3>
                <p className="text-sm text-muted-foreground">Adaugă, editează sau șterge laboratoare</p>
              </Link>
              
              <Link to="/admin/users" className="p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors">
                <Users className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-medium text-foreground">Gestionează utilizatori</h3>
                <p className="text-sm text-muted-foreground">Creează conturi pentru șefi de laborator</p>
              </Link>

              <a 
                href="/labs?view=list" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <BookOpen className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-medium text-foreground">Vezi site-ul public</h3>
                <p className="text-sm text-muted-foreground">Deschide pagina laboratoarelor</p>
              </a>
            </>
          ) : (
            <>
              <Link to="/admin/my-lab" className="p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors">
                <Building2 className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-medium text-foreground">Editează laboratorul</h3>
                <p className="text-sm text-muted-foreground">Actualizează informațiile laboratorului</p>
              </Link>

              {userRole?.lab_id && (
                <a 
                  href={`/labs?lab=${userRole.lab_id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
                >
                  <BookOpen className="w-8 h-8 text-primary mb-2" />
                  <h3 className="font-medium text-foreground">Vezi pagina publică</h3>
                  <p className="text-sm text-muted-foreground">Deschide pagina laboratorului</p>
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
