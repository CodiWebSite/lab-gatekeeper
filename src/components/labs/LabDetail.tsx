import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, FlaskConical, User, Mail, Phone, MapPin } from 'lucide-react';
import { useLaboratory } from '@/hooks/useLaboratories';
import { LabTab, LAB_TABS } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LabTabDescription } from './tabs/LabTabDescription';
import { LabTabGroups } from './tabs/LabTabGroups';
import { LabTabPublications } from './tabs/LabTabPublications';
import { LabTabProjects } from './tabs/LabTabProjects';
import { LabTabInfrastructure } from './tabs/LabTabInfrastructure';

interface LabDetailProps {
  labId: string;
}

export function LabDetail({ labId }: LabDetailProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: lab, isLoading } = useLaboratory(labId);
  
  const currentTab = (searchParams.get('tab') as LabTab) || 'descriere';

  const handleTabChange = (tab: LabTab) => {
    setSearchParams({ lab: labId, tab });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Laboratorul nu a fost găsit.</p>
        <Link to="/labs?view=list">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi la listă
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <Link to="/labs?view=list">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Toate laboratoarele
        </Button>
      </Link>

      {/* Header */}
      <div className="header-gradient rounded-xl p-6 md:p-8 text-primary-foreground">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg bg-white/10 backdrop-blur-sm overflow-hidden flex-shrink-0">
            {lab.logo_url ? (
              <img
                src={lab.logo_url}
                alt={lab.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FlaskConical className="w-12 h-12 text-white/60" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <h1 className="font-heading text-2xl md:text-3xl font-bold">
              {lab.name}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-white/90">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{lab.head_name}</span>
              </div>
              
              {lab.contact_email && (
                <a 
                  href={`mailto:${lab.contact_email}`}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>{lab.contact_email}</span>
                </a>
              )}
              
              {lab.contact_phone && (
                <a 
                  href={`tel:${lab.contact_phone}`}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{lab.contact_phone}</span>
                </a>
              )}
            </div>

            {lab.address && (
              <div className="flex items-start gap-2 text-sm text-white/80">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{lab.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex overflow-x-auto scrollbar-hide -mb-px">
          {LAB_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`tab-trigger whitespace-nowrap ${
                currentTab === tab.id ? '' : ''
              }`}
              data-state={currentTab === tab.id ? 'active' : 'inactive'}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-slide-up">
        {currentTab === 'descriere' && <LabTabDescription lab={lab} />}
        {currentTab === 'grupuri' && <LabTabGroups labId={lab.id} />}
        {currentTab === 'publicatii' && <LabTabPublications labId={lab.id} />}
        {currentTab === 'proiecte' && <LabTabProjects labId={lab.id} />}
        {currentTab === 'infrastructura' && <LabTabInfrastructure labId={lab.id} />}
      </div>
    </div>
  );
}
