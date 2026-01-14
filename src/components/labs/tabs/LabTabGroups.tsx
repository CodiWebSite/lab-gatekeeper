import { useResearchGroups } from '@/hooks/useLaboratories';
import { Users, Mail, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LabTabGroupsProps {
  labId: string;
}

export function LabTabGroups({ labId }: LabTabGroupsProps) {
  const { data: groups, isLoading } = useResearchGroups(labId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nu există grupuri de cercetare înregistrate.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.id} className="p-6 bg-card rounded-lg border border-border">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
            {group.name}
          </h3>

          {group.leader_name && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <User className="w-4 h-4" />
              <span>Lider: {group.leader_name}</span>
              {group.leader_email && (
                <>
                  <span className="text-border">•</span>
                  <a 
                    href={`mailto:${group.leader_email}`}
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" />
                    {group.leader_email}
                  </a>
                </>
              )}
            </div>
          )}

          {group.description && (
            <p className="text-muted-foreground text-sm mb-3">
              {group.description}
            </p>
          )}

          {group.members && group.members.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-2">Membri:</h4>
              <div className="flex flex-wrap gap-2">
                {group.members.map((member, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full"
                  >
                    {member}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
