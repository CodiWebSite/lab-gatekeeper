import { useState } from 'react';
import { usePublications, usePublicationYears } from '@/hooks/useLaboratories';
import { BookOpen, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LabTabPublicationsProps {
  labId: string;
}

export function LabTabPublications({ labId }: LabTabPublicationsProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const { data: years, isLoading: yearsLoading } = usePublicationYears(labId);
  const { data: publications, isLoading: pubsLoading } = usePublications(labId, selectedYear);

  const isLoading = yearsLoading || pubsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-full" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!publications || publications.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nu există publicații înregistrate.</p>
      </div>
    );
  }

  // Get the display year - either selected or the most recent year from data
  const displayYear = selectedYear ?? (years && years.length > 0 ? years[0] : null);

  return (
    <div className="space-y-6">
      {/* Year filter - grid layout like in the reference image */}
      {years && years.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`year-chip min-w-[70px] text-center ${displayYear === year ? 'active' : ''}`}
            >
              {year}
            </button>
          ))}
        </div>
      )}

      {/* Year title */}
      {displayYear && (
        <h2 className="text-2xl font-heading font-bold text-center text-foreground underline underline-offset-4 decoration-2">
          {displayYear}
        </h2>
      )}

      {/* Publications list - numbered list with proper formatting */}
      <ol className="list-decimal list-outside space-y-1 pl-8 text-justify">
        {publications.map((pub) => (
          <li key={pub.id} className="pl-2 leading-relaxed">
            <span className="text-foreground">{pub.authors}</span>
            {pub.title && (
              <span className="text-foreground">, {pub.title}</span>
            )}
            {pub.journal && (
              <span className="text-primary italic">; {pub.journal}</span>
            )}
            {pub.volume && (
              <span className="text-foreground">, {pub.volume}</span>
            )}
            {pub.pages && (
              <span className="text-foreground">, {pub.pages}</span>
            )}
            <span className="text-foreground"> ({pub.year}).</span>
            {pub.doi && (
              <span className="text-muted-foreground ml-1">
                doi:{pub.doi}
              </span>
            )}
            {pub.url && !pub.doi && (
              <a
                href={pub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Link
              </a>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
