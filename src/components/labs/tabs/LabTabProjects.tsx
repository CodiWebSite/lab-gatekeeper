import { useProjects } from '@/hooks/useLaboratories';
import { FolderOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div key={project.id} className="p-6 bg-card rounded-lg border border-border">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
            {project.title}
          </h3>

          {project.description && (
            <div 
              className="text-muted-foreground prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
