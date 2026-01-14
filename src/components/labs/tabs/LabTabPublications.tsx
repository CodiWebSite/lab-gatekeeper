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

  return (
    <div className="space-y-6">
      {/* Year filter */}
      {years && years.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedYear(null)}
            className={`year-chip ${selectedYear === null ? 'active' : ''}`}
          >
            Toate
          </button>
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`year-chip ${selectedYear === year ? 'active' : ''}`}
            >
              {year}
            </button>
          ))}
        </div>
      )}

      {/* Publications list */}
      <ol className="list-decimal list-inside space-y-0">
        {publications.map((pub, index) => (
          <li key={pub.id} className="publication-item">
            <div className="inline">
              <span className="text-foreground font-medium">{pub.authors}</span>
              {' - '}
              <span className="text-foreground">{pub.title}</span>
              {pub.journal && (
                <span className="text-muted-foreground italic">
                  , {pub.journal}
                </span>
              )}
              {pub.volume && (
                <span className="text-muted-foreground">
                  , vol. {pub.volume}
                </span>
              )}
              {pub.pages && (
                <span className="text-muted-foreground">
                  , pp. {pub.pages}
                </span>
              )}
              <span className="text-muted-foreground">
                , ({pub.year})
              </span>
              {(pub.doi || pub.url) && (
                <a
                  href={pub.doi ? `https://doi.org/${pub.doi}` : pub.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {pub.doi ? 'DOI' : 'Link'}
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
