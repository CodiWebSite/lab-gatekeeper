import { useState, useEffect } from 'react';
import { usePublicationYears, usePublicationEntries } from '@/hooks/useLaboratories';
import { BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { linkifyText } from '@/lib/linkify';

interface LabTabPublicationsProps {
  labId: string;
}

export function LabTabPublications({ labId }: LabTabPublicationsProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const { data: years, isLoading: yearsLoading } = usePublicationYears(labId);
  const { data: entries, isLoading: entriesLoading } = usePublicationEntries(labId, selectedYear);

  // Auto-select the first year when years are loaded
  useEffect(() => {
    if (years && years.length > 0 && selectedYear === null) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  if (yearsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-16 rounded-md" />
          ))}
        </div>
        <Skeleton className="h-8 w-32 mx-auto" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!years || years.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nu există publicații înregistrate.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Year filter - grid layout */}
      <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`year-chip min-w-[70px] text-center ${selectedYear === year ? 'active' : ''}`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Year title */}
      {selectedYear && (
        <h2 className="text-2xl font-heading font-bold text-center text-foreground underline underline-offset-4 decoration-2">
          {selectedYear}
        </h2>
      )}

      {/* Publications list */}
      {entriesLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : entries && entries.length > 0 ? (
        <ol className="list-decimal list-outside space-y-1 pl-8 text-justify">
          {entries.map((entry) => (
            <li key={entry.id} className="pl-2 leading-relaxed">
              <span 
                className="text-foreground"
                dangerouslySetInnerHTML={{ __html: linkifyText(entry.content) }}
              />
            </li>
          ))}
        </ol>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nu există publicații pentru anul {selectedYear}.</p>
        </div>
      )}
    </div>
  );
}
