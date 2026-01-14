import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useLaboratories } from '@/hooks/useLaboratories';
import { LabCard } from './LabCard';
import { Skeleton } from '@/components/ui/skeleton';

export function LabList() {
  const { data: labs, isLoading } = useLaboratories();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLabs = useMemo(() => {
    if (!labs) return [];
    if (!searchQuery.trim()) return labs;

    const query = searchQuery.toLowerCase();
    return labs.filter(
      (lab) =>
        lab.name.toLowerCase().includes(query) ||
        lab.head_name.toLowerCase().includes(query) ||
        lab.short_name?.toLowerCase().includes(query)
    );
  }, [labs, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          Laboratoarele ICMPP
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Institutul de Chimie Macromoleculară "Petru Poni" - Centru de excelență în cercetarea polimerilor
        </p>
      </div>

      {/* Search */}
      <div className="search-box max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Caută laborator sau șef de laborator..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      ) : filteredLabs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery
              ? 'Niciun laborator găsit pentru această căutare.'
              : 'Nu există laboratoare disponibile momentan.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          {filteredLabs.map((lab) => (
            <LabCard key={lab.id} lab={lab} />
          ))}
        </div>
      )}
    </div>
  );
}
