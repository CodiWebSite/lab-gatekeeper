import { useProjects } from '@/hooks/useLaboratories';
import { FolderOpen, Calendar, User, ExternalLink, Banknote } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface LabTabProjectsProps {
  labId: string;
}

export function LabTabProjects({ labId }: LabTabProjectsProps) {
  const { data: projects, isLoading } = useProjects(labId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nu există proiecte înregistrate.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-icmpp-success text-white">Activ</Badge>;
      case 'completed':
        return <Badge variant="secondary">Finalizat</Badge>;
      case 'pending':
        return <Badge className="bg-icmpp-warning text-white">În așteptare</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div key={project.id} className="p-6 bg-card rounded-lg border border-border">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <h3 className="font-heading text-lg font-semibold text-foreground">
              {project.title}
            </h3>
            {getStatusBadge(project.status)}
          </div>

          {project.project_code && (
            <p className="text-sm text-primary font-medium mb-2">
              Cod: {project.project_code}
            </p>
          )}

          {project.description && (
            <p className="text-muted-foreground text-sm mb-4">
              {project.description}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {project.director_name && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Director: {project.director_name}</span>
              </div>
            )}

            {(project.start_date || project.end_date) && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {project.start_date && new Date(project.start_date).toLocaleDateString('ro-RO')}
                  {project.start_date && project.end_date && ' - '}
                  {project.end_date && new Date(project.end_date).toLocaleDateString('ro-RO')}
                </span>
              </div>
            )}

            {project.funding_source && (
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4" />
                <span>{project.funding_source}</span>
              </div>
            )}

            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Detalii</span>
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
