import { useInfrastructure } from '@/hooks/useLaboratories';
import { Wrench, Mail, ExternalLink, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LabTabInfrastructureProps {
  labId: string;
}

export function LabTabInfrastructure({ labId }: LabTabInfrastructureProps) {
  const { data: infrastructure, isLoading } = useInfrastructure(labId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (!infrastructure || infrastructure.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nu există echipamente înregistrate.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {infrastructure.map((item) => (
        <div key={item.id} className="infra-card">
          {/* Image */}
          <div className="aspect-[4/3] md:aspect-auto rounded-lg overflow-hidden bg-secondary">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center min-h-[200px]">
                <Wrench className="w-12 h-12 text-muted-foreground/40" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h3 className="font-heading text-xl font-semibold text-foreground">
              {item.name}
            </h3>

            {item.description && (
              <p className="text-muted-foreground">
                {item.description}
              </p>
            )}

            {item.specifications && (
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-2">Specificații:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {item.specifications}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              {item.responsible_name && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>Responsabil: {item.responsible_name}</span>
                </div>
              )}

              {item.responsible_email && (
                <a
                  href={`mailto:${item.responsible_email}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  <span>{item.responsible_email}</span>
                </a>
              )}

              {item.external_link && (
                <a
                  href={item.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Mai multe informații</span>
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
