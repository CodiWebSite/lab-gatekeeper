import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLaboratory } from '@/hooks/useLaboratories';
import { Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LabInfoEditor } from '@/components/admin/editors/LabInfoEditor';
import { ResearchGroupsEditor } from '@/components/admin/editors/ResearchGroupsEditor';
import { PublicationsEditor } from '@/components/admin/editors/PublicationsEditor';
import { ProjectsEditor } from '@/components/admin/editors/ProjectsEditor';
import { InfrastructureEditor } from '@/components/admin/editors/InfrastructureEditor';

export default function MyLab() {
  const { userRole } = useAuth();
  const labId = userRole?.lab_id;
  const { data: lab, isLoading } = useLaboratory(labId || null);
  const [activeTab, setActiveTab] = useState('info');

  if (!labId) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border">
        <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">
          Nu ai un laborator atribuit. Contactează administratorul.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border">
        <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">
          Laboratorul nu a fost găsit.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          {lab.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestionează informațiile laboratorului tău
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="info">Informații</TabsTrigger>
          <TabsTrigger value="groups">Grupuri</TabsTrigger>
          <TabsTrigger value="publications">Publicații</TabsTrigger>
          <TabsTrigger value="projects">Proiecte</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructură</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <LabInfoEditor lab={lab} />
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          <ResearchGroupsEditor labId={lab.id} />
        </TabsContent>

        <TabsContent value="publications" className="mt-6">
          <PublicationsEditor labId={lab.id} />
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <ProjectsEditor labId={lab.id} />
        </TabsContent>

        <TabsContent value="infrastructure" className="mt-6">
          <InfrastructureEditor labId={lab.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
