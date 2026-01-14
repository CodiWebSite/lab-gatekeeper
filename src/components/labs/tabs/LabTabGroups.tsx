import { useState } from 'react';
import { useResearchGroups } from '@/hooks/useLaboratories';
import { useGroupMembers, useGroupResults } from '@/hooks/useResearchGroups';
import { Users, Mail, FileText, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
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
  
  const hasContent = (members && members.length > 0) || (results && results.length > 0) || group.topics || group.description;

  return (
    <div className="p-4 bg-muted/30 border-l-4 border-primary">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-medium text-foreground">
            Grup {index} - {group.name}
          </h3>
          {group.leader_name && (
            <p className="text-sm text-primary mt-1">
              {group.leader_name} - Coordonator
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

  const tabs: { id: GroupTab | 'grupuri'; label: string }[] = [
    { id: 'tematici', label: 'Tematici' },
    { id: 'echipa', label: 'Echipă' },
    { id: 'rezultate', label: 'Rezultate Principale' },
    { id: 'grupuri', label: 'Grupuri Cercetare' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 justify-center border-b border-border pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => tab.id === 'grupuri' ? onBack() : setActiveTab(tab.id as GroupTab)}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
              (tab.id === activeTab || (tab.id === 'grupuri' && false))
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="text-center space-y-2 border-b border-border pb-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          {group.name}
        </h2>
        {group.leader_name && (
          <p className="text-primary">
            <a 
              href={group.leader_email ? `mailto:${group.leader_email}` : undefined}
              className={group.leader_email ? 'hover:underline' : ''}
            >
              {group.leader_name}
            </a>
            {' '}- Coordonator
          </p>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'tematici' && (
        <TopicsContent group={group} />
      )}

      {activeTab === 'echipa' && (
        <TeamContent members={members || []} isLoading={membersLoading} />
      )}

      {activeTab === 'rezultate' && (
        <ResultsContent results={results || []} isLoading={resultsLoading} />
      )}
    </div>
  );
}

function TopicsContent({ group }: { group: ResearchGroup }) {
  // Check if content has HTML tags
  const hasHtmlContent = group.topics && /<[a-z][\s\S]*>/i.test(group.topics);

  // Convert plain text to HTML preserving line breaks and whitespace
  const formatPlainText = (text: string): string => {
    // Convert newlines to <br> tags and preserve multiple spaces
    return text
      .replace(/\n/g, '<br>')
      .replace(/  /g, '&nbsp;&nbsp;');
  };

  return (
    <div className="space-y-6">
      {/* Description paragraph */}
      {group.description && (
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {group.description}
        </p>
      )}

      {/* Topics / Main Research Fields */}
      {group.topics && (
        <div className="space-y-4">
          <div 
            className="prose prose-sm max-w-none text-foreground
              prose-headings:font-bold prose-headings:text-foreground prose-headings:mt-6 prose-headings:mb-3
              prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
              prose-li:text-foreground
              prose-strong:font-bold
              prose-a:text-primary prose-a:hover:underline"
            dangerouslySetInnerHTML={{ 
              __html: hasHtmlContent ? group.topics : formatPlainText(group.topics) 
            }}
          />
        </div>
      )}

      {!group.description && !group.topics && (
        <p className="text-center text-muted-foreground py-8">
          Nu există tematici definite pentru acest grup.
        </p>
      )}
    </div>
  );
}

function TeamContent({ members, isLoading }: { members: any[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nu există membri înregistrați în acest grup.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <div key={member.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
          {member.photo_url && (
            <img 
              src={member.photo_url} 
              alt={member.name}
              className="w-20 h-24 object-cover rounded flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0 space-y-1">
            <h4 className="font-semibold text-foreground">{member.name}</h4>
            <div className="text-sm text-muted-foreground">
              {member.position && <span>{member.position}</span>}
              {member.position && member.email && <span> / </span>}
              {member.email && (
                <a 
                  href={`mailto:${member.email}`}
                  className="text-primary hover:underline"
                >
                  {member.email}
                </a>
              )}
            </div>
            {member.description && (
              <p className="text-sm text-muted-foreground italic mt-2">
                {member.description}
              </p>
            )}
          </div>
          {member.cv_url && (
            <a 
              href={member.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline self-start flex-shrink-0"
            >
              <FileText className="w-4 h-4" />
              CV File
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

function ResultsContent({ results, isLoading }: { results: any[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nu există rezultate înregistrate pentru acest grup.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {results.map((result) => (
        <div key={result.id} className="space-y-4">
          {result.title && (
            <h4 className="font-bold text-foreground">{result.title}</h4>
          )}
          {result.content && (
            <div 
              className="prose prose-sm max-w-none text-foreground
                prose-ul:list-disc prose-ul:pl-6
                prose-li:text-foreground
                prose-strong:font-bold
                prose-a:text-primary prose-a:hover:underline"
              dangerouslySetInnerHTML={{ __html: result.content }}
            />
          )}
          {result.image_url && (
            <img 
              src={result.image_url} 
              alt={result.title || 'Rezultat cercetare'}
              className="max-w-full h-auto rounded-lg border border-border mx-auto"
            />
          )}
        </div>
      ))}
    </div>
  );
}
