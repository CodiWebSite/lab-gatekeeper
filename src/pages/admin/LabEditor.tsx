import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLaboratory } from '@/hooks/useLaboratories';
import { ArrowLeft, Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LabInfoEditor } from '@/components/admin/editors/LabInfoEditor';
import { ResearchGroupsEditor } from '@/components/admin/editors/ResearchGroupsEditor';
import { PublicationsEditor } from '@/components/admin/editors/PublicationsEditor';
import { ProjectsEditor } from '@/components/admin/editors/ProjectsEditor';
import { InfrastructureEditor } from '@/components/admin/editors/InfrastructureEditor';

export default function LabEditor() {
  const { labId } = useParams<{ labId: string }>();
  const { isSuperAdmin } = useAuth();
  const { data: lab, isLoading } = useLaboratory(labId || null);
  const [activeTab, setActiveTab] = useState('info');

  // Only Super Admin can access this page
  if (!isSuperAdmin) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border">
        <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">
          Nu ai permisiunea să accesezi această pagină.
        </p>
        <Link to="/admin">
          <Button variant="outline" className="mt-4">
            Înapoi
          </Button>
        </Link>
      </div>
    );
  }

  if (!labId) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border">
        <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">
          ID laborator invalid.
        </p>
        <Link to="/admin/labs">
          <Button variant="outline" className="mt-4">
            Înapoi la laboratoare
          </Button>
        </Link>
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
        <Link to="/admin/labs">
          <Button variant="outline" className="mt-4">
            Înapoi la laboratoare
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/admin/labs">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Toate laboratoarele
        </Button>
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          {lab.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Editează toate informațiile laboratorului
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
