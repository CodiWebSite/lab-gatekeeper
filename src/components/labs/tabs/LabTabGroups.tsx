import { useState } from 'react';
import { useResearchGroups } from '@/hooks/useLaboratories';
import { useGroupMembers, useGroupResults } from '@/hooks/useResearchGroups';
import { Users, Mail, ArrowLeft, FileText, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ResearchGroup } from '@/types/database';

interface LabTabGroupsProps {
  labId: string;
}

type GroupTab = 'tematici' | 'echipa' | 'rezultate';

export function LabTabGroups({ labId }: LabTabGroupsProps) {
  const { data: groups, isLoading } = useResearchGroups(labId);
  const [selectedGroup, setSelectedGroup] = useState<ResearchGroup | null>(null);
  const [activeTab, setActiveTab] = useState<GroupTab>('tematici');

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
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

  if (selectedGroup) {
    return (
      <GroupDetail 
        group={selectedGroup} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBack={() => {
          setSelectedGroup(null);
          setActiveTab('tematici');
        }} 
      />
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group, index) => (
        <GroupListItem 
          key={group.id} 
          group={group} 
          index={index + 1}
          onSelect={() => setSelectedGroup(group)}
        />
      ))}
    </div>
  );
}

interface GroupListItemProps {
  group: ResearchGroup;
  index: number;
  onSelect: () => void;
}

function GroupListItem({ group, index, onSelect }: GroupListItemProps) {
  const { data: members } = useGroupMembers(group.id);
  const { data: results } = useGroupResults(group.id);
  
  const hasContent = (members && members.length > 0) || (results && results.length > 0) || group.topics;

  return (
    <div className="p-4 bg-muted/30 border-l-4 border-primary">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-medium text-foreground">
            Grup {index} - {group.name}
          </h3>
          {group.leader_name && (
            <p className="text-sm text-primary mt-1">
              {group.leader_name} - {group.description ? 'Coordonator' : 'Lider grup'}
            </p>
          )}
        </div>
        {hasContent && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onSelect}
          >
            Intră
          </Button>
        )}
      </div>
    </div>
  );
}

interface GroupDetailProps {
  group: ResearchGroup;
  activeTab: GroupTab;
  setActiveTab: (tab: GroupTab) => void;
  onBack: () => void;
}

function GroupDetail({ group, activeTab, setActiveTab, onBack }: GroupDetailProps) {
  const { data: members, isLoading: membersLoading } = useGroupMembers(group.id);
  const { data: results, isLoading: resultsLoading } = useGroupResults(group.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          {group.name}
        </h2>
        {group.leader_name && (
          <p className="text-primary">
            {group.leader_name} - Coordonator
            {group.leader_email && (
              <a 
                href={`mailto:${group.leader_email}`}
                className="ml-2 text-primary hover:underline"
              >
                ({group.leader_email})
              </a>
            )}
          </p>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as GroupTab)} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="w-full justify-start bg-muted/50">
            <TabsTrigger value="tematici" className="flex-1">Tematici</TabsTrigger>
            <TabsTrigger value="echipa" className="flex-1">Echipă</TabsTrigger>
            <TabsTrigger value="rezultate" className="flex-1">Rezultate Principale</TabsTrigger>
            <TabsTrigger value="grupuri" className="flex-1" onClick={onBack}>
              Grupuri Cercetare
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="tematici" className="mt-6">
          {group.topics ? (
            <div 
              className="prose prose-sm max-w-none text-foreground"
              dangerouslySetInnerHTML={{ __html: group.topics }}
            />
          ) : group.description ? (
            <p className="text-muted-foreground">{group.description}</p>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nu există tematici definite pentru acest grup.
            </p>
          )}
        </TabsContent>

        <TabsContent value="echipa" className="mt-6">
          {membersLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : members && members.length > 0 ? (
            <div className="space-y-6">
              {members.map((member) => (
                <div key={member.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                  {member.photo_url && (
                    <img 
                      src={member.photo_url} 
                      alt={member.name}
                      className="w-20 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-foreground">{member.name}</h4>
                    {member.position && (
                      <p className="text-sm text-muted-foreground">{member.position}</p>
                    )}
                    {member.email && (
                      <a 
                        href={`mailto:${member.email}`}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </a>
                    )}
                    {member.description && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        {member.description}
                      </p>
                    )}
                  </div>
                  {member.cv_url && (
                    <a 
                      href={member.cv_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline self-start"
                    >
                      <FileText className="w-4 h-4" />
                      CV File
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nu există membri înregistrați în acest grup.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rezultate" className="mt-6">
          {resultsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : results && results.length > 0 ? (
            <div className="space-y-8">
              {results.map((result) => (
                <div key={result.id} className="space-y-4">
                  {result.title && (
                    <h4 className="font-semibold text-foreground">{result.title}</h4>
                  )}
                  {result.content && (
                    <div 
                      className="prose prose-sm max-w-none text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: result.content }}
                    />
                  )}
                  {result.image_url && (
                    <img 
                      src={result.image_url} 
                      alt={result.title || 'Rezultat cercetare'}
                      className="max-w-full h-auto rounded-lg border border-border"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nu există rezultate înregistrate pentru acest grup.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
